'use strict'

const { app, BrowserWindow, ipcMain } = require('electron')

const linkDigest = require('./lib/youtube-link')
const DownloadManager = require('./lib/download-manager')

require('electron-reload')(__dirname)

let win
const manager = new DownloadManager()

ipcMain.on('add-link', (e, newUrl) => {
  const videoId = linkDigest.getVideoId(newUrl)
  const playlistId = linkDigest.getPlaylistId(newUrl)
  console.log({ newUrl, videoId, playlistId })

  if (!videoId && !playlistId) {
    e.sender.send('add-link-error')
    return
  }

  // priority to playlist
  let addingPromise
  if (playlistId) {
    addingPromise = manager.addPlaylistToQueue(playlistId)
  } else {
    addingPromise = manager.addVideoToQueue(videoId)
  }

  addingPromise
    .then((newItems) => e.sender.send('add-link-success', newItems))
    .catch((error) => {
      console.log(error)
      e.sender.send('add-link-error', error)
    })
})

function createWindow () {
  win = new BrowserWindow({ width: 800, height: 600 })
  win.loadFile('renderer/main.html')

  // win.webContents.openDevTools()

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
