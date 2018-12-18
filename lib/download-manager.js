'use strict'

const { EventEmitter } = require('events')
const DownloadYTFile = require('yt-dl-playlist')

class DownloadManager extends EventEmitter {
  constructor (downloadPath) {
    super()
    this.queue = new Set()
    this.downloader = new DownloadYTFile({
      outputPath: downloadPath
      // overwrite,
      // fileNameGenerator,
      // maxParallelDownload,
    })

    this.downloader.on('start', (fileInfo) => this.emit('download-start', fileInfo))
    this.downloader.on('progress', (fileProgressInfo) => this.emit('download-progress', fileProgressInfo))
    this.downloader.on('complete', (fileInfo) => this.emit('download-complete', fileInfo))
    this.downloader.on('error', (error) => this.emit('download-error', error))
  }

  addPlaylistToQueue (playlistId) {
    return this.downloader
      .getPlaylistInfo(playlistId)
      .then((videos) => {
        videos.items.map(_ => _.id).forEach(_ => this.queue.add(_))
        return videos
      })
  }

  addVideoToQueue (videoId) {
    return this.downloader
      .getVideoInfo(videoId)
      .then((video) => {
        this.queue.add(video.id)
        return [video]
      })
  }

  downloadVideo (videoId) {
    return this.downloader.download(videoId)
  }

  downloadPlaylist (playlistId) {
    return this.downloader.downloadPlaylist(playlistId)
  }

  set downloadPath (newPath) {
    this.downloader.downloadPath = newPath
  }

  get downloadPath () {
    return this.downloader.downloadPath
  }
}

module.exports = DownloadManager
