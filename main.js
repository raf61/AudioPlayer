const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path')
const fs = require('fs')
const JSONdb = require('simple-json-db')
const ytdl = require('ytdl-core')
const crypto = require('crypto')
const { pipeline } = require('stream/promises')
const prepareDataDirectory = require('./prepareDataDirectory')


process.env.NODE_ENV = 'production'
const isDev = process.env.NODE_ENV !== 'production'
const dataDirectory = path.join(app.getPath('appData'), 'audioplayer')
prepareDataDirectory(dataDirectory)


const dbPath = path.join(dataDirectory, 'database.json')
const audioDirectory = path.join(dataDirectory, 'audio')
const db = new JSONdb(dbPath)



function createMainWindow() { 
  const mainWindow = new BrowserWindow({
    title: 'AudioPlayer', 
    width: 1000,
    height:600,
    webPreferences:{
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation:true,
      nodeIntegration:true
    }
  })

  mainWindow.loadFile(path.join(__dirname, 'dist/index.html'))
  mainWindow.setMenu(null)
  if (isDev){
    mainWindow.webContents.openDevTools()
  }
}

app.whenReady().then(() => {
  if (BrowserWindow.getAllWindows().length === 0){
    createMainWindow()
  }

})

app.on('window-all-closed', () => {
  if (process.plataform !== 'darwin'){
    app.quit();
  }
})

ipcMain.on('audios:importfile', async (e, data) => {
  if (!fs.existsSync(data.path)){
    return
  }

  await fs.promises.copyFile(data.path, path.join(audioDirectory, path.basename(data.path)))
  const audios = db.get('audios')
  audios.push({
    id: crypto.randomUUID(),
    path: path.join(audioDirectory, path.basename(data.path)),
    ...data
  })
  db.set('audios', audios)

  e.reply('audios:update', audios)  
})

ipcMain.on('audios:update', (e, data) => {
  const audios = db.get('audios')
  e.reply('audios:update', audios)
})

ipcMain.on('audios:delete', (e, data) => {
  const audios = db.get('audios')
  const {id} = data
  if (!id){
    return
  }
  const index = audios.findIndex(x=>x.id === id)
  if (index == -1){
    return
  }
  fs.unlinkSync(audios[index].path)
  audios.splice(index, 1)
  db.set('audios', audios)
  e.reply('audios:update', audios)
})

ipcMain.on('audios:importyt', async (e, data) => {
  const {url, name} = data
  if (!url || !name){
    return
  }

  let youtubeVideo;
  try{
    youtubeVideo = ytdl(url, {filter:'audioonly'})
    const audioPath = path.join(audioDirectory, crypto.randomBytes(16).toString('hex') + '.mp3')
    await pipeline(youtubeVideo, fs.createWriteStream(audioPath))
    const audios = db.get('audios')
    audios.push({
      id: crypto.randomUUID(),
      path: audioPath,
      name
    })
    db.set('audios', audios)
    e.reply('audios:update', audios)
  }
  catch(err){
    e.reply('audios:importyt:error')
    return
  }
})