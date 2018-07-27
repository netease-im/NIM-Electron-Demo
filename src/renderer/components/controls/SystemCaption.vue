<template>
<div class="u-caption">
  <div class="u-sysbtn">
    <a class="btn-min" @click="onMinimize"/>
    <a class="btn-max" @click="onMax" v-if="resizable && !isWindowMax"/>
    <a class="btn-restore" @click="onRestore" v-else-if="resizable && isWindowMax"/>
    <a class="btn-close" @click="onClose"/>
  </div>
</div>
</template>

<script>
const electron = require('electron')
const ipcRenderer = electron.ipcRenderer
export default {
  name: 'system-caption',
  props: {
    resizable: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      isWindowMax: false
    }
  },
  mounted () {
    ipcRenderer.on('doMax', () => {
      this.isWindowMax = true
    })

    ipcRenderer.on('doRestore', () => {
      this.isWindowMax = false
    })
  },
  methods: {
    onClose () {
      if (window.confirm('确定要退出？')) window.close()
    },
    onMax () {
      ipcRenderer.send('onMax')
    },
    onRestore () {
      ipcRenderer.send('onRestore')
    },
    onMinimize () {
      ipcRenderer.send('onMinimize')
    }
  }
}
</script>

<style>

</style>


