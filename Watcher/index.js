const fs = require("fs").promises;
const os = require('os');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const winston = require("winston");
const express = require("express");

puppeteer.use(stealthPlugin());
const logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) => {
                return `${timestamp} [${level}]: ${message}`;
            })
        ),
        transports: [
            new winston.transports.Console(),  // 输出到控制台
            new winston.transports.File({ filename: 'app.log' })  // 输出到文件
        ]
    });

async function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

class Options{

    constructor(page) {
        this.page = page
    }

    async keyInput(strings){
        const arr = [...strings];
        for (const s of arr) {
            await this.page.keyboard.press(s);
            console.log(s)
        }
    }

    async xfind(xpath,timeout){
        try {
            return await this.page.waitForXPath(xpath, {timeout: timeout});
        }catch (e) {
            return null;
        }

    }



    async find(selector,timeout){
        try {
            return await this.page.waitForSelector(selector, {timeout: timeout});
        }catch (e) {
            return null;
        }

    }
    async xclick(xpath){
        const ele = await this.page.waitForXPath(xpath,{ visible: true, clickable: true });
        await ele.click();
        await sleep(Constants.USER_WAITING)
    }


    async click(selector){
        const ele = await this.page.waitForSelector(selector,{ visible: true, clickable: true });
        await ele.click(selector)
        await sleep(Constants.USER_WAITING)
    }

    async clear(selector){
        const input = await this.page.waitForSelector(selector);
        await input.click({ clickCount: 3 })
        await input.type("");
    }

    async xwrite(xpath, text, replace=true){
        const input = await this.page.waitForXPath(xpath);
        if (replace){
             await input.click({ clickCount: 3 })
        }
        await input.type(text);
    }

    async write(selector, text, replace=true){
        const input = await this.page.waitForSelector(selector);
        if (replace){
             await input.click({ clickCount: 3 })
        }
        await input.type(text);
    }





    async waitWrite(selector, text){
        const ele = await this.page.waitForSelector(selector);
        let input;
        do {
            await ele.type(text);
            input = await ele.evaluate(ele => {
                return ele.value;
            })
        }while (input !== text)
    }

}

class Config {
  static get USER_WAITING(){
      return 2000
  }

  static get IS_LOGIN(){
      return '#headingText';
  }

  static get ALREAY_LOGIN_XPATH(){
      return '/html/body/div[1]/div[1]/div[2]/div/div[2]/div/div/div[2]/div/div[1]/div/form/span/section/div/div/div/div/ul/li[1]/div/div[1]/div/div[3]'
  }
  static get ALREAY_LOGIN2_XPATH(){
      return 'const alreayLoginAccount = await this.options.xfind(Constants.ALREAY_LOGIN_XPATH,5000);'
  }
  static get GMAIL_URL(){
    return 'https://accounts.google.com'
  }
  static get GMAIL_ACCOUNT_INPUT() {
    return '#identifierId';
  }

   static get GMAIL_ACCOUNT_ERROR() {
    return '#yDmH0d > c-wiz > div > div.eKnrVb > div > div.j663ec > div > form > span > section > div > div > div.d2CFce.cDSmF.cxMOTc > div > div.LXRPh > div.dEOOab.RxsGPe > div';
  }


  static get GMAIL_PASS_INPUT() {
    return '#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input';
  }

  static get GMAIL_PASS_ERROR() {
    return '#yDmH0d > c-wiz > div > div.eKnrVb > div > div.j663ec > div > form > span > section:nth-child(2) > div > div > div.SdBahf.Fjk18.Jj6Lae > div.OyEIQ.uSvLId > div:nth-child(2)';
  }

  static get YOUTUBE_URL(){
      return 'https://www.youtube.com'
  }
}

class YouTuber{
    processes = []

    constructor(page) {
        this.page = page
        this.options = new Options(page)
        this.handler(this.processes)
    }

    static async createAsyncInstance(options) {
        const page = await YouTuber.asyncInitialization(options)
        return new this(page);
    }

