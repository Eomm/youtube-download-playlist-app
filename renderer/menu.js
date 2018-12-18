'use strict'

// Modules
const { remote, shell } = require('electron')

// Menu template object
const template = [
  {
    label: 'Settings',
    submenu: [
      {
        label: 'Add New',
        accelerator: 'CmdOrCtrl+O',
        click () { window.openSetting() }
      },
      {
        type: 'separator'
      },
      {
        label: 'Add Link',
        accelerator: 'CmdOrCtrl+I',
        click () { $('#url-input').focus() }
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { shell.openExternal('https://github.com/Eomm/youtube-download-playlist-app') }
      }
    ]
  }
]

// Mac specific
if (process.platform === 'darwin') {
  // Add first menu item
  template.unshift({
    label: remote.app.getName(),
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  })

  // Mac extra window options
  template[3].submenu = [
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    },
    {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    },
    {
      label: 'Zoom',
      role: 'zoom'
    },
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  ]
}

// Add menu to app
const menu = remote.Menu.buildFromTemplate(template)
remote.Menu.setApplicationMenu(menu)
