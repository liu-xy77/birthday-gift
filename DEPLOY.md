# 项目部署与分享指南

本项目支持多种部署方式。为了方便分享给他人（制作成二维码），推荐使用 **Vercel** 进行免费公网部署。

## 方案一：本地局域网预览（生成临时二维码）

如果你只想在**同一 WiFi 下**用手机快速查看效果：

1. 打开终端。
2. 运行命令：
   ```bash
   npm run dev
   ```
3. 终端内会自动生成一个二维码，手机扫描即可访问。
   > **注意**：手机必须和电脑连接同一个 WiFi 才能访问。

---

## 方案二：永久公网部署（推荐送礼使用）

如果你想将项目制作成二维码卡片送给朋友，需要将项目部署到公网。推荐使用 **Vercel**，它是免费的且速度很快。

### 1. 准备工作
- 注册一个 [GitHub](https://github.com/) 账号。
- 注册一个 [Vercel](https://vercel.com/) 账号（可以使用 GitHub 登录）。

### 2. 上传代码到 GitHub
1. 在 GitHub 上新建一个仓库（Repository），例如叫 `birthday-gift`。
2. 在本地项目根目录下运行以下命令（如果还没初始化 git）：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <你的GitHub仓库地址>
   git push -u origin main
   ```

### 3. 在 Vercel 上部署
1. 登录 Vercel Dashboard。
2. 点击 **"Add New..."** -> **"Project"**。
3. 在 "Import Git Repository" 中找到你刚才上传的 GitHub 仓库，点击 **"Import"**。
4. **Build and Output Settings** 一般保持默认即可（Vite 项目会自动识别）。
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 点击 **"Deploy"**。

### 4. 获取链接并生成二维码
1. 部署完成后，Vercel 会给你一个类似 `https://birthday-gift-xxx.vercel.app` 的域名。
2. 复制这个域名。
3. 打开二维码生成网站（如 [草料二维码](https://cli.im/)）。
4. 将域名粘贴进去，生成二维码图片。
5. 你可以将这个二维码图片打印出来，或者制作成贺卡。

---

## 方案三：宝塔面板/Docker 部署

如果你有自己的服务器，可以使用以下方式（见原文档）。

### 宝塔面板部署
（...原宝塔部署内容...）

### Docker 部署
（...原Docker部署内容...）