    static async asyncInitialization(options){
        const browser = await puppeteer.launch(options);
        const page =  await browser.newPage();
        page.on('dialog', async (dialog) => {
            await dialog.accept(); // 关闭对话框
        });
        const client = await page.target().createCDPSession();
        //设置下载路径
        client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: __dirname
        });
        await YouTuber.__disguise(page);
        return page
    }

    static async __disguise(page){
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'plugins', {
                get: () => [
            {
                0: {type: "application/x-google-chrome-pdf", suffixes: "pdf", description: "Portable Document Format", enabledPlugin: Plugin},
                description: "Portable Document Format",
                filename: "internal-pdf-viewer",
                length: 1,
                name: "Chrome PDF Plugin"
            },
            {
                0: {type: "application/pdf", suffixes: "pdf", description: "", enabledPlugin: Plugin},
                description: "",
                filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
                length: 1,
                name: "Chrome PDF Viewer"
            },
            {
                0: {type: "application/x-nacl", suffixes: "", description: "Native Client Executable", enabledPlugin: Plugin},
                1: {type: "application/x-pnacl", suffixes: "", description: "Portable Native Client Executable", enabledPlugin: Plugin},
                description: "",
                filename: "internal-nacl-plugin",
                length: 2,
                name: "Native Client"
            }
            ],
          });
        });
        await page.evaluateOnNewDocument(() => {
        window.navigator.chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {}};
        });
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")
    }

    async __checkFileExistence(filePath) {
        try {
            // 使用 fs.access 方法进行异步检查文件是否存在
            await fs.access(filePath, fs.constants.F_OK);
            return true
        } catch (err) {
            return false;
        }
    }

    async download(url,newFileName=null){
        /**
         * 经过测试该方法在容器中失效
         */
        await this.page.evaluate(async (url,newFileName) => {
            const a = document.createElement('a');
            a.href = url;
            a.download =newFileName
            a.click();
          },url,newFileName);
        let isFinish = false;
        const now = Date.now();
        const fileName = decodeURIComponent(path.basename(url));
        while (!isFinish) {
            await sleep(Config.USER_WAITING)
            isFinish = await self.__checkFileExistence(fileName);
        }
        if (newFileName){
            await fs.rename(fileName,newFileName);
        }
          // 记录一下耗时
        console.log(`文件下载完成: time=${Date.now() - now}`);
    }

    async trySetCookie(cookies){
        if (cookies === "")return false;
        await this.page.deleteCookie();
        cookies = JSON.parse(cookies);
        await this.page.setCookie(...cookies);
        await this.page.goto(Config.YOUTUBE_URL);
        const expr = await this.options.find(Config.IS_LOGIN,2.5 * Config.USER_WAITING);
        return expr == null;
    }

    async _onHandler(i, result){}
    async _secLogin(){
        const alreayLoginAccount = await this.options.xfind(Config.ALREAY_LOGIN_XPATH,2.5 * Config.USER_WAITING);
        if (alreayLoginAccount){
            await sleep(Config.USER_WAITING);
            await alreayLoginAccount.click();
            return true
        }
        const alreayLogin2Account = await this.options.xfind(Config.ALREAY_LOGIN2_XPATH,2.5 * Config.USER_WAITING);
        if (alreayLogin2Account){
            await sleep(Config.USER_WAITING);
            await alreayLogin2Account.click();
            return true
        }
         return false
    }

    async login(account, password){
        await this.page.goto(Config.GMAIL_URL);
        let badInput
        const  sec = await this._secLogin()
        if (!sec){
            await this.options.write(Config.GMAIL_ACCOUNT_INPUT,account,false)
            await this.page.keyboard.press('Enter');
            badInput = await this.options.find(Config.GMAIL_ACCOUNT_ERROR,2.5 * Config.USER_WAITING);
            if (badInput) {
                console.log('邮箱错误');
                return false
            }
        }
        await sleep(3000);
        await this.options.write(Config.GMAIL_PASS_INPUT,password,false)
        await this.page.keyboard.press('Enter');
        badInput = await this.options.find(Config.GMAIL_PASS_ERROR,2.5 * Config.USER_WAITING);
        if (badInput) {
            console.log('密码错误');
            return false
        }
        return true
    }

    handler(processes = []){
        /**
         * 重写该类
         */
    }



    async execute(meta){
        for (let i=0;i<this.processes.length; i++) {
            const result = await this.processes[i](this.page,this.options,meta);
            await this._onHandler(i,result);
        }
    }
}

