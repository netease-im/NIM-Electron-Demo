<template>
<div class="g-hbf-container m-sysmsg">
  <div class="g-hbf-header m-header">
    <a @click="sysType = 0" :class="sysType === 0 ? 'header-pushed' : ''" style="display:inline-block;margin-left: 2rem;margin-top: 0.2rem;">系统通知</a>
    <a @click="sysType = 1" :class="sysType === 1 ? 'header-pushed' : ''" style="display:inline-block;margin-left: 2rem;">自定义消息</a>
    <a style="float: right;margin-right: 2rem; margin-top: 0.2rem;" @click="clearMsgs">清空</a>
  </div>
  <div class="g-hbf-body m-body">
    <ul class="u-list">
      <li class="u-list-item" v-for="msg in msgList" :key="msg.idServer">
        <div class="u-list-item-container" style="width:25rem;" :key="msg.idServer" v-if="msg.type ==='applyTeam' || msg.type ==='teamInvite'" @contextmenu="showMenu" :id="msg.idServer">
          <VueContextMenu :contextMenuData="menuData" @delete="deleteMsg()"/>
          <img class="icon" :src="msg.avatar"/>
          <div class="multi-content" style="width:18rem;">
            <div class="title">{{msg.from}}</div>
            <div class="content">{{msg.desc}}</div>
          </div>
          <div style="margin-left:0.6rem;display:list-item;width:7rem">
            <div style="color:#ccc;overflow:hidden;white-space:nowrap;font-size:0.8rem;">{{msg.showTime}}</div> 
            <div style="display: flex;align-items: center;" v-if='deleteIdServer !== msg.idServer'>
              <div v-if='msg.state === "init"'>
                <a @click="handleTeamApply(msg, true)" class="a-link">同意</a>
                <a @click="handleTeamApply(msg, false)" class="a-link">拒绝</a>
              </div>
              <div style="color: #aaa;font-size: .9rem;" v-else>
                {{msg.state === 'error'? '已过期' : msg.state === 'rejected' ? '已拒绝' : '已同意'}}
              </div>
            </div>
          </div>
        </div>
        <div class="u-list-item-container" style="width:25rem;" :key="msg.idServer" v-else>
          <img class="icon" slot="icon" :src="msg.avatar"/>
          <div class="multi-content" style="width:18rem;">
            <div class="title">{{msg.showText}}</div>
            <div class="content">{{msg.from}}</div>
          </div>  
          <div style="margin-left:0.6rem;display:list-item;">
            <div style="color:#ccc;overflow:hidden;white-space:nowrap;font-size:0.8rem;">{{msg.showTime}}</div> 
          </div>           
        </div>
      </li>      
    </ul>
    <div class='empty-hint' v-if='!msgList || msgList.length<1'>暂无任何消息</div>
  </div>
</div>
</template>

