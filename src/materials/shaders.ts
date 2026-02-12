import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

// --- Shader Material for Particle Image ---
export const ParticleMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0,
    uTexture: new THREE.Texture(),
    uDpr: 1.0,
    uAudio: 0.0 // 音频能量输入
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform float uProgress;
    uniform float uDpr;
    uniform float uAudio;
    attribute vec3 aRandomPos;
    varying vec2 vUv;

    float easeOutCubic(float x) {
      return 1.0 - pow(1.0 - x, 3.0);
    }

    void main() {
      vUv = uv;
      vec3 targetPos = position;
      
      float p = easeOutCubic(uProgress);
      vec3 pos = mix(aRandomPos, targetPos, p);
      
      // 音频律动：当粒子散开时 (p < 0.5)，随音乐微弱跳动
      // 只有在散开状态才跳动，避免影响照片清晰度
      if (p < 0.9) {
          float beat = sin(uTime * 5.0 + pos.x * 0.5) * uAudio * 0.5;
          pos.y += beat;
      }
      
      // 聚拢过程中的螺旋效果
      float angle = (1.0 - p) * 2.0;
      float s = sin(angle);
      float c = cos(angle);
      float x = pos.x * c - pos.z * s;
      float z = pos.x * s + pos.z * c;
      pos.x = x;
      pos.z = z;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // 优化的大小计算：
      float baseSize = mix(8.0, 4.0, p); 
      // 音频增强：高音部分让粒子变大变亮
      float audioScale = 1.0 + uAudio * 2.0 * (1.0 - p);
      gl_PointSize = baseSize * uDpr * audioScale * (10.0 / -mvPosition.z);
    }
  `,
  // Fragment Shader
  `
    uniform sampler2D uTexture;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(uTexture, vUv);
      if (color.a < 0.1) discard;
      
      // 圆形裁剪
      vec2 cxy = 2.0 * gl_PointCoord - 1.0;
      float r = dot(cxy, cxy);
      if (r > 1.0) discard;
      
      // 稍微增加一点透明度，避免 AdditiveBlending 过曝
      gl_FragColor = vec4(color.rgb, 0.8); 
    }
  `
)

// --- Holographic Image Material ---
export const HolographicMaterial = shaderMaterial(
  {
    uTexture: new THREE.Texture(),
    uTime: 0,
    uOpacity: 0,
    uColor: new THREE.Color('#00ffff')
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uOpacity;
    uniform vec3 uColor;
    varying vec2 vUv;

    // 圆角矩形 SDF (Signed Distance Field)
    // p: 当前点 (相对于中心), b: 矩形半宽高, r: 圆角半径
    float sdRoundedBox(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b + r;
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
    }

    void main() {
      vec4 texColor = texture2D(uTexture, vUv);
      
      // 1. 形状裁剪：圆角矩形
      // UV 从 0..1 映射到 -0.5..0.5
      vec2 p = vUv - 0.5;
      
      // 留出一点边距给发光 (0.48 而不是 0.5)
      float d = sdRoundedBox(p, vec2(0.48, 0.48), 0.05); 
      
      // d < 0 在矩形内，d > 0 在矩形外
      // 平滑边缘
      float mask = 1.0 - smoothstep(0.0, 0.02, d);
      
      // 2. 扫描线 (Scanlines) - 极淡
      float scanline = sin(vUv.y * 200.0 + uTime * 2.0) * 0.03 + 0.97;
      
      // 3. 边缘发光 (Edge Glow)
      // 仅在边缘处 (d 接近 0) 发光
      float glowIntensity = 1.0 - smoothstep(0.0, 0.02, abs(d)); 
      vec3 glow = uColor * glowIntensity * 1.5;
      
      // 4. 合成
      vec3 finalColor = texColor.rgb * scanline;
      finalColor += glow; // 叠加边缘光
      
      gl_FragColor = vec4(finalColor, texColor.a * mask * uOpacity);
    }
  `
)
