import subprocess

import Util

cfg = Util.Config().check()
subprocess.run(['python', '-m', 'http.server', str(cfg["port"])], shell=True)