<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'amphibians-iii',
    // 所有页面更新都会触发此函数
    updated () {
      // 提交sdk连接请求
      // this.$store.dispatch('connect')
      // this.$store.dispatch('updateRefreshState')
    }
  }
</script>

<style>
  /* CSS */
</style>
