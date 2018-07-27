<template>
<div style="height:100%;">
  <session-list/>
  <div class="m-main-content">
    <system-caption/>
    <router-view/>
  </div>
</div>
</template>

<script>
import SessionList from '../module/SessionList.vue'
import SystemCaption from '../controls/SystemCaption.vue'
export default {
  name: 'session-page',
  components: {SessionList,
    SystemCaption}
}
</script>

<style>

</style>

