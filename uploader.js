const puppeteer = require('puppeteer-extra');
const readline = require('readline');
const fs = require('fs');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const assert = require("assert");
const WebSocket = require('ws');

puppeteer.use(stealthPlugin());


// Prompt user for email and password.
async function prompt(query, hidden = false) {
    new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        try {
            if (hidden) {
                const stdin = process.openStdin();
                process.stdin.on('data', (char) => {
                    char = char + '';
                    switch (char) {
                        case '\n':
                        case '\r':
                        case '\u0004':
                            stdin.pause();
                            break;
                        default:
                            process.stdout.clearLine(0);
                            readline.cursorTo(process.stdout, 0);
                            process.stdout.write(query + Array(rl.line.length + 1).join('*'));
                            break;
                    }
                });
            }
            rl.question(query, (value) => {
                resolve(value);
                rl.close();
            });
        } catch (err) {
            reject(err);
        }
    });
}
async function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
class Constants {
  // 静态属性定义常量
  static get COOKIES(){
      return 'cookies.json'
  }

  static get UPLOAD_PROGRESS_DOWN(){
      return '已完成';
  }

  static get IS_LOGIN(){
      return '#headingText';
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

   static get PUBLIC_BUTTON(){
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

        async clear(selector){
            const input = await this.page.waitForSelector(selector);
            await input.click({ clickCount: 3 })
            await input.type("");
        }

        async write(xpath, text, replace=true){
            const input = await this.page.waitForXPath(xpath);
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
    }


    static async createAsyncInstance(options) {
        const page = await YoutubeUploader.asyncInitialization(options)
        return new YoutubeUploader(page)
    }

    static async asyncInitialization(options){
        const browser = await puppeteer.launch(options);
        const page =  await browser.newPage();
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
        try {
            const cookies = JSON.parse(cookiesStr);
          for (const cookie of cookies) {
              await this.page.setCookie(cookie);
          }
          await this.page.reload();
          await this.page.goto(Constants.YOUTUBE_UPLOAD_URL);
          const expr = await this.options.find(Constants.IS_LOGIN,1000);
          if (expr){
              this.page.deleteCookie();
          }
          return expr == null;
        }catch (e) {
            return false;
        }
    }

    // async isLogin(){
    //     if (fs.existsSync(Constants.COOKIES)){
    //         const cookiesString = fs.readFileSync(Constants.COOKIES, 'utf8');
    //         const cookies = JSON.parse(cookiesString);
    //         await this.page.reload();
    //         await this.page.goto(Constants.YOUTUBE_UPLOAD_URL);
    //         const expr = await this.options.find(Constants.IS_LOGIN,1000);
    //         if (expr){
    //             console.log("账号过期");
    //             fs.unlinkSync(Constants.COOKIES);
    //             this.page.deleteCookie();
    //         }
    //         return expr == null;
    //     }
    //     return false;
    // }
    async screenshot(ele){
        const imageBoundingBox = await ele.boundingBox();
        // 使用 page.screenshot 捕获指定区域的截图
        await this.page.screenshot({
            path: 'captcha.png',
            clip: {
                x: imageBoundingBox.x,
                y: imageBoundingBox.y,
                width: imageBoundingBox.width,
                height: imageBoundingBox.height
            }
        });
    }
    async login(account, password){
        await this.page.goto(Constants.GMAIL_URL);
        const accountInput = await this.page.waitForSelector(Constants.GMAIL_ACCOUNT_INPUT);
        await accountInput.type(account);
        await this.page.keyboard.press('Enter');
        let badInput = await this.options.find(Constants.GMAIL_ACCOUNT_ERROR,3000);
        if (badInput) {
            console.log('邮箱错误');
            return false
        }
        await sleep(3000);
        const passInput = await this.page.waitForSelector(Constants.GMAIL_PASS_INPUT);
        await passInput.type(password);
        await this.page.keyboard.press('Enter');
        badInput = await this.options.find(Constants.GMAIL_PASS_ERROR,3000);
        if (badInput) {
            console.log('密码错误');
            return false
        }
        return true
    }

    async __upload(meta){
        await this.page.goto(Constants.YOUTUBE_UPLOAD_URL);
        const keys = Object.keys(this.Handler);
        for (const key of keys) {
            if (meta[key]){
                await this.Handler[key](meta[key]);
            }
        }
        await this.page.click(Constants.DONE_BUTTON);
        console.log("视频发布/预发布完成")
    }

    async upload(meta){
        try {
            await this.__upload(meta);
            return true
        }catch (e) {
            console.log(e)
            return false
        }


    }
    Process = {
        SET_VIDEO: async (value)=>{
            const uploadVideo = await this.page.waitForSelector(Constants.INPUT_FILE_VIDEO);
            await uploadVideo.uploadFile(value);
            let flag;
            do {
                const uploadProgress = await this.options.find(Constants.UPLOAD_PROGRESS,1000);
                let info = await uploadProgress.evaluate(ele=>ele.textContent);
                console.log(info);
                flag = info.includes(Constants.UPLOAD_PROGRESS_DOWN);
            }while (!flag)
            console.log("视频上传完毕");
        },
        SET_PIC: async (value)=>{
            try {
                const uploadPic = await this.options.find(Constants.UPLOAD_PROGRESS,3000);
                await uploadPic.uploadFile(value)
                console.log("预览图设置完成");
            }catch (e) {
                console.log("预览图设置失败");
            }
        },
        SET_TITLE: async (value)=>{
            await this.options.write(Constants.TITLE_INPUT_XPATH,value);
            console.log("标题设置完成");
        },
        SET_DESC: async (value)=>{
            await this.options.write(Constants.DESC_INPUT_XPATH,value);
            console.log("详情设置完成");
        },
        SET_PLAY_LIST: async (value) =>{
            await this.page.waitForSelector(Constants.PLAY_LIST_DROPDOWN);
            await this.page.click(Constants.PLAY_LIST_DROPDOWN);
            await this.options.waitWrite(Constants.PLAY_LIST_SEARCH, value);
            let item = await this.options.xfind(Constants.PLAY_ITEM_EXITS_XPATH,1000);
            if (item){
                await this.page.click(Constants.SEARCH_DELETE);
                await this.page.click(Constants.CREATE_PLAY_ITEM_BUTTON);
                await this.page.waitForSelector(Constants.OPEN_CREATE_ITEM_BUTTON);
                await this.page.click(Constants.OPEN_CREATE_ITEM_BUTTON);
                await this.options.write(Constants.ITEM_TITLE_INPUT_XPATH,value)
                await this.page.click(Constants.CREATE_ITEM_BUTTON);
                await this.options.waitWrite(Constants.PLAY_LIST_SEARCH, value);
            }else {
                await this.page.click(Constants.PLAY_LIST_ITEM);
            }
            await this.page.click(Constants.PLAY_LIST_DOWN);
            console.log("播放列表设置完成")
        },
        SET_KID: async (value)=>{
            const flag = value === "no"? Constants.NOT_MADE_FOR_KIDS_LABEL_XPATH:Constants.MADE_FOR_KIDS_LABEL_XPATH;
            const notMadeForKid = await this.page.waitForXPath(flag);
            await notMadeForKid.click();
            await this.page.click(Constants.MORE_BUTTON);
            console.log("是否儿童设置完成")

        },
        SET_TAGS: async (value)=>{
            const input = await this.page.waitForXPath(Constants.TAGS_INPUT_XPATH);
            await input.type(value.join(","));
            await this.page.keyboard.press('Enter');
            const openType = await this.page.waitForSelector(Constants.OPEN_TYPE_BUTTON, {isClickable:true});
            await openType.click();
            const typeListBox = await this.page.waitForXPath(Constants.TYPE_LIST_BOX_XPATH);
            const typeItems = await typeListBox.$x(Constants.TYPE_ITEM_XPATH.replace("{type}","娱乐"));
            assert.ok(typeItems.length !== 0,"未知类型")
            await typeItems[0].click();
            console.log("标签设置完成")
        },
        SET_SCHEDULE: async (value)=>{
            await this.page.click(Constants.NEXT_BUTTON);
            await this.page.click(Constants.NEXT_BUTTON);
            await this.page.click(Constants.NEXT_BUTTON);
            if (value === "now"){
                const pubBtn = await this.page.waitForXPath(Constants.PUBLIC_BUTTON);
                await pubBtn.click();
            }else {
                const date = value.split(" ");
                const schBtn = await this.page.waitForXPath(Constants.SCHEDULE_BUTTON_XPATH);
                await schBtn.click();
                const opBtn = await this.page.waitForSelector(Constants.SCHEDULE_DATE_TEXTBOX);
                await opBtn.click();
                await this.options.write(Constants.SCHEDULE_DATE_INPUT_XPATH, date[0])
                await this.page.keyboard.press("Enter");
                await this.options.write(Constants.SCHEDULE_DATE_INPUT2_XPATH, date[1])
                await this.page.keyboard.press("Enter");
            }
            console.log("日程表设置完成")
        }
    };

    Handler = {
        "videoFile": this.Process.SET_VIDEO,
        "videoPic": this.Process.SET_PIC,
        "title": this.Process.SET_TITLE,
        "desc": this.Process.SET_DESC,
        "playList": this.Process.SET_PLAY_LIST,
        "isKid": this.Process.SET_KID,
        "tags": this.Process.SET_TAGS,
        "schedule": this.Process.SET_SCHEDULE
    }


}
 YoutubeUploader.createAsyncInstance({headless: 'new',args: [
'--disable-web-security','-no-sandbox', '--window-size=1280,960'
]})
    .then(async uploader => {
        const socket = new WebSocket('ws://127.0.0.1:8765');
        socket.on('open', () => {
            console.log('WebSocket 连接已打开');
        });
        socket.on('message', async (data) => {
            if (typeof data === 'string') {
                // 如果消息是字符串，直接处理
                console.log('收到字符串消息:', data);
            } else if (data instanceof Buffer) {
                // 如果消息是二进制数据，将其转换为字符串
                const messageStr = data.toString('utf8');
                const message = JSON.parse(messageStr);
                console.log('收到二进制消息，转换为字符串:', message);
                let res;
                switch (message['action']) {
                    case 'cookie':
                        res = await uploader.trySetCookie(message['data'])
                        if (!res){
                            console.log('cookie设置失败')
                            socket.send(JSON.stringify({action:'error', type:1}));
                        }else {
                             socket.send(JSON.stringify({action:'login',cookies:message['data']}));
                        }
                        break
                  case 'login':
                        res = await uploader.login(message['account'],message['password'])
                        if (!res){
                            socket.send(JSON.stringify({action:'error', type:1}));
                        }else {
                            const cookies = await uploader.page.cookies();
                            socket.send(JSON.stringify({action:'login', cookies:JSON.stringify(cookies)}));
                        }
                        break
                    case 'meta':
                         // message['data'] = {
                         //        videoFile: 'D:\\Project\\Python\\YouTobeBot\\Download\\post\\小e同学\\2023-06-15 17.32.08_#看海怎么会腻\\2023-06-15 17.32.08_#看海怎么会腻_video.mp4',
                         //        isKid: 'no',
                         //        videoPic: 'D:\\Project\\Python\\YouTobeBot\\Download\\post\\小e同学\\2023-06-15 17.32.08_#看海怎么会腻\\2023-06-15 17.32.08_#看海怎么会腻_cover.png',
                         //        sec_uid: 'MS4wLjABAAAAt7VyKvSkkHz_WufLbS8dKIR5tQwCprWUJATHh49BTRU',
                         //        name: '小e同学:2023-06-15 17.32.08_#看海怎么会腻',
                         //        tags: [ '看海怎么会腻' ],
                         //        title: '',
                         //        schedule: '1900/01/01 22:00'
                         // }

                        res = await uploader.upload(message['data'])
                        if (res){
                            socket.send(JSON.stringify({action:'ok',data: message['data']}))
                        }
                  }
              } else {
                console.log('收到未知消息类型:', data);
              }
        });
        socket.on('close', (code, reason) => {
          if (code === 1000) {
            console.log('WebSocket 连接已正常关闭');
          } else {
            console.error('WebSocket 连接意外关闭');
          }
          console.log('关闭代码:', code);
          console.log('关闭原因:', reason);
        });
        socket.on('error', (error) => {
          console.error('WebSocket 错误:', error);
        });
    })
    .catch(error => {
        console.error(error);
    });



