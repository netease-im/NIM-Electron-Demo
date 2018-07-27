<template>
<div style="height:100%;">
  <contacts-list/>
  <div class="m-main-content">
    <system-caption/>
    <router-view/>
  </div> 
</div>
</template>

<script>
import ContactsList from '../module/ContactsList.vue'
import SystemCaption from '../controls/SystemCaption.vue'
export default {
  name: 'contacts-page',
  components: {
    ContactsList,
    SystemCaption}
}
</script>

<style>

</style>

