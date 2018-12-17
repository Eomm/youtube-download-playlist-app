
const { ipcRenderer } = require('electron')
const $ = require('jquery')

class VideoList {
  constructor () {
    this.items = []
  }

  load () {
    this.items = JSON.parse(localStorage.getItem('video-list')) || []
    this.items.forEach((i) => this.renderItem(i))
  }
  saveItems () {
    localStorage.setItem('video-list', JSON.stringify(this.items))
  }

  addItem (item) {
    this.items.push(item)
    this.saveItems()
    this.renderItem(item)
  }

  renderItem (item) {
    $('#no-items').hide()

    // New item html
    const downloadBtnId = `download-button-${item.id}`
    const deleteBtnId = `delete-button-${item.id}`
    let itemHTML = `
      <div class="card-content" id="${item.id}">
        <div class="media">
          <div class="media-left">
            
            <p class="control">
              <a class="button is-info is-medium" id="${downloadBtnId}">
                <span class="icon is-small"> <i class="fa fa-download"></i> </span>
              </a>
              <a class="button is-danger is-medium" id="${deleteBtnId}">
                <span class="icon is-small"> <i class="fa fa-trash"></i> </span>
              </a>
            </p>

          </div>
          <div class="media-content">
            <p class="title is-4">${item.title} <small class="duration">${item.duration}</small></p>
            <p class="subtitle is-6">
              <progress class="progress is-small ${item.percent === 100 ? 'is-success' : 'is-info'}" value="${item.percent || 0}" max="100"></progress>
            </p>
          </div>
        </div>
      </div>`

    $('#video-list').append(itemHTML)

    // Attach select event handler
    $(`#${downloadBtnId}`)
      .off('click')
      .on('click', () => this.downloadItem(item.id))
    $(`#${deleteBtnId}`)
      .off('click')
      .on('click', () => this.deleteItem(item.id))
  }

  downloadItem (id) {
    $(`#download-button-${id}`).addClass('is-loading')
    $(`#${id} progress`).removeAttr('value')
    ipcRenderer.send('start-download', id)
  }

  updateItem (id, percent) {
    $(`#${id} progress`).val(percent)
    $(`#download-button-${id}`).addClass('is-loading')
    if (percent >= 100) {
      $(`#download-button-${id}`).removeClass('is-loading')
      $(`#${id} progress`).addClass('is-success')
      const item = this.items.find(_ => _.id === id)
      item.percent = 100
      this.saveItems()
    } else if (percent < 0) {
      $(`#${id} progress`)
        .addClass('is-danger')
        .val(100)
    }
  }

  deleteItem (id) {
    $(`#${id}`).remove()
    this.items = this.items.filter(_ => _.id !== id)
    this.saveItems()
  }

  openItem (item) {
    // // Only if items exists
    // if ( !this.toreadItems.length ) return

    // // Get selected item
    // let targetItem = $('.read-item.is-active')

    // // Open in Browser
    // require('electron').shell.openExternal(targetItem.data('url'))
  }

  // Add item to items array
  // items.toreadItems.push(item)

  // Save items
  // items.saveItems()

  // Add item
  // items.addItem(item)
}

module.exports = VideoList
