<script setup>
import Navbar from './components/Navbar.vue'
import {useStore} from 'vuex'
import _ from 'lodash'
const store = useStore()

ipcRenderer.send('audios:update')

ipcRenderer.on('audios:update', (data) => {
  const old_audios = store.state.audios
  data.forEach(x => {x.currentInstance = old_audios.find(y=>y.id===x.id)?.currentInstance})
  store.commit('SET_AUDIOS', data)
})

ipcRenderer.on('audios:added', () => {
  ipcRenderer.send('audios:update')
})

</script>

<template>
  <Navbar />
  <router-view></router-view>
  
</template>


<style scoped>

</style>