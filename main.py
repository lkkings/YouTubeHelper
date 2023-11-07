import time

import websockets

import DB
import Util

uploader = None

config = None


class ErrorHandler:

    def __init__(self):
        self.event_map = {1: self.cookie_error,
                          2: self.account_or_passwod_error,
                          3: self.upload_error}

    async def cookie_error(self):
        account = Util.prompt("Google 账号")
        password = Util.prompt("Google 密码")
        await uploader.send(Util.json.dumps({"action": "login", "account": account, "password": password, "type": 1}))

    async def account_or_passwod_error(self):
        account = Util.prompt("Google 账号")
        password = Util.prompt("Google 密码")
        await uploader.send(Util.json.dumps({"action": "login", "account": account, "password": password, "type": 1}))
        Util.progress.print("等待验证中...")

    async def upload_error(self):
        async with Util.upload_down:
            Util.upload_down.notify_all()

    async def handler(self, type, message):
        if self.event_map.get(type):
            Util.progress.print(message)
            Util.log.error(message)
            await Util.asyncio.sleep(3)
            await self.event_map.get(type)()


def init_load():
    # 连接数据库
    DB.nickMapper.connect()
    DB.uploadMapper.connect()
    pass


async def uploader_handler(websocket):
    global uploader
    Util.progress.print(f"YouTube上传器已连接: {websocket.remote_address}")
    Util.log.error(f"YouTube上传器已连接: {websocket.remote_address}")
    uploader = websocket
    error_handler = ErrorHandler()
    # 先尝试使用cookie登入
    await uploader.send(Util.json.dumps({'action': 'login', 'type': 0, 'cookies': config['cookie1']}))
    try:
        async for message in uploader:
            # 处理客户端发送的消息
            Util.progress.print(f'message:{message}')
            message = Util.json.loads(message)
            action = message['action']
            if action == 'error':
                # 各种错误类型处理
                await error_handler.handler(message['type'], message['message'])
            elif action == 'login':
                # 表示登入成功
                Util.Config().save1(message.get('cookies'))
                Util.progress.print("验证成功")
                async with Util.auth_down:
                    Util.auth_down.notify_all()
            elif action == 'upload':
                async with Util.upload_down:
                    Util.upload_down.notify_all()
                meta = Util.json.loads(message['meta'])
                DB.uploadMapper.addRecord(meta['sec_uid'], meta['name'])
                Util.progress.print(f'{meta["videoFile"]}上传成功')
                Util.log.info(f'{meta["videoFile"]}上传成功')
                if config['del']:
                    video_dir = Util.Path(meta["videoFile"]).parent
                    Util.shutil.rmtree(video_dir)

    except websockets.ConnectionClosedError as e:
        Util.close_event.set()
        Util.progress.print(e)
        Util.log.error(e)
    finally:
        async with Util.upload_down:
            Util.upload_down.notify_all()
        Util.progress.print('YouTube上传器断开连接')
        Util.log.error('YouTube上传器断开连接')


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
    if config['uploader'].lower() == 'no':
        return
    # 使用了上传器就必须等待验证成功
    async with Util.auth_down:
        await Util.auth_down.wait()
    while not Util.close_event.is_set():
        message = await Util.queue.get()
        print(message)
        directory_parts = message['videoFile'].split(Util.os.path.sep)
        name = directory_parts[-3] + ":" + directory_parts[-2]
        if DB.uploadMapper.existRecord(message['sec_uid'], name):
            Util.progress.print(f"{directory_parts[-2]}已上传")
            continue
        if not Util.os.path.exists(message['videoFile']):
            Util.progress.print(f"文件{message['videoFile']}缺失,准备删除文件夹{directory_parts[-2]}")
            Util.shutil.rmtree(directory_parts[-2])
            continue
        meta = {'videoFile': message['videoFile'], 'videoPic': message['cover']
            , 'sec_uid': message['sec_uid'], 'name': name}
        meta = work_processing(meta, message)
        rule = config['rule']
        if rule != 'now':
            cur_weekday = Util.get_cur_weekday()
            target_time = rule.get(cur_weekday)
            if target_time:
                date = Util.get_cur_near_time(target_time)
                meta['schedule'] = f'{str(date)} {target_time}'
            else:
                meta['schedule'] = 'now'
        await uploader.send(Util.json.dumps({"action": "upload", "meta": meta}))
        # 等待上一个视频上传完
        async with Util.upload_down:
            await Util.upload_down.wait()


def run(cmd):
    loop = Util.asyncio.get_event_loop()
    if not config["uploader"]:
        Util.progress.print("未启动YouTube上传器，仅开启下载模式")
    else:
        uploader = websockets.serve(uploader_handler, "0.0.0.0", 8765)
        loop.run_until_complete(uploader)
        Util.progress.print("YouTube上传器等待连接")
    init_load()
    profile = Util.Profile(cmd)
    downloader = loop.create_task(profile.get_Profile())
    listener = loop.create_task(listener_handler())
    loop.run_until_complete(downloader)
    loop.run_until_complete(listener)
    loop.run_forever()


if __name__ == '__main__':
    cmd = Util.Command()
    config = cmd.config_dict
    run(cmd)
