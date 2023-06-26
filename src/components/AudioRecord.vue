<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex'

const { data } = defineProps({
    data: {
        type: Object
    }
})
const store = useStore()

const bodyVisible = ref(false)
const dropdownButton = ref()

const onClickDropdownButton = () => {
    bodyVisible.value = !bodyVisible.value
    if (bodyVisible.value){
        dropdownButton.value.style.transform = 'rotate(180deg)'
    }
    else{
        dropdownButton.value.style = 'rotate(0deg)'
    }
}

const onClickDeleteButton = () => {
    const audio = store.state.audios.find(x => x.id === data.id)
    if (!audio)
        return

    if (audio.currentInstance){
        audio.currentInstance.pause()
    }
    ipcRenderer.send('audios:delete', {
        id: audio.id
    })
}

</script>

<template>
    <div class="audio-record">
        <div class="audio-record-header">
            <abbr title="Som de surpresa">
                <span class="text-truncate no-selection">{{data.label}}</span>
            </abbr>
            <div class="button-dropdown" ref="dropdownButton" @click="onClickDropdownButton">
                <svg style="width: 20px" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </div>
        </div>
        <div class="audio-record-body" :hidden="!bodyVisible">
            <div class="delete-button-container">
                <button class="delete-button no-selection" @click="onClickDeleteButton">Delete</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.audio-record{
    border-top: 1px solid #ccc;
    padding:8px;

}
.audio-record-header{
    display: flex;
    gap:1rem;
    align-items: center;
    justify-content: space-between;

}
.button-dropdown{
    cursor: pointer;
}
.delete-button{
    background-color: rgb(184, 37, 37);
    color:white;
    padding:5px 7px;
    border-radius: 3px;
    border:none;
    cursor: pointer;
    transition: 0.4;
}
.delete-button:hover{
    background-color:red;
}
.audio-record-body{
    padding-top:.5rem;
}
.delete-button-container{
    display:flex;
    justify-content: left;
}

</style>