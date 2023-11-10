import Util


def get_cur_weekday():
    current_date = Util.datetime.datetime.now()
    return current_date.strftime("%A")


def get_cur_near_time(target_time: str, format="%Y/%m/%d"):
    current_time = Util.datetime.datetime.now().time()
    # 解析目标时间字符串
    target_time = Util.datetime.datetime.strptime(target_time, '%H:%M').time()
    # 如果当前时间大于目标时间，则返回明天的日期，否则返回今天的日期
    if current_time > target_time:
        tomorrow = Util.datetime.datetime.now() + Util.datetime.timedelta(days=1)
        next_day_date = tomorrow.strftime(format)
    else:
        next_day_date = current_time.strftime(format)
    return next_day_date
