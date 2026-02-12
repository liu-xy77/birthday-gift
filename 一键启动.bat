@echo off
chcp 65001
title 生日礼物启动器
color 0b
echo.
echo ========================================================
echo        ★  正在开启通往 3D 记忆宇宙的通道  ★
echo ========================================================
echo.

cd /d "%~dp0"

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0c
    echo [错误] 未检测到 Node.js 环境！
    echo 请先安装 Node.js (https://nodejs.org/)
    pause
    exit
)

REM 检查依赖是否存在
if not exist node_modules (
    echo [系统] 检测到首次运行...
    echo [1/2] 正在安装依赖库（可能需要几分钟，请耐心等待）...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        color 0c
        echo [错误] 依赖安装失败，请检查网络连接。
        pause
        exit
    )
)

echo [系统] 环境检查完毕。
echo [2/2] 正在启动 3D 渲染引擎...
echo.
echo [提示] 请保持此窗口开启，浏览器将自动弹出...
echo.

REM 预先打开浏览器
start "" "http://localhost:5173"

REM 启动开发服务器
call npm run dev
