'use strict'

const { ipcRenderer, shell } = require('electron')
const { dialog } = require('electron').remote

const menu = require('./menu')
const VideoList = require('./video-list')

const videoList = new VideoList()

function loadSetting (storageId, htmlId) {
  const savedDir = localStorage.getItem(storageId)
  if (savedDir) {
    $(`#${htmlId}`).val(savedDir)
    return true
  }
  return false
}

function selectFolder (id) {
  return () => {
    const path = dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (path) {
      $(`#${id}`).val(path)
    }
  }
}

function selectFile (id) {
  return () => {
    const path = dialog.showOpenDialog()
    if (path) {
      $(`#${id}`).val(path)
    }
  }
}

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

function releaseMessage (message, url) {
  $('#info-message-text').text(message)
  $('#new-release-button').off('click').click(() => shell.openExternal(url))
  $('#info-message').removeClass('is-hidden')
}

function appendItems (e, items) {
  items.forEach(i => videoList.addItem(i))
  $('#url-input').prop('disabled', false)
  $('#add-button').removeClass('is-loading')
}

function saveSavePath () {
  const outputPath = $('#output-path').val()
  const ffmpegPath = $('#output-ffmpeg-path').val()
  let done = false
  if (outputPath && ffmpegPath) {
    done = ipcRenderer.sendSync('set-config', { outputPath, ffmpegPath })
    localStorage.setItem('download-dir', outputPath)
    localStorage.setItem('ffmpeg-dir', ffmpegPath)
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

ipcRenderer.on('new-release', (e, release) => {
  releaseMessage(`NEW RELEASE! Download the new ${release.tag_name} version!!`, release.html_url)
})

// Bindings
$('#add-button').click(handleAddUrl)
$('#url-input').keyup((e) => { if (e.key === 'Enter') { $('#add-button').click() } })
window.addEventListener('offline', () => urlError(null, 'You are offline, connect to internet'))
window.openSetting = function () {
  const settings = ipcRenderer.sendSync('get-config')
  $('#output-path').val(settings.outputPath)
  $('#output-ffmpeg-path').val(settings.ffmpegPath)
  $('#setting-modal').addClass('is-active')
}
$('.close-setting-modal').click(() => { $('#setting-modal').removeClass('is-active') })
$('#setting-button').click(saveSavePath)
$('#open-folder-button').click(selectFolder('output-path'))
$('#open-ffmpeg-button').click(selectFile('output-ffmpeg-path'))

// Startup
videoList.load()

if (loadSetting('download-dir', 'output-path') &&
loadSetting('ffmpeg-dir', 'output-ffmpeg-path')) {
  saveSavePath()
}
