FROM node:18-slim

# 如果是国内就替换阿里云镜像
# COPY sources.list /etc/apt/sources.list

# 单独安装谷歌浏览器
RUN apt-get update
RUN apt-get install curl -y
RUN curl -LO https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN apt-get install -y ./google-chrome-stable_current_amd64.deb
RUN rm google-chrome-stable_current_amd64.deb

# 目前用的是puppeteer-core包。如果项目用的是puppeteer包，请取消下面注释。
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# 复制文件到镜像的app目录下
COPY package.json /app/
# 如果是国内就设置镜像
# RUN npm set registry http://registry.npm.taobao.org/
RUN npm install
COPY index.js /app/
# 装包
WORKDIR /app
ENTRYPOINT node index.js