<script>
import config from '../../configs'
export default {
  name: 'sysmsgs',
  mounted () {
    this.$store.dispatch('markSysMsgRead')
    this.$store.dispatch('markCustomSysMsgRead')
  },
  updated () {
    this.$store.dispatch('markSysMsgRead')
    this.$store.dispatch('markCustomSysMsgRead')
  },
  data () {
    return {
      sysType: 0, // 系统消息 0, 自定义消息 1,
      defaultAvatar: config.defaultUserIcon,
      deleteIdServer: '',
      menuData: {
        menuName: 'sysMsgMenu',
        axios: {x: null, y: null},
        menulists: [
          {fnHandler: 'delete', btnName: '删除'}
        ]
      }
    }
  },
  computed: {
    userInfos () {
      return this.$store.state.userInfos || {}
    },
    sysMsgs () {
      let sysMsgs = this.$store.state.sysMsgs.filter(msg => {
        switch (msg.type) {
          case 'addFriend':
            msg.showText = `${msg.friend.alias || msg.friend.account} 添加您为好友~`
            msg.avatar = this.userInfos[msg.from] && this.userInfos[msg.from].avatar
            return true
          case 'deleteFriend':
            msg.showText = `${msg.from} 将您从好友中删除`
            msg.avatar = this.userInfos[msg.from].avatar
            return false
          case 'applyTeam':
            console.log('applyTeam', msg)
            msg.showText = msg.from
            msg.avatar = (this.userInfos[msg.from] && this.userInfos[msg.from].avatar) || this.defaultAvatar
            msg.desc = `申请加入群:${this.getTeamName(msg.to)}`
            return true
          case 'teamInvite':
            msg.showText = msg.attach.team.name
            msg.avatar = (this.userInfos[msg.from] && this.userInfos[msg.from].avatar) || this.defaultAvatar
            msg.desc = `邀请你加入群${msg.to}`
            return true
          case 'rejectTeamApply':
            msg.showText = msg.attach.team.name
            msg.desc = '管理员拒绝你加入本群'
            msg.avatar = msg.attach.team.avatar || this.defaultAvatar
            return true
          case 'rejectTeamInvite':
            let op = this.userInfos[msg.from]
            msg.showText = op.nick
            msg.avatar = op.avatar || this.defaultAvatar
            msg.desc = `${op.nick}拒绝了群${this.getTeamName(msg.to)}的入群邀请`
            return true
        }
        console.log(msg)
        return false
      })
      sysMsgs.sort((msg1, msg2) => {
        // 最新的排在前
        return msg2.time - msg1.time
      })
      return sysMsgs
    },
    customSysMsgs () {
      let customSysMsgs = this.$store.state.customSysMsgs.filter(msg => {
        if (msg.scene === 'p2p') {
          let content = JSON.parse(msg.content)
          msg.showText = `${content.content}`
          msg.avatar = this.userInfos[msg.from].avatar
          return msg
        }
        return false
      })
      return customSysMsgs
    },
    msgList () {
      return this.sysType === 0 ? this.sysMsgs : this.customSysMsgs
    }
  },
  methods: {
    deleteMsg () {
      if (!this.deleteIdServer) return
      this.$store.commit('deleteSysMsgs', {
        type: this.sysType,
        idServer: this.deleteIdServer
      })
    },
    showMenu (parameter) {
      parameter.preventDefault()
      var x = parameter.clientX
      var y = parameter.clientY
      this.deleteIdServer = parameter.currentTarget.id
      this.menuData.axios = {
        x, y
      }
    },
    clearMsgs () {
      var that = this
      if (window.confirm('确认要清空消息吗？')) {
        that.$store.dispatch('resetSysMsgs', {
          type: that.sysType
        })
      }
    },
    getTeamName (teamId) {
      let team = this.$store.state.teamlist.find(team => {
        return team.teamId === teamId
      })
      return (team && team.name) || ''
    },
    handleTeamApply (msg, pass) {
      let action
      switch (msg.type) {
        case 'applyTeam':
          action = pass ? 'passTeamApply' : 'rejectTeamApply'
          break
        case 'teamInvite':
          action = pass ? 'acceptTeamInvite' : 'rejectTeamInvite'
          break
        default:
          return
      }
      this.$store.dispatch('delegateTeamFunction', {
        functionName: action,
        options: {
          idServer: msg.idServer,
          teamId: msg.to,
          from: msg.from,
          done: (_error, obj) => {
            console.log('handleDone', obj)
          }
        }
      })
    }
  }
}
</script>

<style>
.m-sysmsg .m-header {
  height: 2rem;
  -webkit-app-region: no-drag;
}

.m-sysmsg .m-header .header-pushed {
  color:rgb(104,179,255);
  border-bottom-style:solid;
}

.m-sysmsg .a-link {
  color:rgb(104,179,255);
  font-size: 0.9rem;
}

.m-sysmsg .m-body {
  top: 2rem;
  bottom: 2rem;
}

.m-sysmsg .m-footer {
  height: 2rem;
}
</style>
