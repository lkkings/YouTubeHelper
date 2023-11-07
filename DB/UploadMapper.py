#!/usr/bin/env python
# -*- encoding: utf-8 -*-

import DB


class UploadMapper:
    def __init__(self) -> None:
        """
        初始化 NickMapper 对象

        Args:
            db_name (str): 昵称映射表的数据库名称
        """
        self.db_name = DB.os.path.join('DB','upload_record.db')
        self.conn = None

    def connect(self) -> None:
        """
        连接到数据库并创建昵称映射表
        """
        self.conn = DB.sqlite3.connect(self.db_name)
        self._create_table()

    def _create_table(self) -> None:
        """
        在数据库中创建昵称映射表
        """
        c = self.conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS upload_record
                    ( id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,sec_user_id TEXT,created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    def existRecord(self, sec_user_id: str, name: str):
        c = self.conn.cursor()
        # 检查用户 ID 是否已经存在
        c.execute('SELECT * FROM upload_record WHERE sec_user_id=? AND name=?', (sec_user_id, name))
        return c.fetchone()

    def addRecord(self, sec_user_id: str, name: str) -> None:
        """
        添加上传记录

        Args:
            :param sec_user_id:
            :param name:
        """
        c = self.conn.cursor()
        c.execute('INSERT INTO upload_record (sec_user_id,name) VALUES (?, ?)', (sec_user_id, name))
        self.conn.commit()

    def allRecord(self) -> None:
        """
        查询所有上传记录
        """
        c = self.conn.cursor()
        c.execute('SELECT * FROM upload_record')
        return c.fetchone()

    def close(self) -> None:
        """
        关闭与数据库的连接
        """
        if self.conn:
            self.conn.close()
