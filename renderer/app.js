
const $ = require('jquery')
const { ipcRenderer } = require('electron')

function handleAddUrl () {
  let newUrl = $('#url-input').val()
  if (newUrl) {
    $('#url-input')
      .removeClass('is-danger')
      .prop('disabled', true)
    $('#add-button').addClass('is-loading')

    // Send URL to main process via IPC
    ipcRenderer.send('add-link', newUrl)
  } else {
    $('#url-input').addClass('is-danger')
  }
}

ipcRenderer.on('add-link-success', (e, items) => {
  // Add item to items array
  // items.toreadItems.push(item)

  // Save items
  // items.saveItems()

  // Add item
  // items.addItem(item)

  // Close and reset modal
  $('#url-input').prop('disabled', false).val('')
  $('#add-button').removeClass('is-loading')
})

// Bindings
$('#add-button').click(handleAddUrl)
$('#url-input').keyup((e) => { if (e.key === 'Enter') { $('#add-button').click() } })
