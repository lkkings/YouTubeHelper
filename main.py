import websockets

import DB
import Util

uploader = None

config = None


async def cookie_error():
    # 第一次登录的时候就填一下
    account = ""
    password = ""
    await uploader.send(Util.json.dumps({"action": "login", "account": account, "password": password}))


ErrorHandler = {
    1: cookie_error
}


def init_load(profile):
    pass


async def uploader_handler(websocket):
    global uploader
    Util.progress.print(f"YouTube上传器已连接: {websocket.remote_address}")
    Util.log.error(f"YouTube上传器已连接: {websocket.remote_address}")
    uploader = websocket
    Util.connect_event.set()
    await uploader.send(Util.json.dumps({'action': 'cookie', 'data': config['cookie1']}))
    try:
        async for message in uploader:
            # 处理客户端发送的消息
            Util.progress.print(f'message:{message}')
            message = Util.json.loads(message)
            action = message['action']
            if action == 'error':
                await ErrorHandler.get(message["type"])()
            elif action == 'login':
                Util.Config().save1(message['cookies'])
                Util.login_event.set()
            elif action == 'ok':
                async with Util.condition:
                    Util.condition.notify_all()
                meta = message['data']
                DB.uploadMapper.addRecord(meta['sec_uid'], meta['name'])
                Util.progress.print(f'{meta["videoFile"]}上传成功')
                Util.log.info(f'{meta["videoFile"]}上传成功')
                if config['del']:
                    video_dir = Util.Path(meta["videoFile"]).parent
                    Util.shutil.rmtree(video_dir)

    except websockets.ConnectionClosedError as e:
        Util.progress.print(e)
        Util.log.error(e)

    finally:
        Util.close_event.set()
        Util.progress.print('YouTube上传器断开连接')
        Util.log.error('YouTube上传器断开连接')


async def listener_handler():
    """
    逻辑处理可自己更改
    :return:
    """
    print("listener_handler")
    await Util.login_event.wait()
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
        meta = {'videoFile': message['videoFile'], 'isKid': 'no', 'videoPic': message['cover']
            , 'sec_uid': message['sec_uid'], 'name': name}
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
        rule = config['rule']
        meta['schedule'] = rule
        if rule != 'now':
            cur_weekday = Util.get_cur_weekday()
            target_time = rule.get(cur_weekday)
            if target_time:
                date = Util.get_cur_near_time(target_time)
                meta['schedule'] = f'{date} {target_time}'
        await uploader.send(Util.json.dumps({"action": "meta", "data": meta}))
        async with Util.condition:
            await Util.condition.wait()


def run(cmd):
    loop = Util.asyncio.get_event_loop()
    if not config["uploader"]:
        Util.progress.print("未启动YouTube上传器，仅开启下载模式")
    else:
        uploader = websockets.serve(uploader_handler, "0.0.0.0", 8765)
        loop.run_until_complete(uploader)
        Util.progress.print("YouTube上传器开启")
    profile = Util.Profile(cmd)
    init_load(profile)
    downloader = loop.create_task(profile.get_Profile())
    listener = loop.create_task(listener_handler())
    loop.run_until_complete(downloader)
    loop.run_until_complete(listener)
    loop.run_forever()


if __name__ == '__main__':
    cmd = Util.Command()
    config = cmd.config_dict
    run(cmd)
