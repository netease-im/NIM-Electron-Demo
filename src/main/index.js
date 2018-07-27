'use strict'

import { ipcMain, app, BrowserWindow, Tray, Menu, dialog, Notification, globalShortcut, net } from 'electron'
import pkg from '../../package.json'
import config from '../renderer/configs'
// import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
if (process.env.DEBUG_ENV === 'debug') {
  global.__static = require('path').join(__dirname, '../../static').replace(/\\/g, '\\\\')
}

let _tray
let contextMenu
let mainWindow
const loginWindowURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createMainWindow () {
  /**
   * Initial window options
   */
  if (process.platform !== 'darwin' && process.platform !== 'win32') return
  mainWindow = new BrowserWindow({
    frame: false,
    width: 882,
    height: 598,
    minWidth: 882,
    minHeight: 598,
    minimizable: true,
    maximizable: true,
    fullscreen: false,
    fullscreenable: false,
    resizable: true,
    zoomToPageWidth: false,
    webPreferences: {
      webSecurity: false
    }
  })
  mainWindow.loadURL(loginWindowURL)
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  ipcMain.on('logined', function (evt, arg) {
    createTray()
  })

  ipcMain.on('kicked', function (evt, arg) {
    destroyTray()
  })

  ipcMain.on('logout', function (evt, arg) {
    destroyTray()
  })

  ipcMain.on('onMax', () => {
    mainWindow.maximize()
  })

  ipcMain.on('onRestore', () => {
    mainWindow.restore()
  })

  ipcMain.on('onMinimize', () => {
    mainWindow.minimize()
  })

  ipcMain.on('onReceiveMsg', function (evt, arg) {
    if (mainWindow.isVisible() && mainWindow.isFocused() && arg.isCurrent) return
    var myNotification = new Notification('收到新信息', {
      body: arg.body
    })

    myNotification.onclick = () => {
      showMainWindow()
      mainWindow.loadURL(loginWindowURL + arg.href)
    }
  })

  ipcMain.on('onRegistUser', function (evt, arg) {
    let req = net.request({
      url: config.postUrl + '/api/createDemoUser',
      method: 'POST'
    })
    req.setHeader('content-type', 'application/x-www-form-urlencoded')
    req.setHeader('appkey', config.appkey)
    req.on('response', res => {
      let result = {rescode: res.statusCode}
      if (res.statusCode === 200) {
        res.on('data', (chunk) => {
          let data = JSON.parse(chunk.toString())
          result.rescode = data.res
          if (data.res === 200) {
            result.errorMsg = '注册成功，请返回登录'
          } else if (data.res === 414) {
            result.errorMsg = data.errmsg
          } else {
            result.errorMsg = data.errmsg
          }
          console.log(result.rescode)
          console.log(result.errorMsg)
          evt.sender.send('onCallbackRegistUser', result)
        })
      } else {
        result.errorMsg = '网络断开或其他未知错误(' + res.statusCode + ')'
      }
      evt.sender.send('onCallbackRegistUser', result)
    })
    req.end(arg)
  })

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('doMax')
  })
  mainWindow.on('restore', () => {
    mainWindow.webContents.send('doRestore')
  })
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('doRestore')
  })

  globalShortcut.register('CommandOrControl+F12', () => {
    mainWindow.webContents.openDevTools({mode: 'detach'})
  })
}
app.on('ready', createMainWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    destroyTray()
    app.quit()
  }
})
app.on('activate', () => {
  if (!mainWindow) {
    createMainWindow()
  }
})

const getMainWindowPosition = () => {
  const windowBounds = mainWindow.getBounds()
  const trayBounds = _tray.getBounds()
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))
  const y = Math.round(trayBounds.y + trayBounds.height - 10)

  return {
    x,
    y
  }
}

const toggleWindow = () => {
  if (!mainWindow) return
  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    showMainWindow()
  }
}

const showMainWindow = () => {
  if (!mainWindow) return
  const position = getMainWindowPosition()
  mainWindow.setPosition(position.x, position.y, false)
  mainWindow.show()
  mainWindow.focus()
}

if (process.platform === 'win32') {
  app.setAppUserModelId(pkg.build.appId)
}

if (process.env.XDG_CURRENT_DESKTOP && process.env.XDG_CURRENT_DESKTOP.includes('Unity')) {
  process.env.XDG_CURRENT_DESKTOP = 'Unity'
}

function destroyTray () {
  if (_tray) {
    _tray.destroy()
    _tray = null
  }
}

function createTray () {
  if (_tray) return
  const menubarPic = process.platform === 'darwin' ? `${__static}/img/logo.png` : `${__static}/img/logo.png`
  _tray = new Tray(menubarPic)
  _tray.setToolTip('云信Electron-Demo')
  contextMenu = Menu.buildFromTemplate([{
    label: '关于',
    click () {
      dialog.showMessageBox({
        icon: `${__static}/img/logo.png`,
        title: '关于云信',
        message: 'Electron Demo',
        detail: `版本: alpha-${pkg.version}`
      })
    }
  },
  {
    role: 'quit',
    label: '退出'
  }
  ])
  _tray.on('right-click', () => {
    _tray.popUpContextMenu(contextMenu)
  })
  _tray.on('click', () => {
    if (process.platform === 'darwin') {
      toggleWindow()
    } else {
      if (mainWindow) {
        mainWindow.show()
      }
    }
  })
}
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
