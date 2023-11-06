### 环境安装
1. 安装Chrome浏览器
    - `wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb`
    - `apt install ./google-chrome-stable_current_amd64.deb`
    - `google-chrome -version` （获取版本号）
2. 安装Chromedriver
    - [驱动下载地址](https://chromedriver.chromium.org/downloads)
    - 选择与驱动和系统相应的版本
    - wget https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/{version}/linux64/chromedriver-{platform}.zip
    - 解压并设置chromedriver的环境变量或把驱动文件移至项目根目录