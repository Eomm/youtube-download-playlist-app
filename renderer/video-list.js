
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

    // duration  :  "0:04"
    // id  :  "6zXDo4dL7SU"
    // thumbnail  :  "https://i.ytimg.com/vi/6zXDo4dL7SU/hqdefault.jpg"
    // title  :  "Ba Dum Tss!"
    // url  :  "https://www.youtube.com/watch?v=6zXDo4dL7SU&index=2&t=0s&list=PLAv2aQ9JgGbVcUtDpuiTB9WgaMljCUpa_"
    // url_simple  :  "https://www.youtube.com/watch?v=6zXDo4dL7SU"

    // New item html
    let itemHTML = `
      <div class="card-content">
        <div class="media">
          <div class="media-left">
            <figure class="image is-48x48">
              <img src="${item.thumbnail}" alt="Preview image">
            </figure>
          </div>
          <div class="media-content">
            <p class="title is-4">${item.title} <small class="duration">${item.duration}</small></p>
            <p class="subtitle is-6">
              <progress class="progress is-info is-small" value="0" max="100"></progress>
            </p>
          </div>
        </div>
      </div>`

    $('#video-list').append(itemHTML)

    // Attach select event handler
    $('.read-item')
      .off('click, dblclick')
      .on('click', this.selectItem)
      .on('dblclick', window.openItem)
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
