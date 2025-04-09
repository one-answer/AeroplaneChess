FROM node:18-alpine

# 创建应用目录
WORKDIR /usr/src/app

# 安装应用依赖
# 使用通配符确保 package.json 和 package-lock.json 都被复制
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD [ "node", "server.js" ]
