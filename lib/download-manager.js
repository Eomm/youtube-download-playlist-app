'use strict'

const { EventEmitter } = require('events')
const DownloadYTFile = require('yt-dl-playlist')

class DownloadManager extends EventEmitter {
  constructor () {
    super()
    this.queue = []
    this.downloader = new DownloadYTFile({
      // outputPath: __dirname,
      // overwrite,
      // fileNameGenerator,
      // maxParallelDownload,
    })
  }

  addPlaylistToQueue (playlistId) {
    return this.downloader
      .getPlaylistInfo(playlistId)
      .then((videos) => {
        // TODO add to queue
        return videos
      })
  }

  addVideoToQueue (videoId) {
    return this.downloader
      .getVideoInfo(videoId)
      .then((video) => {
        // TODO add to queue
        return [video]
      })
  }
}

module.exports = DownloadManager
