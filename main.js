'use strict'

const { app, BrowserWindow, ipcMain } = require('electron')
const windowStateKeeper = require('electron-window-state')

const linkDigest = require('./lib/youtube-link')
const DownloadManager = require('./lib/download-manager')

require('electron-reload')(__dirname)

let win
const defaultPath = app.getPath('music')
const manager = new DownloadManager(defaultPath)

ipcMain.on('add-link', (e, newUrl) => {
  const videoId = linkDigest.getVideoId(newUrl)
  const playlistId = linkDigest.getPlaylistId(newUrl)
  console.log({ newUrl, videoId, playlistId })

  if (!videoId && !playlistId) {
    e.sender.send('add-link-error', 'The link is not valid')
    return
  }

  // priority to playlist
  let addingPromise
  if (playlistId) {
    addingPromise = manager.addPlaylistToQueue(playlistId)
      .then((playlist) => { e.sender.send('add-link-success', playlist.items) })
  } else {
    addingPromise = manager.addVideoToQueue(videoId)
      .then((item) => { e.sender.send('add-link-success', item) })
  }

  addingPromise
    .catch((error) => { e.sender.send('add-link-error', error.message) })
})

ipcMain.on('start-download', (e, videoId) => {
  manager.downloadVideo(videoId)
    .catch((error) => { e.sender.send('download-error', error.message) })
})

ipcMain.on('get-config', (e) => {
  const settings = {
    outputPath: manager.downloadPath
  }
  e.returnValue = settings
})

ipcMain.on('set-config', (e, config) => {
  manager.downloadPath = config.outputPath
  e.returnValue = true
})

manager.on('download-start', (fileInfo) => {
  win.webContents.send('download-start', fileInfo)
})
manager.on('download-progress', (fileInfo) => {
  win.webContents.send('download-progress', fileInfo)
})
manager.on('download-complete', (fileInfo) => {
  win.webContents.send('download-complete', fileInfo)
})
manager.on('download-error', (fileInfoError) => {
  win.webContents.send('download-error', fileInfoError)
})

function createWindow () {
  const defaultSize = {
    defaultWidth: 1000,
    defaultHeight: 800
  }
  const mainWindowState = windowStateKeeper(defaultSize)

  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    fullscreen: mainWindowState.fullscreen,
    minWidth: defaultSize.defaultWidth,
    minHeight: defaultSize.defaultHeight
  })
  mainWindowState.manage(win)

  win.loadFile('renderer/main.html')

  win.webContents.openDevTools()

  win.on('closed', () => { win = null })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
