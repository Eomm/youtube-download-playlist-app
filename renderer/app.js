
const $ = require('jquery')
const { ipcRenderer } = require('electron')

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

  // Send URL to main process via IPC
  ipcRenderer.send('add-link', newUrl)
}

function urlError () {
  $('#add-button').removeClass('is-loading')
  $('#url-input')
    .addClass('is-danger')
    .prop('disabled', false)
}

ipcRenderer.on('add-link-success', (e, items) => {
  // Add item to items array
  // items.toreadItems.push(item)

  // Save items
  // items.saveItems()

  // Add item
  // items.addItem(item)

  // Close and reset modal
  $('#url-input').prop('disabled', false)
  $('#add-button').removeClass('is-loading')
})

ipcRenderer.on('add-link-error', urlError)

// Bindings
$('#add-button').click(handleAddUrl)
$('#url-input').keyup((e) => { if (e.key === 'Enter') { $('#add-button').click() } })
