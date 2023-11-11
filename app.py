import uvicorn
from fastapi import FastAPI, WebSocket
from starlette.staticfiles import StaticFiles

import DB
import Util

uploader: WebSocket


def lifespan(app):
    loop = Util.asyncio.get_event_loop()
    loop.create_task(downloader_handler())
    loop.create_task(listener_handler())
    yield
    Util.progress.print("服务关闭")


app = FastAPI(lifespan=lifespan)


@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    global uploader
    await websocket.accept()
    Util.progress.print(f"YouTube上传器已连接: {websocket.client}")
    Util.log.error(f"YouTube上传器已连接: {websocket.client}")
    uploader = websocket
    error_handler = ErrorHandler()
    # 先尝试使用cookie登入
    if cmd.config_dict['cookie1']:
        await uploader.send_text(Util.json.dumps({'action': 'login', 'type': 0, 'cookies': cmd.config_dict['cookie1']}))
    else:
        await account_password_login()
    while True:
        message = await websocket.receive_json()
        # 处理客户端发送的消息
        Util.progress.print(f'message:{message}')
        action = message['action']
        if action == 'error':
            # 各种错误类型处理
            await error_handler.handler(message)
        elif action == 'login':
            # 表示登入成功
            Util.Config().save1(message.get('cookies'))
            Util.progress.print("验证成功")
            async with Util.auth_down:
                Util.auth_down.notify_all()
        elif action == 'upload':
            meta = message['meta']
            DB.uploadMapper.addRecord(meta['sec_uid'], meta['name'])
            Util.progress.print(f'{meta["videoFile"]}上传成功')
            Util.log.info(f'{meta["videoFile"]}上传成功')
            async with Util.upload_down:
                Util.upload_down.notify_all()


async def account_password_login():
    account = Util.prompt("Google 账号")
    password = Util.prompt("Google 密码", True)
    await uploader.send_json({"action": "login", "account": account, "password": password, "type": 1})
    Util.progress.print("等待验证中...")


class ErrorHandler:

    def __init__(self):
        self.event_map = {1: self.cookie_error,
                          2: self.account_or_passwod_error,
                          3: self.upload_error}

    async def cookie_error(self,data):
        Util.Config().delete1()
        await account_password_login()

    async def account_or_passwod_error(self,data):
        await account_password_login()

    async def upload_error(self,data):
        await Util.queue.put(data)
        async with Util.upload_down:
            Util.upload_down.notify_all()

    async def handler(self, message):
        type = int(message["type"])
        if self.event_map.get(type):
            Util.progress.print(message)
            Util.log.error(message)
            await self.event_map.get(type)(message.get("data"))


def work_processing(meta, message):
    """
    可自己加工数据，可加工的数据有【title，isKid，desc，playList，tags】
    Args:
        meta:
        message:
    Returns:

    """
    meta['isKid'] = 'no'
    text = message['desc']
    match = Util.re.search(r'_(.*?)_', text)
    if match:
        meta['playList'] = match.group(1)
    text = text.replace("_", "")
    # 使用正则表达式匹配并提取标签中的内容
    tags = Util.re.findall(r'#(\w+)', text)
    meta['tags'] = tags
    title_match = Util.re.search(r'(.*?)#', text)
    meta['title'] = text
    if title_match:
        meta['title'] = title_match.group(1)
    return meta


async def listener_handler():
    """
    监听下载完成任务，只有在开启上传器时才会使用
    :return:
    """
    if cmd.config_dict['uploader'].lower() == 'no':
        Util.progress.print("未开启上传器")
        return
    # 使用了上传器就必须等待验证成功
    async with Util.auth_down:
        await Util.auth_down.wait()
    while not Util.done_event.is_set():
        message = await Util.queue.get()
        name = message['nickname'] + ':' + message['desc']
        if DB.uploadMapper.existRecord(message['sec_uid'], name):
            Util.progress.print(f"{name}已上传")
            continue
        video_path = Util.os.path.join(message['desc_path'], message['video_name'] + '.mp4')
        if not Util.os.path.exists(video_path):
            Util.progress.print(f"文件{video_path}缺失,准备删除文件夹{message['desc_path']}")
            Util.shutil.rmtree(message['desc_path'])
            continue
        directory_parts = message['desc_path'].split(Util.os.path.sep)
        rootUrl = f'{directory_parts[-3]}/{directory_parts[-2]}/{directory_parts[-1]}'
        video_path = f'{rootUrl}/{message["video_name"]}.mp4'
        pic_path = f'{rootUrl}/{message["cover_name"]}.png'
        video_url = f'http://127.0.0.1:{cmd.config_dict["port"]}/{Util.parse.quote(video_path)}'
        pic_url = f'http://127.0.0.1:{cmd.config_dict["port"]}/{Util.parse.quote(pic_path)}'
        meta = {}
        meta = work_processing(meta, message)
        meta['videoFile'] = video_url
        meta['videoPic'] = pic_url
        meta['sec_uid'] = message['sec_uid']
        meta['name'] = name
        meta['type'] = message['type']
        rule = cmd.config_dict['rule']
        if rule == 'now':
            meta['schedule'] = 'now'
        else:
            cur_weekday = Util.get_cur_weekday()
            target_time = rule(cur_weekday)
            if target_time:
                date = Util.get_cur_near_time(target_time)
                meta['schedule'] = f'{str(date)} {target_time}'
            else:
                meta['schedule'] = 'now'
        meta['schedule'] = '2023/11/12 09:00'
        await uploader.send_json({"action": "upload", "meta": meta})
        # 等待上一个视频上传完
        async with Util.upload_down:
            await Util.upload_down.wait()


async def downloader_handler():
    while not Util.done_event.is_set():
        uid = Util.prompt("请输入用户主页下载链接，回车则默认配置文件,按q则退出")
        if uid.lower() == "q":
            exit(0)
        elif not uid:
            uid = cmd.config_dict['uid']
        elif not uid.startswith('https://'):
            Util.progress.print('uid 不是一个有效的网络链接')
            continue
        cmd.cur_type = Util.prompt("请输入视频类别")
        cmd.config_dict['uid'] = uid
        profile = Util.Profile(cmd)
        await profile.get_Profile()


if __name__ == '__main__':
    cmd = Util.Command()
    app.mount("/", StaticFiles(directory=cmd.config_dict['path']), name="static")
    uvicorn.run(app, host="127.0.0.1", port=cmd.config_dict['port'], log_level="critical")
