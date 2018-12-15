
const VIDEO_ID_PATTERN = /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/g

const PLAYLIST_ID_PATTERN = /[&?]list=([^&]+)/g

module.exports.getVideoId = function (url) {
  const match = new RegExp(VIDEO_ID_PATTERN).exec(url)
  if (match) {
    return match.pop()
  }
  return null
}

module.exports.getPlaylistId = function (url) {
  const match = new RegExp(PLAYLIST_ID_PATTERN).exec(url)
  if (match) {
    return match.pop()
  }
  return null
}
