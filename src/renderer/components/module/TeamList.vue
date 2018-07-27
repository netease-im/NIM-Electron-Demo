<template>
<div class="m-main-list">
  <ul class="u-list">
    <li class="u-list-item" @click="activeId = team.teamId" :class="team.teamId === activeId ? 'u-list-item-active' : ''" v-for="team in teamList" :key="team.teamId">
      <router-link :to="{name:'teamcard', query:{teamId: team.teamId, firstFlag: true}}">
        <div class="u-list-item-container">
          <img class="icon" slot="icon" :src="team.avatar"/>
          <div class="single-content">
            {{team.name}}
          </div>      
        </div>
      </router-link>
    </li>
  </ul>
</div>   
</template>

<script>
export default {
  name: 'team-list',
  data () {
    return {
      activeId: ''
    }
  },
  computed: {
    teamList: function () {
      return this.$store.state.teamlist && this.$store.state.teamlist.filter(team => {
        return team.type === 'advanced' && team.validToCurrentUser
      })
    }
  }
}
</script>

<style>

</style>
