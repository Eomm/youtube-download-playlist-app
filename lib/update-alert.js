'use strict'
const got = require('got')
const { version } = require('../package.json')

const GITHUB_LAST_RELEASE = 'https://api.github.com/repos/eomm/youtube-download-playlist-app/releases/latest'

module.exports = async function checkForUpdates (cb) {
  try {
    const response = await got(GITHUB_LAST_RELEASE, { headers: { accept: 'application/vnd.github.v3+json' } })
    const release = JSON.parse(response.body)
    if (release.tag_name !== `v${version}`) {
      cb(release)
    }
  } catch (error) {
    console.log('Error checking for updates', error)
  }
}
