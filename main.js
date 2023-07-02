const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path')
const fs = require('fs')
const JSONdb = require('simple-json-db')
const ytdl = require('ytdl-core')
const crypto = require('crypto')
const { pipeline } = require('stream/promises')
const prepareDataDirectory = require('./prepareDataDirectory')
const ffmpeg = require('fluent-ffmpeg');
// const ffmpegPath = require('ffmpeg-static').replace(
//     'app.asar',
//     'app.asar.unpacked'
// );
// const ffprobePath = require('ffprobe-static').path.replace(
//     'app.asar',
//     'app.asar.unpacked'
// );
// ffmpeg.setFfmpegPath(ffmpegPath);
// ffmpeg.setFfprobePath(ffprobePath);


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

  e.reply('audios:added')
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
  let {url, name, startTime, duration} = data
  if (!url || !name){
    return
  }
  if (typeof startTime != 'number'){
    startTime = 0
  }
  if (typeof duration != 'number'){
    duration = null
  }
  
  try{
    const audioPath = path.join(audioDirectory, crypto.randomBytes(16).toString('hex') + '.mp3')
    if (!startTime && !duration){
      const youtubeVideo = ytdl(url, {filter:'audioonly'})
      await pipeline(youtubeVideo, fs.createWriteStream(audioPath))
    }
    else{
      const videoInfo = await (ytdl.getInfo(url))
      const videoDuration = videoInfo.videoDetails.lengthSeconds
      if (duration && (startTime + duration > videoDuration || startTime < 0 || duration < 0)){
        throw new Error('Invalid duration time')
      }
      const videoURL = videoInfo.formats.find(x => x.itag == 251).url
      await ffmpegDownload(videoURL, audioPath, startTime, duration)
    }    


    const audios = db.get('audios')
    audios.push({
      id: crypto.randomUUID(),
      path: audioPath,
      name
    })
    db.set('audios', audios)
    e.reply('audios:added')
  }
  catch(err){
    e.reply('audios:importyt:error')
    return
  }
})

async function ffmpegDownload(url, target, start, duration){
  const ffmpegStream = ffmpeg()
  .input(url)
  .format('mp3')
  .setStartTime(start)
  if (duration){
    ffmpegStream.setDuration(duration)
  }

  await pipeline(
    ffmpegStream,
    fs.createWriteStream(target)
  )
}