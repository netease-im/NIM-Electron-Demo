<template>
    <div class="g-window">
        <div class="g-inherit">
            <nav-bar/>
            <div class="m-main">
                <router-view></router-view>
            </div>
            <select-user/>
            <find-x/>
        </div>
    </div>
</template>

<script>
  import NavBar from './controls/NavBar.vue'
  import SelectUser from './float/SelectUser.vue'
  import util from '../utils'
  import FindX from './float/FindX.vue'
  const electron = require('electron')
  const ipcRenderer = electron.ipcRenderer
  export default {
    name: 'main-page',
    components: {NavBar, SelectUser, FindX},
    watch: {
      incomingMsg (newMsg, oldMsg) {
        let showMsg = ''
        if (newMsg.type === 'text') {
          showMsg = newMsg.text || ''
        } else if (newMsg.type === 'custom') {
          showMsg = util.parseCustomMsg(newMsg)
        } else if (newMsg.scene === 'team' && newMsg.type === 'notification') {
          showMsg = util.generateTeamSysmMsg(newMsg)
        } else if (util.mapMsgType(newMsg)) {
          showMsg = `[${util.mapMsgType(newMsg)}]`
        } else {
          showMsg = ''
        }
        let isCurrent = newMsg.sessionId === this.$store.state.currSessionId
        let href = `#/mainpage/session/chat?sessionId=` + newMsg.sessionId
        let data = {body: showMsg, current: isCurrent, href: href}
        ipcRenderer.send('onReceiveMsg', data)
      }
    },
    computed: {
      incomingMsg () {
        return this.$store.state.newMsg
      }
    }
  }
</script>

<style>

</style>
