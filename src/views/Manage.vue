<script setup>
import Loader from '../components/Loader.vue';
import AudioRecord from '../components/AudioRecord.vue';
import { computed, ref } from 'vue';
import {useStore} from 'vuex'
const audioInput = ref()
const audioToUpload = ref(null)
const audioName = ref('')
const youtubeURL = ref('')
const store = useStore()
const audios = computed(() => store.state.audios)
const ytStartTime = ref(0)
const ytDuration = ref(null)
const loadingAudio = ref(false)


ipcRenderer.on('audios:added', () => {
    loadingAudio.value = false
})

const onChangeAudioInput = () => {
    const file = audioInput.value.files[0]
    audioToUpload.value = file
}

const onClickImportButton = () => {
    
    ipcRenderer.send('audios:importfile', {
        name: audioName.value,
        path: audioToUpload.value.path
    })
    audioToUpload.value = null
    audioName.value = ''
    loadingAudio.value = true
}

const onClickImportFromYoutube = () => {
    if (!audioName.value){
        alert('You should choose a name first')
        return
    }
    if (!youtubeURL.value){
        alert('Enter a YouTube URL')
        return
    }


    ipcRenderer.send('audios:importyt', {
        url: youtubeURL.value,
        name: audioName.value,
        startTime: ytStartTime.value,
        duration: ytDuration.value
    })

    audioToUpload.value = ''
    audioName.value = ''
    youtubeURL.value = ''
    ytDuration.value = null
    ytStartTime.value = 0
    loadingAudio.value = true


}

ipcRenderer.on('audios:importyt:error', (e) => {
    alert('Could not import audio from YouTube')
    loadingAudio.value = false
})

</script>

<template>

    <h1 class="no-selection">Manage</h1>
    <main class="container">
        <div class="manage-container">

            <div class="sounds-container">
                <div v-if="audios.length">
                    <AudioRecord v-for="(audio, index) in audios" :key="audio.id" :data="{'label': audio.name, 'id': audio.id}" />
                </div>
                <div class="no-audios" v-else>
                <h3>There are no audios.</h3>
                <div>
                    <svg style="width: 5rem" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                </div>
            </div>


            </div>

            <div class="imports-container">
                <h4 class="no-selection">Import audio</h4>
                <div v-if="!loadingAudio">
                    <input accept="audio/*" @change="onChangeAudioInput" ref="audioInput" type=file id="audioinput" hidden/>
                    <div class="audioname-input-container">
                        <input v-model="audioName" maxlength="70" required name="audioname" placeholder="Choose a name for the audio" />
                    </div>
                    <div class="import-from-youtube">
                        <div class="ytURL-input-container">
                            <input v-model="youtubeURL" maxlength="70" required name="youtubeURL" placeholder="Youtube URL" />
                        </div>
                        <div class="ytTime-input-container">
                            <div>
                                <span>Start time (sec)</span>
                                <input type="number" v-model="ytStartTime" min="0" required name="youtubeStartTime" placeholder="Start time" />
                            </div>
                            <div>
                                <span>Duration (sec)</span>
                                <input type="number" min="0" v-model="ytDuration" required name="youtubeDuration" placeholder="Automatic" />
                            </div>
                        </div>
                        <p @click="onClickImportFromYoutube">
                            From Youtube video
                        </p>
                    </div>
                    <h5 class="h-or">
                        OR
                    </h5>
                    <label for="audioinput" class="no-selection">
                        Choose file
                    </label>
                    <div class="filename text-truncate">
                        <span>{{ audioToUpload?.name }}</span>
                    </div>
                    <button :disabled="!audioToUpload || !audioName" @click="onClickImportButton" type="button" class="import-button">Import from computer</button>
                </div>
                <div class="loader-container" v-else>
                    <Loader></Loader>
                </div>
            </div>
        </div>
    </main>

</template>


<style scoped>
h1{
    text-align: center;
}
.container{
    text-align:center;
    display:flex;
    justify-content: center;
}
.manage-container{
    display:flex;
    justify-content: center;
    gap:4rem;
    padding-top:3rem;
    min-width:35rem;
}
.sounds-container{
    width: 50%;
    max-width:15rem;
}
.imports-container{
    width:50%;
}
label[for=audioinput]{
    font-size:10pt;
    padding:5px 6px;
    border-radius:2px;
    background-color: #ccc;
    cursor:pointer;
    display: block;
    max-width:12rem;
    margin:0 auto;
}

.audioname-input-container{
    max-width: 12rem;
    margin:0 auto;
    margin-top:.2rem;
    display:flex;
    justify-content: center;
    margin-bottom:2rem;
}
.audioname-input-container input{
    width:100%;
    padding:3px 5px;
    border:1px solid #ccc;
    border-radius: 3px;
}

.import-button{
    background-color:rgb(19, 93, 222);
    margin:0 auto;
    margin-top:.3rem;
    font-size:10pt;
    color:white;
    width:100%;
    padding:5px 6px;
    border-radius:2px;
    cursor:pointer;
    display: block;
    max-width:12rem;
    border:none;
}
.import-button:disabled{
    opacity: .6;
}
.filename{
    margin: 5px 0 0 0;
    font-size:10pt;
}
.no-audios{
    text-align:center;
}
.import-from-youtube{
    max-width: 12rem;
    margin:0 auto;
}
.import-from-youtube .ytURL-input-container{
    display:flex;
    justify-content:center;
    align-items: center;
}
.import-from-youtube input{
    width:100%;
    padding:3px 5px;
    border:1px solid #ccc;
    border-radius: 3px;
}
.import-from-youtube p{
    color:white;
    background-color:rgb(193, 47, 47);
    font-size:10pt;
    padding:5px 6px;
    border-radius:2px;
    cursor:pointer;
    max-width:12rem;
    width:100%;
    margin:0 auto;
    margin-top: .3rem;

    
}
.h-or{
    margin: .3rem auto;
    font-size:14pt;
}
.ytTime-input-container{
    display:flex;
    gap:.5rem;
    padding-bottom:.5rem;
}
.ytTime-input-container span{
    font-size:9pt;
}
.loader-container{
    display:flex;
    justify-content: center;
    align-items: center;
    padding-top: 1rem;
}
</style>