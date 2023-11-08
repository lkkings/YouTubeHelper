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


def copy_file_to_docker(container_id, local_file_path, container_file_path):
    try:
        container = Util.client.containers.get(container_id)
        with open(local_file_path, 'rb') as file:
            container.put_archive('/', file.read(), container_file_path)
        Util.progress.print(f'复制文件成功')
        return True
    except Exception as e:
        Util.progress.print(f'[ 错误 ] copying file: {str(e)}')
        return False


def is_container_exists(container_name):
    try:
        Util.client.containers.get(container_name)
        return True
    except Exception as e:
        return False


def delete_file_from_docker(container_id,file_path):
    try:
        container = Util.client.containers.get(container_id)
        exec_result = container.exec_run(['rm', file_path])
        if exec_result.exit_code == 0:
            print(f'File {file_path} deleted in container {container_id}')
        else:
            print(f'Error deleting file: {exec_result.output.decode("utf-8")}')
    except Exception as e:
        Util.progress.print(f'[ 错误 ] del file: {str(e)}')
