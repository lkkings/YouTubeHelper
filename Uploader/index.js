const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const assert = require("assert");
const fs = require("fs");
const WebSocket = require('ws');
const express = require('express');
const axios = require('axios');
const app = express();
const path = require('path');
const winston = require("winston");



puppeteer.use(stealthPlugin());

//日志
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

async function download(fileUrl,localFilePath) {
  try {
    const response = await axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream', // 指定响应类型为流
    });
    // 创建一个可写流，并将文件数据写入本地文件
    const writer = fs.createWriteStream(localFilePath);
    response.data.pipe(writer);
    // 等待文件写入完成
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    console.log('File downloaded successfully.');
    return true
  } catch (error) {
    console.error('Error downloading file:');
    return false
  }
}

async function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
class Constants {
  // 静态属性定义常量
  static get COOKIES(){
      return 'cookies.json'
  }

  static get USER_WAITING(){
      return 2000
  }

  static get UPLOAD_PROGRESS_DOWN(){
      return '上传完毕';
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

  static get YOUTUBE_UPLOAD_URL(){
      return 'https://www.youtube.com/upload'
  }

  static get INPUT_FILE_VIDEO(){
      return '#content > input[type=file]'
  }

  static get INPUT_FILE_PIC(){
      return '#file-loader'
  }

  static get TITLE_INPUT_XPATH(){
      return '/html/body/ytcp-uploads-dialog/tp-yt-paper-dialog/div/ytcp-animatable[1]/ytcp-ve/ytcp-video-metadata-editor/div/ytcp-video-metadata-editor-basics/div[1]/ytcp-video-title/ytcp-social-suggestions-textbox/ytcp-form-input-container/div[1]/div[2]/div/ytcp-social-suggestion-input/div'
  }

  static get DESC_INPUT_XPATH(){
      return '/html/body/ytcp-uploads-dialog/tp-yt-paper-dialog/div/ytcp-animatable[1]/ytcp-ve/ytcp-video-metadata-editor/div/ytcp-video-metadata-editor-basics/div[2]/ytcp-video-description/div/ytcp-social-suggestions-textbox/ytcp-form-input-container/div[1]/div[2]/div/ytcp-social-suggestion-input/div'
  }

  static get PLAY_LIST_DROPDOWN(){
      return '#basics > div:nth-child(11) > div.compact-row.style-scope.ytcp-video-metadata-editor-basics > div:nth-child(1) > ytcp-video-metadata-playlists > ytcp-text-dropdown-trigger > ytcp-dropdown-trigger > div > div.left-container.style-scope.ytcp-dropdown-trigger > span';
  }

  static get PLAY_LIST_SEARCH(){
      return '#search-input'
  }

  static get SEARCH_DELETE(){
      return '#search > ytcp-icon-button > tp-yt-iron-icon'
  }

  static get PLAY_ITEM_EXITS_XPATH(){
      return '/html/body/ytcp-playlist-dialog/tp-yt-paper-dialog/ytcp-checkbox-group/div/div'
  }

  static get PLAY_LIST_ITEM(){
      return '#checkbox-label-0 > span'
  }

  static get CREATE_PLAY_ITEM_BUTTON(){
      return '#dialog > div.action-buttons.style-scope.ytcp-playlist-dialog > div > ytcp-button > div'
  }

  static get OPEN_CREATE_ITEM_BUTTON(){
      return '#text-item-0 > ytcp-ve > tp-yt-paper-item-body > div > div > div > yt-formatted-string'
  }

  static get ITEM_TITLE_INPUT_XPATH(){
      return '/html/body/ytcp-playlist-creation-dialog/ytcp-dialog/tp-yt-paper-dialog/div[2]/div/ytcp-playlist-metadata-editor/div/div[1]/ytcp-social-suggestions-textbox/ytcp-form-input-container/div[1]/div[2]/div/ytcp-social-suggestion-input/div'
  }

   static get ITEM_DESC_INPUT_XPATH(){
      return '/html/body/ytcp-playlist-creation-dialog/ytcp-dialog/tp-yt-paper-dialog/div[2]/div/ytcp-playlist-metadata-editor/div/div[2]/ytcp-social-suggestions-textbox/ytcp-form-input-container/div[1]/div[2]/div/ytcp-social-suggestion-input/div';
  }

  static get CREATE_ITEM_BUTTON(){
      return '#create-button > div';
  }

  static get PLAY_LIST_DOWN(){
      return '#dialog > div.action-buttons.style-scope.ytcp-playlist-dialog > ytcp-button.done-button.action-button.style-scope.ytcp-playlist-dialog > div'
  }

  static get NOT_MADE_FOR_KIDS_LABEL_XPATH(){
      return '/html/body/ytcp-uploads-dialog/tp-yt-paper-dialog/div/ytcp-animatable[1]/ytcp-ve/ytcp-video-metadata-editor/div/ytcp-video-metadata-editor-basics/div[5]/ytkc-made-for-kids-select/div[4]/tp-yt-paper-radio-group/tp-yt-paper-radio-button[2]/div[1]'
  }

  static get MADE_FOR_KIDS_LABEL_XPATH(){
      return '/html/body/ytcp-uploads-dialog/tp-yt-paper-dialog/div/ytcp-animatable[1]/ytcp-ve/ytcp-video-metadata-editor/div/ytcp-video-metadata-editor-basics/div[5]/ytkc-made-for-kids-select/div[4]/tp-yt-paper-radio-group/tp-yt-paper-radio-button[1]/div[1]';
  }

  static get TAGS_INPUT_XPATH(){
      return '/html/body/ytcp-uploads-dialog/tp-yt-paper-dialog/div/ytcp-animatable[1]/ytcp-ve/ytcp-video-metadata-editor/div/ytcp-video-metadata-editor-advanced/div[5]/ytcp-form-input-container/div[1]/div/ytcp-free-text-chip-bar/ytcp-chip-bar/div/input'
  }

  static get MORE_BUTTON(){
      return '#toggle-button'
  }

  static get OPEN_TYPE_BUTTON(){
      return '#category'
  }

  static get TYPE_LIST_BOX_XPATH(){
      return '/html/body/ytcp-text-menu/tp-yt-paper-dialog/tp-yt-paper-listbox'
  }

  static get TYPE_ITEM_XPATH(){
      return "//yt-formatted-string[text()='{type}']"
  }

  static get NEXT_BUTTON(){
      return "#next-button"
  }
  static get UPLOAD_PROGRESS(){
      return '#dialog > div > ytcp-animatable.button-area.metadata-fade-in-section.style-scope.ytcp-uploads-dialog > div > div.left-button-area.style-scope.ytcp-uploads-dialog > ytcp-video-upload-progress > span'
  }

   static get PUBLIC_BUTTON_XPATH(){
      return '/html/body/ytcp-uploads-dialog/tp-yt-paper-dialog/div/ytcp-animatable[1]/ytcp-uploads-review/div[2]/div[1]/ytcp-video-visibility-select/div[2]/tp-yt-paper-radio-group/tp-yt-paper-radio-button[3]/div[1]'
  }

  static get SCHEDULE_BUTTON_XPATH(){
      return '/html/body/ytcp-uploads-dialog/tp-yt-paper-dialog/div/ytcp-animatable[1]/ytcp-uploads-review/div[2]/div[1]/ytcp-video-visibility-select/div[3]/tp-yt-paper-radio-button/div[1]'
  }

  static get SCHEDULE_DATE_TEXTBOX(){
      return '#datepicker-trigger > ytcp-dropdown-trigger > div > div.left-container.style-scope.ytcp-dropdown-trigger > span'
  }

  static get SCHEDULE_DATE_INPUT_XPATH(){
      return '/html/body/ytcp-date-picker/tp-yt-paper-dialog/div/form/tp-yt-paper-input/tp-yt-paper-input-container/div[2]/div/iron-input/input'
  }

  static get SCHEDULE_DATE_INPUT2_XPATH(){
      return '/html/body/ytcp-uploads-dialog/tp-yt-paper-dialog/div/ytcp-animatable[1]/ytcp-uploads-review/div[2]/div[1]/ytcp-video-visibility-select/div[3]/ytcp-visibility-scheduler/div[1]/ytcp-datetime-picker/div/div[2]/form/ytcp-form-input-container/div[1]/div/tp-yt-paper-input/tp-yt-paper-input-container/div[2]/div/iron-input/input'
  }

  static get DONE_BUTTON(){
      return '#done-button'
  }
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
        await this.page.waitForSelector(selector,{ visible: true, clickable: true });
        await this.page.click(selector)
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

class YoutubeUploader{
      // 构造函数
    constructor(page) {
        this.page = page
        this.options = new Options(page)
        this.Process = {
        SET_VIDEO: async (value)=>{
            const uploadVideo = await this.page.waitForSelector(Constants.INPUT_FILE_VIDEO);
            await uploadVideo.uploadFile(value);
            let flag;
            do {
                await sleep(Constants.USER_WAITING);
                const uploadProgress = await this.options.find(Constants.UPLOAD_PROGRESS,Constants.USER_WAITING);
                let info = await uploadProgress.evaluate(ele=>ele.textContent);
                logger.log('info', info);
                flag = info.includes(Constants.UPLOAD_PROGRESS_DOWN);
            }while (!flag)
            logger.log('info', "视频上传完毕");
        },
        SET_PIC: async (value)=>{
            try {
                const uploadPic = await this.options.find(Constants.INPUT_FILE_PIC,5 * Constants.USER_WAITING);
                await uploadPic.uploadFile(value)
                logger.log('info', "预览图设置完成");
            }catch (e) {
                logger.log('error', "预览图设置失败，可能为短视频或者您没有权限");
            }
        },
        SET_TITLE: async (value)=>{
            await this.options.xwrite(Constants.TITLE_INPUT_XPATH,value);
            logger.log('info', "标题设置完成");
        },
        SET_DESC: async (value)=>{
            await this.options.xwrite(Constants.DESC_INPUT_XPATH,value);
            logger.log('info', "详情设置完成");
        },
        SET_PLAY_LIST: async (value) =>{
            await this.options.click(Constants.PLAY_LIST_DROPDOWN)
            await this.options.waitWrite(Constants.PLAY_LIST_SEARCH, value);
            let item = await this.options.xfind(Constants.PLAY_ITEM_EXITS_XPATH,Constants.USER_WAITING);
            if (item){
                await this.options.click(Constants.SEARCH_DELETE)
                await this.options.click(Constants.CREATE_PLAY_ITEM_BUTTON);
                await this.options.click(Constants.OPEN_CREATE_ITEM_BUTTON);
                await this.options.xwrite(Constants.ITEM_TITLE_INPUT_XPATH,value)
                await this.options.click(Constants.CREATE_ITEM_BUTTON);
                await this.options.waitWrite(Constants.PLAY_LIST_SEARCH, value);
            }else {
                await this.options.click(Constants.PLAY_LIST_ITEM);
            }
            await this.options.click(Constants.PLAY_LIST_DOWN);
             logger.log('info', "播放列表设置完成");
        },
        SET_KID: async (value)=>{
            const flag = value === "no"? Constants.NOT_MADE_FOR_KIDS_LABEL_XPATH:Constants.MADE_FOR_KIDS_LABEL_XPATH;
            await this.options.xclick(flag)
            await this.options.click(Constants.MORE_BUTTON);
             logger.log('info', "是否儿童设置完成");
        },
        SET_TAGS: async (value)=>{
            await this.options.xwrite(Constants.TAGS_INPUT_XPATH,value.join(","))
            await this.page.keyboard.press('Enter');
              logger.log('info', "标签设置完成");
        },
        SET_TYPE: async (value)=>{
            await this.options.click(Constants.OPEN_TYPE_BUTTON)
            const typeListBox = await this.page.waitForXPath(Constants.TYPE_LIST_BOX_XPATH);
            const typeItems = await typeListBox.$x(Constants.TYPE_ITEM_XPATH.replace("{type}",value));
            assert.ok(typeItems.length !== 0,"未知类型")
            await typeItems[0].click();
                 logger.log('info', "设置类别完成");
        } ,
        SET_SCHEDULE: async (value)=>{
            await this.options.click(Constants.NEXT_BUTTON);
            await this.options.click(Constants.NEXT_BUTTON);
            await this.options.click(Constants.NEXT_BUTTON);
            if (value === "now"){
                await this.options.xclick(Constants.PUBLIC_BUTTON_XPATH)
            }else {
                const date = value.split(" ");
                await this.options.xclick(Constants.SCHEDULE_BUTTON_XPATH)
                await this.options.click(Constants.SCHEDULE_DATE_TEXTBOX)
                await this.options.xwrite(Constants.SCHEDULE_DATE_INPUT_XPATH, date[0])
                await this.page.keyboard.press("Enter");
                await this.options.xwrite(Constants.SCHEDULE_DATE_INPUT2_XPATH, date[1])
                await this.page.keyboard.press("Enter");
            }
            logger.log('info', "日程表设置完成");
        }
    };
        this.Handler = {
            "videoFile": this.Process.SET_VIDEO,
            "videoPic": this.Process.SET_PIC,
            "title": this.Process.SET_TITLE,
            "desc": this.Process.SET_DESC,
            "playList": this.Process.SET_PLAY_LIST,
            "isKid": this.Process.SET_KID,
            "tags": this.Process.SET_TAGS,
            "type": this.Process.SET_TYPE,
            "schedule": this.Process.SET_SCHEDULE
        }
    }


    static async createAsyncInstance(options) {
        const page = await YoutubeUploader.asyncInitialization(options)
        return new YoutubeUploader(page)
    }

    static async asyncInitialization(options){
        const browser = await puppeteer.launch(options);
        const page =  await browser.newPage();
        page.on('dialog', async (dialog) => {
                  logger.log('info', `捕获到对话框消息: ${dialog.message()}`);
            await dialog.accept(); // 关闭对话框
        });
        await YoutubeUploader.__disguise(page);
        return page
    }

    static async __disguise(page) {
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

    async trySetCookie(cookiesStr){
        if (cookiesStr === "")return false;
        try {
            const cookies = JSON.parse(cookiesStr);
            for (const cookie of cookies) {
                await this.page.setCookie(cookie);
            }
            await this.page.reload();
            await this.page.goto(Constants.YOUTUBE_UPLOAD_URL);
            const expr = await this.options.find(Constants.IS_LOGIN,2.5 * Constants.USER_WAITING);
            if (expr){
                this.page.deleteCookie();
            }
            return expr == null;
        }catch (e) {
            return false;
        }
    }


    async secLogin(){
        const alreayLoginAccount = await this.options.xfind(Constants.ALREAY_LOGIN_XPATH,2.5 * Constants.USER_WAITING);
        if (alreayLoginAccount){
            await sleep(Constants.USER_WAITING);
            await alreayLoginAccount.click();
            return true
        }
        const alreayLogin2Account = await this.options.xfind(Constants.ALREAY_LOGIN2_XPATH,2.5 * Constants.USER_WAITING);
        if (alreayLogin2Account){
            await sleep(Constants.USER_WAITING);
            await alreayLogin2Account.click();
            return true
        }
         return false
    }
    async login(account, password){
        await this.page.goto(Constants.GMAIL_URL);
        let badInput
        const  sec = await this.secLogin()
        if (!sec){
            await this.options.write(Constants.GMAIL_ACCOUNT_INPUT,account,false)
            await this.page.keyboard.press('Enter');
            badInput = await this.options.find(Constants.GMAIL_ACCOUNT_ERROR,2.5 * Constants.USER_WAITING);
            if (badInput) {
                console.log('邮箱错误');
                return false
            }
        }
        await sleep(3000);
        await this.options.write(Constants.GMAIL_PASS_INPUT,password,false)
        await this.page.keyboard.press('Enter');
        badInput = await this.options.find(Constants.GMAIL_PASS_ERROR,2.5 * Constants.USER_WAITING);
        if (badInput) {
            console.log('密码错误');
            return false
        }
        return true
    }

    async upload(meta){
        try {
            await this.page.goto(Constants.YOUTUBE_UPLOAD_URL);
            const keys = Object.keys(this.Handler);
            for (const key of keys) {
                if (meta[key]){
                    await this.Handler[key](meta[key]);
                }
            }
            await this.options.click(Constants.DONE_BUTTON);
            logger.log('info', '视频发布/预发布完成');
        }catch (e) {
            throw e;
        }
    }
}

class WebSocketServer{

    constructor(uploader,ws,interval) {
        this.uploader = uploader;
        this.ws = ws;
        this.timer = null;
        this.interval = interval
    }

    async connect(){
        await this.__tryConnect()
    }

    async __setTimer(){
        clearTimeout(this.timer);
        this.timer = setTimeout(async ()=>await this.__tryConnect(),this.interval)
    }

    async __tryConnect(){
        console.log("尝试连接中.....")
        let ws = new WebSocket(this.ws);
        ws.on('open', () => {
              logger.log('info', 'WebSocket 连接已建立');
        });
        ws.on('message', async (data) => {
          // 二进制数据，将其转换为字符串
          const messageStr = data.toString('utf8');
          const message = JSON.parse(messageStr);
             let res;
             switch (message['action']) {
                case 'login':
                    console.log(messageStr)
                    if (message['type'] === 0) {
                        // cookies登入
                        res = await this.uploader.trySetCookie(message['cookies']);
                        const data = res?{action:'login'}:{action:'error',type:1,message:'cookie异常或过期，请重新登入'};
                        ws.send(JSON.stringify(data));
                    }else {
                        // 账号密码登入
                        res = await this.uploader.login(message['account'],message['password'])
                        if(res){
                            const cookies = await this.uploader.page.cookies();
                            ws.send(JSON.stringify({action:'login', cookies:cookies}));
                        }else {
                            ws.send(JSON.stringify({action:'error', type:2,message:'账号或密码错误，请重新输入'}));
                        }
                    }
                    break
                case 'upload':
                    logger.log('info', `收到消息，转换为字符串:${messageStr}`);
                    const meta = message['meta']
                    console.log("准备下载文件")
                    res = await download(meta['videoFile'],path.join(__dirname,'temp.mp4'));
                    if (!res) {
                        ws.send(JSON.stringify({action: 'error', type: 3, message: meta['videoFile'] + "下载失败"}))
                        return
                    }
                    meta['videoFile'] = path.join(__dirname,'temp.mp4')
                    res = await  download(meta['videoPic'],path.join(__dirname,'temp.png'));
                    if (!res){
                        meta['videoPic'] = "";
                    }
                    meta['videoPic'] = path.join(__dirname,'temp.png')
                    console.log("下载文件完成")
                    logger.log('info', "准备上传文件");
                    console.log()
                    try {
                        await this.uploader.upload(meta)
                        ws.send(JSON.stringify({action:'upload',meta: meta}))
                    }catch (e) {
                        ws.send(JSON.stringify({action: 'error', type: 3, message: e}))
                        logger.log('error', `上传异常:${e}`);
                        await sleep(10000)
                    }
                    fs.unlink(meta['videoFile'],()=>{})
                    fs.unlink(meta['videoPic'], ()=>{})
                    await sleep(10000)
                    break

              }
    });
        ws.on('close', async (code, reason) => {
            console.log("close")
            await this.__setTimer()
      });
        ws.on('error', async (code, reason) => {
            console.log("error")
            await this.__setTimer()
      });
    }
}

const os = require('os');

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
app.listen(process.argv[2]?process.argv[2]:8080, () => {
     console.log(`static sources Server is running on port 8080`);
     // executablePath: 'google-chrome-stable'
    YoutubeUploader.createAsyncInstance({headless:false,executablePath:executablePath
, timeout: 60000,args: [
'--disable-web-security','--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,960','--lang=zh-CN'
]})
    .then(async uploader => {
        //用于监控
        app.get('/look',async (req, res) => {
            await uploader.page.screenshot({ path: 'screenshot.png' })
            res.sendFile(path.join(__dirname,'screenshot.png'));
        });
        app.get('/log',(rep,res)=>{
            res.sendFile(path.join(__dirname,'app.log'))
        })
        const wsurl = "ws://127.0.0.1:8765";
        const interval = 3000;
        const server = new WebSocketServer(uploader,wsurl,interval);
        await server.connect();
    })
});




