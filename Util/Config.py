#!/usr/bin/env python
# -*- encoding: utf-8 -*-

import Util


class Config:

    def __init__(self):
        self.default = {
            'uid': 'https://v.douyin.com/k9NXNcH/',
            'uploader': 'yes',
            'del': 'yes',
            'cover': 'yes',
            'desc': 'yes',
            'path': 'Download',
            'mode': 'post',
            'naming': '{create}_{desc}',
            'cookie': '请扫码登录，cookie会自动保存',
            'cookie1': 'Google账号密码登入，cookie会自动保存',
            'rule': 'new',
            'interval': 'all',
            'limit': 'all',
            'max_connections': 10,
            'max_tasks': 10
        }

    def check(self):
        """
        检查配置文件，不存在就生成默认配置文件
        Returns:
            self.cf: 配置文件对象
        """

        if Util.os.path.isfile("conf.ini"):
            # 用utf-8防止出错
            self.cf = Util.ConfigObj('conf.ini', encoding='utf-8')
        else:
            Util.progress.console.print('[  提示  ]:没有检测到配置文件，生成中!\r')
            Util.log.info('[  提示  ]:没有检测到配置文件，生成中!')
            try:
                # 实例化读取配置文件
                self.cf = Util.ConfigObj('conf.ini', encoding='utf-8')
                # 往配置文件写入内容
                self.cf['uid'] = self.default['uid']
                # 添加注释
                self.cf.comments['uid'] = ['',
                                           '用户主页(非视频链接)']
                self.cf['uploader'] = self.default['uploader']
                self.cf.comments['uploader'] = ['',
                                              '是否启动YouTube上传器(yes|no)']
                self.cf['del'] = self.default['del']
                self.cf.comments['del'] = ['',
                                           '上传成功后是否删除(yes|no)']
                self.cf['cover'] = self.default['cover']
                self.cf.comments['cover'] = ['',
                                             '视频封面保存(yes|no)']
                self.cf['desc'] = self.default['desc']
                self.cf.comments['desc'] = ['',
                                            '视频文案保存(yes|no)']
                self.cf['path'] = self.default['path']
                self.cf.comments['path'] = ['',
                                            '作品保存位置，只支持相对路径',
                                            '不了解不用修改']
                self.cf['mode'] = 'post'
                self.cf.comments['mode'] = ['',
                                            '下载模式(post|like|collection)',
                                            '下载他人喜欢页、收藏视频请确保是开放所有人可见',
                                            '如果是扫码登陆的下载自己的喜欢与收藏则无需设置所有人可见']
                self.cf['naming'] = '{create}_{desc}'
                self.cf.comments['naming'] = ['',
                                              '全局作品文件命名',
                                              '{create}发布时间、{desc}作品文案、{id}作品id',
                                              '只允许下划线_ 减号- 作为文件名间隔符', ]
                self.cf['cookie'] = self.default['cookie']
                self.cf.comments['cookie'] = ['',
                                              '抖音或TikTok账号cookie'
                                              '置空该选项本程序会自动打开二维码获取cookie',
                                              '本程序不会共享、存储、处理、加密、上传你的cookie配置',
                                              '请妥善保管你个人的cookie信息，发issues贴log文件的时候注意脱敏，防止泄露！']
                self.cf['cookie1'] = self.default['cookie1']
                self.cf.comments['cookie'] = ['',
                                              'Google账号cookie'
                                              '置空该选项本程序会要求您输入账号密码',
                                              '本程序不会共享、存储、处理、加密、上传你的cookie配置',
                                              '请妥善保管你个人的cookie信息，发issues贴log文件的时候注意脱敏，防止泄露！']
                self.cf['rule'] = self.default['rule']
                self.cf.comments['rule'] = ['',
                                            '指定YouTube上传时间策略',
                                            '例如Monday[22:00] Tuesday[10:00]，表示当天是星期一就晚上22:00发布，当天是星期二就10:00发布，空格隔开',
                                            '填now就是随即发布']

                self.cf['interval'] = self.default['interval']
                self.cf.comments['interval'] = ['',
                                                '根据作品发布日期区间下载作品',
                                                '例如2022-01-01|2023-01-01下载的是2022年所有作品',
                                                '填all即是下载全部时间']

                self.cf['max_connections'] = 10
                self.cf.comments['max_connections'] = ['',
                                                       '网络请求并发连接数',
                                                       '不宜设置过大，如遇错误可适当降低']
                self.cf['max_tasks'] = 10
                self.cf.comments['max_tasks'] = ['',
                                                 '异步的任务数',
                                                 '不宜设置过大，如遇错误可适当降低']

                # 写入到文件
                self.cf.filename = 'conf.ini'
                self.cf.write()
                Util.progress.console.print('[  配置  ]:配置文件生成成功!\r')
                Util.log.info('[  配置  ]:配置文件生成成功!')

            except Exception as writeiniError:
                Util.progress.console.print('[  配置  ]:配置文件写入失败!\r')
                Util.log.error('[  配置  ]:配置文件写入失败! %s' % writeiniError)

        # 验证配置文件
        is_valid, message = validate_config(self.cf)
        if is_valid:
            self.cf['rule'] = self._parse(self.cf['rule'])
            Util.progress.console.print(message)
            return self.cf
        else:
            Util.progress.console.print(message)
            input('[  配置  ]:按任意键退出。')
            exit(0)
        return self.cf

    def _parse(self,rule):
        if rule == 'now':
            return 'now'
        # 使用正则表达式来提取星期和时间
        pattern = r'(\w+)\[(\d+:\d+)\]'
        matches = Util.re.findall(pattern, rule)
        # 创建字典
        rule = {}
        for day, time in matches:
            rule[day] = time
        return rule

    def save1(self, cookie1) -> None:
        if not cookie1:
            return
        if Util.os.path.isfile("conf.ini"):
            # 用utf-8防止出错
            self.cf = Util.ConfigObj('conf.ini', encoding='utf-8')
            self.cf['cookie1'] = cookie1
            # 写入到文件
            self.cf.filename = 'conf.ini'
            self.cf.write()
            Util.progress.console.print('[  配置  ]:cookie更新成功!\r')
            Util.log.info('[  配置  ]:cookie更新成功!')
            Util.log.info(cookie1)
        else:
            self.check()
        return self.cf

    def save(self, cookie) -> None:
        if not cookie:
            return
        if Util.os.path.isfile("conf.ini"):
            # 用utf-8防止出错
            self.cf = Util.ConfigObj('conf.ini', encoding='utf-8')
            self.cf['cookie'] = cookie
            # 写入到文件
            self.cf.filename = 'conf.ini'
            self.cf.write()
            Util.progress.console.print('[  配置  ]:cookie更新成功!\r')
            Util.log.info('[  配置  ]:cookie更新成功!')
            Util.log.info(cookie)
        else:
            self.check()

        return self.cf


