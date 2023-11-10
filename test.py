import subprocess
import threading

# 设置端口号
port = 8000

# 使用 subprocess 启动静态资源服务器，并在后台运行

def a():
    try:
        subprocess.run(['python', '-m', 'http.server', str(port)], shell=True)
    except subprocess.CalledProcessError as e:
        print(f"启动静态资源服务器时出错：{e}")