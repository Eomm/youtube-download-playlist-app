'use strict'

const { app, BrowserWindow, ipcMain } = require('electron')

const linkDigest = require('./lib/youtube-link')

require('electron-reload')(__dirname)

let win

ipcMain.on('add-link', (e, newUrl) => {
  const videoId = linkDigest.getVideoId(newUrl)
  const playlistId = linkDigest.getPlaylistId(newUrl)
  console.log({ newUrl, videoId, playlistId })

  if (!videoId && !playlistId) {
    e.sender.send('add-link-error')
    return
  }

  // TODO: read the url info (video data)
  e.sender.send('add-link-success', 'foo bar')
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