def validate_config(config):
    """
    验证配置文件的有效性

    Args:
        config (dict): 从配置文件读取的键值对。

    Returns:
        tuple: (bool, str)。如果配置有效，返回(True, "[  配置  ]: 所有配置验证成功")。
            如果配置无效，返回(False, 错误信息)。
    """

    # 错误信息
    errors = []

    # 验证 uid
    uid = config.get('uid', '')
    if not uid.startswith('https://') and not uid.startswith('http://'):
        errors.append('[  配置  ]:uid 不是一个有效的网络链接')

    # 验证 yes/no 设置
    for key in ['cover', 'desc', 'del', 'uploader']:
        value = config.get(key, '').lower()
        if value not in ['yes', 'no']:
            errors.append(f'[  配置  ]:{key} 应该为 "yes" 或 "no"')

    # 验证 path
    path = config.get('path', '')
    if path.startswith('/') or ':' in path:
        errors.append('[  配置  ]:path 只能是相对路径')

    # 验证 mode
    mode = config.get('mode', '')
    if mode not in ['post', 'like', 'collection', 'wix']:
        errors.append('[  配置  ]:mode 应为 "post"、"like"、"collection"或 "wix"之一')

    # 验证 naming
    naming = config.get('naming', '')
    if not any(tag in naming for tag in ['{create}', '{desc}', '{id}']):
        errors.append('[  配置  ]:naming 应至少包含 {create}、{desc} 或 {id} 中的一个。')
    else:
        stripped_naming = naming.replace('{create}', '').replace('{desc}', '').replace('{id}', '')
        if any(ch for ch in stripped_naming if ch not in ('_', '-')):
            errors.append('[  配置  ]:naming 只允许下划线_ 减号- 作为文件名间隔符')

    # 验证 interval
    interval = config.get('interval', '')
    if interval != 'all' and '|' not in interval:
        errors.append('[  配置  ]:interval 应为 "all" 或使用"|"来间隔范围，如 "2022-01-01|2023-01-01"')

    # 验证 rule
    rule = config.get('rule', '')
    if rule != 'now' and '[' not in rule:
        errors.append('[  配置  ]:rule 应为 "now" 或使用"1[10:00]"来表示发布时间，如 "1[10:00] 2[22:00]"')
    # 验证 max_connections 和 max_tasks
    for key in ['max_connections', 'max_tasks']:
        value = str(config.get(key, ''))
        if not value.isdigit():
            errors.append(f'[  配置  ]:{key} 应该为数字')

    # 如果没有错误，则配置验证成功
    if not errors:
        return True, "[  配置  ]:配置验证成功!"
    else:
        return False, "\n".join(errors)
