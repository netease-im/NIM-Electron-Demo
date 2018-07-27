<template>
<div class="m-nav">
  <div style="top: 2rem;position: relative;-webkit-app-region: no-drag;text-align: center;">
    <img :src="myInfo.avatar" style="width:3rem; height:3rem;"/>
  </div>
  <div @click="navTo('session')" style="top: 4rem;position: relative;-webkit-app-region: no-drag;width: fit-content;margin-left: 1.25rem;">
    <router-link :to="{ name:'session' }" >
     <img :src="sessionNormalIcon" style="width:1.5rem; height:1.5rem;" v-if="selectedItem !== 'session'"/>
     <img :src="sessionActivatedIcon" style="width:1.5rem; height:1.5rem;" v-else/>
    </router-link>
  </div>
  <div @click="navTo('contact')" style="top:5rem; width:1.5rem; position:relative; -webkit-app-region: no-drag;width: fit-content;margin-left: 1.25rem;">
    <router-link :to="{ name:'contacts' }">
      <img :src="contactNormalIcon" style="width:1.5rem; height:1.5rem;" v-if="selectedItem !== 'contact'" />
      <img :src="contactActivatedIcon" style="width:1.5rem; height:1.5rem;" v-else/>
    </router-link>
  </div>
  <div @click="navTo('team')" style="top:6rem; width:1.5rem; position:relative; -webkit-app-region: no-drag;width: fit-content;margin-left: 1.25rem;">
    <router-link :to="{ name:'team' }">
      <img :src="teamNormalIcon" style="width:1.5rem; height:1.5rem;" v-if="selectedItem !== 'team'" />
      <img :src="teamActivatedIcon" style="width:1.5rem; height:1.5rem;" v-else/>
    </router-link>
  </div>
  <div @click="showSettingMenu" style="bottom:2rem; width:1.5rem; position:absolute; -webkit-app-region: no-drag;width: fit-content;margin-left: 1.25rem;">
    <VueContextMenu :contextMenuData="settingMenuData" @doExit="doExit" @doLogout="doLogout"/>
    <img :src="settingIcon" style="width:1.5rem; height:1.5rem;"/>
  </div>
  <div @click="showMenu" style="bottom:5rem; width:1.5rem; position:absolute; -webkit-app-region: no-drag;width: fit-content;margin-left: 1.25rem;">
    <VueContextMenu :contextMenuData="menuData" @addFriend="addFriend" @addTeam="addTeam" @createTeam="createTeam"/>
    <img :src="plusIcon" style="width:1.5rem; height:1.5rem;"/>
  </div>
</div>
</template>

<script>
export default {
  name: 'nav-bar',
  data () {
    return {
      selectedItem: 'session',
      sessionNormalIcon: './static/img/nav/main-tab-session-normal.png',
      sessionActivatedIcon: './static/img/nav/main-tab-session-activated.png',
      sessionIconTitle: '会话',
      contactNormalIcon: './static/img/nav/main-tab-user-normal.png',
      contactActivatedIcon: './static/img/nav/main-tab-user-activated.png',
      contactIconTitle: '好友',
      teamNormalIcon: './static/img/nav/main-tab-team-normal.png',
      teamActivatedIcon: './static/img/nav/main-tab-team-activated.png',
      teamIconTitle: '好友',
      settingIcon: './static/img/nav/icon-setting.png',
      plusIcon: './static/img/nav/icon-plus.png',
      menuData: {
        menuName: 'mainMenu',
        axios: {x: null, y: null},
        menulists: [
          {fnHandler: 'addFriend', btnName: '添加好友'},
          {fnHandler: 'addTeam', btnName: '查找群组'},
          {fnHandler: 'createTeam', btnName: '创建群组'}
        ]
      },
      settingMenuData: {
        menuName: 'settingMenu',
        axios: {x: null, y: null},
        menulists: [
          /* {fnHandler: 'doLogout', btnName: '注销'}, */
          {fnHandler: 'doExit', btnName: '退出'}
        ]
      }
    }
  },
  mounted () {
    var _this = this
    this.eventBus.$on('updateNavBar', function (data) {
      _this.selectedItem = data.navTo
    })
  },
  methods: {
    showMenu (parameter) {
      parameter.preventDefault()
      var x = parameter.clientX
      var y = parameter.clientY
      this.menuData.axios = {
        x, y
      }
    },
    showSettingMenu (parameter) {
      parameter.preventDefault()
      var x = parameter.clientX
      var y = parameter.clientY
      this.settingMenuData.axios = {
        x, y
      }
    },
    addFriend () {
      let data = {findXMode: 'friend'}
      this.eventBus.$emit('findX', data)
    },
    addTeam () {
      let data = {findXMode: 'team'}
      this.eventBus.$emit('findX', data)
    },
    createTeam () {
      let data = {teamId: '', selectMode: 'createTeam'}
      this.eventBus.$emit('openSelect', data)
    },
    doExit () {
      window.close()
    },
    doLogout () {
      this.$store.dispatch('logout')
    },
    navTo (to) {
      this.selectedItem = to
    }
  },
  computed: {
    myInfo () {
      return this.$store.state.myInfo
    }
  }
}
</script>

<style>

</style>