class Constants{
    static get PLAY_VIDEO_XPATH(){
        return "/html/body/ytd-app/div[1]/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[1]/div[2]/div/div/ytd-player/div/div/div[6]/button"
    }

    static get PLAY_DOWN_XPATH(){
        return "/html/body/ytd-app/div[1]/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[1]/div[2]/div/div/ytd-player/div/div/div[30]/div[2]/div[1]/button"
    }
}
class YoutubeWatcher extends YouTuber{
      // 构造函数
    constructor(page) {
        super(page);
    }

    async test(page ,options, meta = {}){
        await page.goto(meta["video"]);
        await options.xclick(Constants.PLAY_VIDEO_XPATH);
    }


    handler(processes = []) {
        processes.push(this.test)
    }

    async watch(meta){
        try {
            await this.execute(meta);
        }catch (e) {
            logger.error(e)
        }
    }
}

// 获取系统信息
const userOS = os.platform();
let executablePath
// 检测特定操作系统
if (userOS.toLowerCase().includes('win')) {
   executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
} else {
   executablePath = 'google-chrome-stable'
}
if(process.argv[3]) executablePath = process.argv[2]
const app = express();

async function createWatcher(){
    const youtube = await YoutubeWatcher.createAsyncInstance({headless:false,executablePath:executablePath,
timeout: 60000,args:['--disable-web-security','--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,960','--lang=zh-CN']})
    return  new YoutubeWatcher(youtube.page);
}


app.listen(8080, async () => {
    const watchers = []
    const accounts = []
    const videos = []
    const data = await fs.readFile(path.join(__dirname,'account.txt'), 'utf8')
    const lines = data.split('&'); // 按行分割内容
    lines.forEach(line => {
            const [username, password] = line.split('|'); // 按 | 分割用户名和密码
            accounts.push({username,password})
    });
    const data2 = await fs.readFile(path.join(__dirname,'video.txt'), 'utf8')
    const lines2 = data2.split('|'); // 按行分割内容
    lines2.forEach(line => {
            videos.push(line)
    });

    logger.info(`videos: ${videos}`);
    console.log(`account: ${JSON.stringify(accounts)}`);
    let videoCopy = [];
    for(let i=0;i<accounts.length;i++)
    setTimeout(async ()=>{
        const watcher = await createWatcher();
        watchers.push(watcher)
        const {username,password} = accounts[i]
        //登入
        await watcher.login(username,password)
        while (true){
            if(videoCopy.length === 0){
                videoCopy = videoCopy.concat(videos);
            }
            const video = videoCopy.pop()
            await watcher.watch({video:video});
            let pageTitle = await watcher.page.title();
            logger.info(`${username}正在播放${pageTitle}`);
            let isVideoEnded;
            if(video.includes('list')){
                do {
                    // 监视视频状态
                    let title = await watcher.page.title();
                    if (title !== pageTitle){
                        logger.info(`${username}播放${pageTitle}完成`);
                        pageTitle = title;
                    }
                    isVideoEnded = await watcher.options.xfind(Constants.PLAY_DOWN_XPATH,Config.USER_WAITING);
                }while (!isVideoEnded);
                logger.info(`${username}播放列表完成`);
            }else {
                do {
                    // 监视视频状态
                    isVideoEnded = await watcher.options.xfind(Constants.PLAY_DOWN_XPATH,Config.USER_WAITING);
                }while (!isVideoEnded);
                logger.info(`${username}播放${pageTitle}完成`);
            }
        }
    },0)
    app.get('/look/:id',async (req, res) => {
        const id = req.params.id;
        await watchers[id]?.page.screenshot({ path: 'screenshot.png' })
        res.sendFile(path.join(__dirname,'screenshot.png'));
    });
    app.get('/log',(rep,res)=>{
        res.sendFile(path.join(__dirname,'app.log'))
    });
})
