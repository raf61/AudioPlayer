const fs = require('fs')
const path = require('path')

const defaultDBStructure = {
    audios: []
}

module.exports = function prepareDataDirectory(dataDirectory){
    try{
        const audioDirPath = path.join(dataDirectory, 'audio');
        if (!fs.existsSync(audioDirPath)){
            fs.mkdirSync(audioDirPath)
        }
        const jsonDBPath = path.join(dataDirectory, 'database.json')
        if (!fs.existsSync(jsonDBPath)){
            fs.writeFileSync(
                jsonDBPath, 
                JSON.stringify(defaultDBStructure)
            )
        }
        return true
    }
    catch(err){
        return false
    }
}