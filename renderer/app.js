'use strict'

const { ipcRenderer } = require('electron')
const { dialog } = require('electron').remote

const menu = require('./menu')
const VideoList = require('./video-list')

const videoList = new VideoList()

function handleAddUrl () {
  let newUrl = $('#url-input').val()
  if (!newUrl) {
    urlError()
    return
  }

  $('#add-button').addClass('is-loading')
  $('#url-input')
    .removeClass('is-danger')
    .prop('disabled', true)
  $('#error-message').addClass('is-hidden')

  // Send URL to main process via IPC
  ipcRenderer.send('add-link', newUrl)
}

function urlError (e, error) {
  $('#add-button').removeClass('is-loading')
  $('#url-input')
    .addClass('is-danger')
    .prop('disabled', false)
  if (error) {
    $('#error-message')
      .text(`Error: ${error}`)
      .removeClass('is-hidden')
  }
}

function appendItems (e, items) {
  items.forEach(i => videoList.addItem(i))
  $('#url-input').prop('disabled', false)
  $('#add-button').removeClass('is-loading')
}

function saveSavePath () {
  const value = $('#output-path').val()
  let done = false
  if (value) {
    done = ipcRenderer.sendSync('set-config', { outputPath: value })
    localStorage.setItem('download-dir', value)
  }
  if (!done) {
    urlError(null, 'The selected folder is not valid')
  }
  $('.close-setting-modal').click()
}

// Bindings IPC
ipcRenderer.on('add-link-success', appendItems)
ipcRenderer.on('add-link-error', urlError)

ipcRenderer.on('download-start', (e, progress) => {
  videoList.updateItem(progress.id, 0)
})
ipcRenderer.on('download-progress', (e, progress) => {
  videoList.updateItem(progress.id, progress.percent)
})
ipcRenderer.on('download-complete', (e, progress) => {
  videoList.updateItem(progress.id, 100)
})
ipcRenderer.on('download-error', (e, progress) => {
  urlError(null, progress.result)
  videoList.updateItem(progress.id, -1)
})

// Bindings
$('#add-button').click(handleAddUrl)
$('#url-input').keyup((e) => { if (e.key === 'Enter') { $('#add-button').click() } })
window.addEventListener('offline', () => urlError(null, 'You are offline, connect to internet'))
window.openSetting = function () {
  const settings = ipcRenderer.sendSync('get-config')
  $('#output-path').val(settings.outputPath)
  $('#setting-modal').addClass('is-active')
}
$('.close-setting-modal').click(() => { $('#setting-modal').removeClass('is-active') })
$('#setting-button').click(saveSavePath)
$('#open-folder-button').click(() => {
  const path = dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (path) {
    $('#output-path').val(path)
  }
})

// Startup
videoList.load()

const savedDir = localStorage.getItem('download-dir')
if (savedDir) {
  $('#output-path').val(savedDir)
  saveSavePath()
}
