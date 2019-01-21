// Modules to control application life and create native browser window
process.env.GOOGLE_APPLICATION_CREDENTIALS='/Users/justin/Amanuensis/AmanuensisCredentials.json'
const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron')
const takeDictation = require('./noteTranscriber')
const transcribe = require('./transcriber')
// const record = require('node-record-lpcm16')
const fs = require('fs')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200, 
    height: 900, 
    webPreferences: {
      allowRunningInsecureContent: true,
       webSecurity: false
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL('http://localhost:3000')
  
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click() {
            openFile()
          }
        },
        {
          label: 'Open Folder'
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteandmatchstyle' },
        { role: 'delete' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click () { require('electron').shell.openExternal('https://electronjs.org') }
        }
      ]
    },
    {
      label: 'Developer',
      submenu: [
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CmdOrCtrl+Alt+J',
          click() {
            mainWindow.webContents.toggleDevTools()
          },
        }
      ]
    }
  ]
  
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })
    
    // Edit menu
    template[2].submenu.push(
      { type: 'separator' },
      {
        label: 'Speech',
        submenu: [
          { role: 'startspeaking' },
          { role: 'stopspeaking' }
        ]
      }
      )
      
      // Window menu
      template[4].submenu = [
        { role: 'close' },
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' }
      ]
    }
    
    const menu = Menu.buildFromTemplate(template)
    
    Menu.setApplicationMenu(menu)
    
    
    
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
    
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
    })
  }
  
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow)
  
  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow()
    }
  })
  
  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.
  let language = 'en-US'
  ipcMain.on('change-language', (evt, newLanguage) => {
    language = newLanguage
    console.log('in main.js:', language)
  })
  
  ipcMain.on('activate-dictation', () => {
    takeDictation(mainWindow.webContents, language, ipcMain)
  })
  
  ipcMain.on('get-project', loadExistingProject)
  ipcMain.on('create-project', createProject)
  
  function loadExistingProject() {
    const dirs = dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    if(!dirs) return
    const directory = dirs[0]
    mainWindow.webContents.send('load-project', directory)
  }
  
  // Create new project directory
  async function createProject() {
    const dirs = dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory']
    })
    if(!dirs) return
    const directory = dirs[0]
    await fs.mkdir(`${directory}/Notes`, err => {
      if(err) return console.log(err)
    })
    await fs.writeFile(`${directory}/transcript.txt`, '', err => {
      if(err) return console.log(err)
    })
    await fs.writeFile(`${directory}/words.json`, '', err => {
      if(err) return console.log(err)
    })
    mainWindow.webContents.send('load-project', directory)
  }
  
  // Open File
  async function openFile() {
    // Opens file dialog looking for markdown
    const files = dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{
        name: 'Audio', extensions: ['wav', 'raw'],
      }]
    })
    // If no files
    if(!files) return
    
    const file = files[0]
    mainWindow.webContents.send('load-audio', file)
    transcribe(file, mainWindow.webContents, language)
  }
  
  
  
  // {
  //   label: 'View',
  //   submenu: [
  //     { role: 'reload' },
  //     { role: 'forcereload' },
  //     { role: 'toggledevtools' },
  //     { type: 'separator' },
  //     { role: 'resetzoom' },
  //     { role: 'zoomin' },
  //     { role: 'zoomout' },
  //     { type: 'separator' },
  //     { role: 'togglefullscreen' }
  //   ]
  // },
  
  // {
  //   role: 'help',
  //   submenu: [
  //     {
  //       label: 'Learn More',
  //       click () { require('electron').shell.openExternal('https://electronjs.org') }
  //     }
  //   ]
  // },
