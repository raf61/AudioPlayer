import { createStore } from "vuex"

const store = createStore({
    state() {
        return{
            audios:[]
        }
    },
    mutations:{
        SET_AUDIOS (state, new_audios){
            state.audios = new_audios
        }
    }
})

export default store