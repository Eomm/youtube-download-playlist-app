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
