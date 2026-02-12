# 项目部署与分享指南

本项目支持多种部署方式。为了方便分享给他人（制作成二维码），推荐使用 **Cloudflare Pages**（国内访问更稳定）或 **Vercel**。

## 方案一：永久公网部署（推荐送礼使用）

由于 `vercel.app` 域名在国内部分地区无法直接访问，**强烈推荐使用 Cloudflare Pages**，或者绑定自己的域名。

### 方式 A：使用 Cloudflare Pages (推荐，国内可访问)

Cloudflare Pages 类似于 Vercel，但它的默认域名 `*.pages.dev` 在国内通常可以正常访问，无需 VPN。

1.  **注册账号**：访问 [Cloudflare Dashboard](https://dash.cloudflare.com/sign-up) 并注册（如果已有账号直接登录）。
2.  **连接 GitHub**：
    *   在左侧菜单点击 **"Workers & Pages"**。
    *   点击 **"Create Application"** (创建应用)。
    *   点击 **"Pages"** 标签页。
    *   点击 **"Connect to Git"**。
    *   选择你的 `birthday-gift` 仓库。
3.  **配置部署**：
    *   **Project name**: 保持默认或修改。
    *   **Production branch**: `main`。
    *   **Framework preset**: 选择 **Vite**。
    *   点击 **"Save and Deploy"**。
4.  **获取链接**：
    *   部署完成后，你会获得一个 `https://xxxx.pages.dev` 的网址。
    *   **用这个网址去生成二维码**，手机通常可以直接打开。

### 方式 B：使用 Vercel (简单，但需 VPN)

如果你和收到礼物的人都有 VPN，或者你在国外，Vercel 是最简单的选择。

1.  登录 [Vercel](https://vercel.com/)。
2.  点击 **"Add New..."** -> **"Project"**。
3.  导入 GitHub 仓库。
4.  点击 **"Deploy"**。
5.  获取 `vercel.app` 后缀的链接。

---

## 方案二：本地局域网预览（临时测试）

如果你只想在**同一 WiFi 下**用手机快速查看效果：

1. 打开终端。
2. 运行命令：
   ```bash
   npm run dev
   ```
3. 终端内会自动生成一个二维码，手机扫描即可访问。
   > **注意**：手机必须和电脑连接同一个 WiFi 才能访问。

---

## 方案三：宝塔面板/Docker 部署

如果你有自己的服务器，可以使用以下方式（见原文档）。

### 宝塔面板部署
（...原宝塔部署内容...）

### Docker 部署
（...原Docker部署内容...）
