<script setup>
import { onMounted, ref } from 'vue';
import ControlButton from './ControlButton.vue';

function formatTime(minutes, seconds){
    if (minutes < 10){
        minutes = '0' + minutes
    }
    if (seconds < 10){
        seconds = '0' + seconds
    }
    return `${minutes}:${seconds}`
}

const onControlButtonClick = (() => {
    if (audio.paused){
        controlButtonState.value = true
        audio.play()
    }
    else{
        controlButtonState.value = false
        audio.pause()
    }
})

const onAudioTimeUpdate = () => {
    let currentTime = Math.floor(audio.currentTime)
    let minutes = Math.floor(currentTime / 60).toString()
    let seconds = (currentTime % 60).toString()
    if (currentTimeEl.value && progress.value){ // If it`s on another page, this elements won`t exist
        currentTimeEl.value.innerText = formatTime(minutes, seconds)
        progress.value.style.width = (audio.currentTime / audio.duration * 100).toString() + '%'
    }
}

const onAudioLoadMetaData = () => {
    let minutes = Math.floor(audio.duration / 60).toString()
    let seconds = Math.floor((audio.duration % 60)).toString()
            
    durationEl.value.innerText = formatTime(minutes, seconds)
}

const onAudioEnded = () => {
    controlButtonState.value = false
}

const onClickProgressBar = (e) => {
    const currentPart = e.offsetX / progressBar.value.offsetWidth * audio.duration
    audio.currentTime = currentPart

}

const onMouseOverProgressBar = () => {
    timeIndicatorEl.value.style.display = 'block'
}

const onMouseOutProgressBar = () => {
    timeIndicatorEl.value.style.display = 'none'
}

const onMouseMoveProgressBar = (e) => {
    timeIndicatorEl.value.style.left = e.offsetX.toString() + 'px'
    const currentPart = e.offsetX / progressBar.value.offsetWidth * audio.duration
    let minutes = Math.floor(currentPart / 60).toString()
    let seconds = Math.floor((currentPart % 60)).toString()
    
    timeIndicatorSpan.value.innerText = formatTime(minutes, seconds)
}

const onInputVolume = () => {
    const currentVolume = volume.value.value / 100
    audio.volume = currentVolume
}

const onClickBackButton = () => {
    audio.currentTime = 0
}


const audio = data.currentInstance || new Audio(data.path)
data.currentInstance = audio
audio.ontimeupdate = onAudioTimeUpdate
audio.onloadedmetadata = onAudioLoadMetaData
audio.onended = onAudioEnded

const durationEl = ref()
const controlButton = ref()
const controlButtonState = ref(!audio.paused)
const currentTimeEl = ref()
const progress = ref()
const progressBar = ref()
const timeIndicatorEl = ref()
const timeIndicatorSpan = ref()
const volume = ref()
const {data} = defineProps({
    data:{
        type: Object
    }
})


onMounted(() => {
    progress.value.style.width = (audio.currentTime / audio.duration * 100).toString() + '%'
    let currentTime = Math.floor(audio.currentTime)
    let minutes = Math.floor(currentTime / 60).toString()
    let seconds = (currentTime % 60).toString()
    currentTimeEl.value.innerText = formatTime(minutes, seconds)
    let durationMinutes = Math.floor(audio.duration / 60).toString()
    let durationSeconds = Math.floor((audio.duration % 60)).toString()
    durationEl.value.innerText = formatTime(durationMinutes, durationSeconds)
    volume.value.value = audio.volume * 100
})

</script>

<template>
    <div class="audio">


        <div class="audio-container">
            
            <div class="control-container">
                <ControlButton :state="controlButtonState" ref="controlButton" @click="onControlButtonClick">Play</ControlButton>
                <abbr :title="data.name" style="text-decoration:none; width:80%;" class="text-truncate no-selection cursor-pointer">
                    <h3 class="text-truncate">{{ data.name }}</h3>
                </abbr>
                <div @click="onClickBackButton" class="replay-button">
                    <svg style="width: 30px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                    </svg>
                </div>
            </div>

            

            <div class="volume-bar-parent">
                <div class="volume-bar" ref="volumeBar">
                    <input @input="onInputVolume" type="range" id="volume" ref="volume">
                </div>
            </div>

            <div class="progress-container">
                <div class="progress-bar-parent">
                    <div @mousemove="onMouseMoveProgressBar($event)" @mouseout="onMouseOutProgressBar" @mouseover="onMouseOverProgressBar" @click="onClickProgressBar($event)" class="progress-bar" ref="progressBar">
                        <div class="progress" ref="progress"></div>
                        <div id="time-indicator" ref="timeIndicatorEl">
                            <span ref="timeIndicatorSpan">                
                                00:00
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="time no-selection">
                    <span id="currentTime" ref="currentTimeEl">00:00</span>
                    <span id="duration" ref="durationEl">00:00</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.audio{
    padding:.5rem 2rem;
    
    width:100%;
    max-width: 20rem;
}
.control-container{
    display:flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom:.5rem;
}
.control-container h3{
    font-size:11pt;;
}
.progress-bar-parent{
    width:100%;
}

.progress-bar{
    max-width: 20rem;
    height:8px;
    background-color: #ddd;
    cursor: pointer;
    margin-bottom:5px;
    border-radius:5px;
    position:relative;
}

.progress{
    height:8px;
    background-color: #333;
    border-radius:5px;
    width:0;
}
.volume-bar-parent{
    padding-bottom:0.5rem;
}
#volume{
    width:100%;
}



#time-indicator{
    position:relative;
    top:-2rem;
    left:100%;
    display:none;
}

#time-indicator span{
    background:grey;
    color:white;
    padding:2px;
    border-radius:3px;
}
.progress-container{
    width:100%;
}
.time{
    max-width:20rem;
    display:flex;
    justify-content:space-between;
}

.replay-button{
    cursor: pointer;
    
}

</style>