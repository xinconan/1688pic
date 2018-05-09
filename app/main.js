const electron = require('electron');
// Module to control application life.
const {
  app,
  Menu,
  ipcMain,
  BrowserWindow
} = electron;

const fs = require('fs');
const os = require('os');
const path = require('path');

function createWindow() {
  var opt = {
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    title: "1688图片下载器——By xinconan",
    // icon: path.join(__dirname, 'icons', 'icon.ico')
  };

  // if(process.platform=='linux'){
  //   opt.icon = path.join(__dirname, 'icons', 'icon.png');
  // }


  // Create the browser window.   http://electron.atom.io/docs/api/browser-window/
  win = new BrowserWindow(opt);

  // win.setTitle(custom.title || "OSS Browser");
  win.loadURL(`file://${__dirname}/index.html`);

  win.setMenuBarVisibility(false);


  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });


  // drawin 就是 MacOS
  if(process.env.NODE_ENV=='development'){
    console.log('开发模式');

    // Open the DevTools.
    win.webContents.openDevTools();

  }else {

    if (process.platform === 'darwin') {
      // Create the Application's main menu
      let template = getMenuTemplate();
      //注册菜单, 打包后可以复制, 但是不能打开 devTools
      Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    }
  }

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  //if (process.platform !== 'darwin') {
    app.quit();
  //}
});

// 接收下载的指令
ipcMain.on('download', (e, params)=>{
  // dist 下载的目录
  // url 下载的链接地址
  console.log(params)
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});