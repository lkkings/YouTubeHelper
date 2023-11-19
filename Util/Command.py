#!/usr/bin/env python
# -*- encoding: utf-8 -*-
import DB
import Util


class Command:

    def __init__(self):
        # 字典类型配置文件
        self.config_dict = {}
        self.account = ""
        self.password = ""
        # 全局headers
        self.dyheaders = {
            'Cookie': '',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
            'Referer': 'https://www.douyin.com/'
        }
        self.cur_type = None
        self.setting()
        self.connect_db()

    def connect_db(self):
        # 连接数据库
        DB.nickMapper.connect()
        DB.uploadMapper.connect()

    def argument(self):
        """
        获取命令行参数
        Returns:
            args: 返回命令行对象
        """
        parser = Util.argparse.ArgumentParser(
            description='YouTubeHelper 使用帮助')
        parser.add_argument('--uid', '-u', type=str,
                            help='为用户主页链接，支持长短链', required=False)
        parser.add_argument('--port', '-p', type=int,
                            help='资源服务器启动端口，默认8000',default=8000)
        parser.add_argument('--timer', '-t', type=int,
                            help='定时器，默认不开启', default=0)
        parser.add_argument('--save', '-s', type=str, help='视频保存目录，非必要参数， 默认Download', default='Download')
        parser.add_argument('--del', '-d', type=str, help='上传成功后是否删除， 默认yes 可选no', default='yes')
        parser.add_argument('--uploader', type=str, help="是否启动YouTube上传器， 默认yes 可选no", default='yes')
        parser.add_argument('--cover', type=str,
                            help='是否下载视频封面， 默认no 可选yes', default='no')
        parser.add_argument('--desc', type=str,
                            help='是否保存视频文案， 默认no 可选yes', default='no')
        parser.add_argument('--mode', '-M', type=str,
                            help='下载模式选择，默认post 可选post|like|collection', default='post')
        parser.add_argument('--naming', type=str,
                            help='作品文件命名格式，默认为{create}_{desc}', default='{create}_{desc}')
        parser.add_argument('--cookie', '-cookie', type=str,
                            help='大部分请求需要cookie，请调用扫码登录填写cookie', default='', required=False)
        parser.add_argument('--cookie1', '-cookie1', type=str,
                            help='YouTube上传需要cookie, 如何没有将进行Google登入', default='', required=False)
        parser.add_argument('--interval', '-I', type=str,
                            help='根据作品发布日期区间下载作品，例如2022-01-01|2023-01-01', default='all')
        parser.add_argument('--rule', '-r', type=str,
                            help='非必要参数， 默认now,当即发布，发布时间段规则，例如Monday[22:00] Tuesday[10:00]，表示当天是星期一就晚上22:00发布，星期二就10:00发布，空格隔开',
                            default='now')
        parser.add_argument('--limit', type=str,
                            help='仅下载多少个视频，填all即是下载全部。实际比设置多3倍', default='all')
        parser.add_argument('--max_connections', type=int,
                            help='网络请求的并发连接数，不宜设置过大', default=10)
        parser.add_argument('--max_tasks', type=int,
                            help='异步的任务数，不宜设置过大', default=10)

        return parser.parse_args()

    def setting(self):
        """
        设置配置
        Returns:
            dict: 返回字典类型配置文件
        """

        # 检查配置文件是否存在
        cfg = Util.Config().check()
        if not Util.os.path.exists(cfg["path"]):
            # 创建用户文件夹
            Util.os.makedirs(cfg["path"])

        if cfg['cookie'] == '':
            # sso登录
            login = Util.Login()
            self.dyheaders = login.loginHeaders
        else:
            self.dyheaders['Cookie'] = cfg['cookie']

        # 如果args中有任何非None的值则设置为命令行
        if len(Util.sys.argv) > 1:  # 如果命令行参数列表的长度大于1，说明有提供命令行参数
            args = self.argument()
            self.config_dict = vars(args)
            Util.progress.console.print('[  配置  ]:获取命令行完成!\r')
            Util.log.info('[  配置  ]:获取命令行完成!')
        else:
            self.config_dict = cfg
            Util.progress.console.print('[  配置  ]:读取本地配置完成!\r')
            Util.log.info('[  配置  ]:读取本地配置完成!')
