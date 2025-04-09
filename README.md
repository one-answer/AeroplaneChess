# 飞行棋 Online

一个支持多人在线对战的飞行棋游戏，具有现代化界面和国际化支持。

## 功能特点

- 多人在线对战
- 创建和加入游戏房间
- 现代化界面设计
- 支持中文和英文
- 响应式设计，适配不同设备

## 部署指南

### 使用 Docker 部署（推荐）

#### 前提条件

- 安装了 Docker 和 Docker Compose
- CentOS 7+ / Ubuntu 18.04+ / Debian 10+

#### 步骤

1. 克隆代码库：

```bash
git clone https://your-repository-url.git
cd aeroplane-chess
```

2. 使用 Docker Compose 构建和启动：

```bash
docker-compose up -d
```

3. 访问游戏：

打开浏览器，访问 `http://your-server-ip:3000`

### 使用 CentOS 部署脚本

我们提供了自动化部署脚本，可以在 CentOS 服务器上快速部署游戏。

1. 下载部署脚本：

```bash
curl -O https://raw.githubusercontent.com/your-username/aeroplane-chess/main/deploy.sh
chmod +x deploy.sh
```

2. 运行部署脚本：

```bash
./deploy.sh
```

或者，如果您想从 Git 仓库克隆代码：

```bash
./deploy.sh --git-repo https://your-repository-url.git
```

3. 按照脚本提示完成部署。

### 使用 PM2 部署（不使用 Docker）

如果您不想使用 Docker，可以使用 PM2 部署脚本：

```bash
curl -O https://raw.githubusercontent.com/your-username/aeroplane-chess/main/deploy-pm2.sh
chmod +x deploy-pm2.sh
./deploy-pm2.sh
```

## 手动部署

### 前提条件

- Node.js 18+
- npm 或 yarn

### 步骤

1. 克隆代码库：

```bash
git clone https://your-repository-url.git
cd aeroplane-chess
```

2. 安装依赖：

```bash
npm install
```

3. 启动服务器：

```bash
node server.js
```

4. 访问游戏：

打开浏览器，访问 `http://localhost:3000`

## 配置 Nginx 反向代理

如果您想使用 Nginx 作为反向代理，可以使用以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 游戏说明

1. 进入游戏大厅，输入您的名字并选择颜色
2. 创建新房间或加入现有房间
3. 等待所有玩家准备就绪
4. 游戏开始后，轮流掷骰子和移动飞机
5. 第一个将所有飞机移动到终点的玩家获胜

## 技术栈

- 前端：HTML, CSS, JavaScript, jQuery
- 后端：Node.js, Express, Socket.IO
- 容器化：Docker, Docker Compose

## 许可证

MIT
