const {contextBridge, ipcRenderer} = require('electron')


contextBridge.exposeInMainWorld('version', {
    node: () => process.versions.node,
})

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
})

