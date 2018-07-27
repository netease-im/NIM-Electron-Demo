<template>
<div style="height:100%;">
  <team-list/>
  <div class="m-main-content">
    <system-caption/>
    <router-view/>
  </div>
</div>  
</template>

<script>
import TeamList from '../module/TeamList.vue'
import SystemCaption from '../controls/SystemCaption.vue'
export default {
  name: 'team-page',
  components: {
    TeamList,
    SystemCaption}
}
</script>

<style>

</style>
