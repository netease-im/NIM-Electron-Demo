<template>
<div class="g-hbf-container m-chat">
  <div class="g-hbf-header m-header">
    <h3 style="float:left;margin-left:1rem;">{{sessionName}}</h3>
  </div>
  <div class="g-hbf-body m-body">
    <div class='invalidHint' v-if='scene === "team" && teamInvalid'>
      {{`您已退出该${teamInfo && teamInfo.type === 'normal' ? '讨论组':'群'}`}}
    </div>
    <chat-list
      type="session"
      :msglist="msglist"
      :userInfos="userInfos"
      :myInfo="myInfo"
      :isRobot="isRobot"
      :canLoadMore="canLoadMore"
      @load-more="loadMore"/>
  </div>
  <div class='newMsgHint' v-if="showNewMsgTip === true" @click="scrollToBottom">
    有新消息
  </div>
  <div class="g-hbf-footer m-footer">
    <chat-editor
      type="session"
      :scene="scene"
      :to="to"
      :isRobot="isRobot"
      :invalid="teamInvalid || muteInTeam"
      :invalidHint="sendInvalidHint"
      :advancedTeam="teamInfo && teamInfo.type === 'advanced'"/>
  </div>
</div>
</template>

<script>
import ChatEditor from './ChatEditor'
import ChatList from './ChatList'
import util from '../../utils'
import pageUtil from '../../utils/page'
export default {
  name: 'chat',
  components: {
    ChatEditor,
    ChatList
  },
  // 进入该页面，文档被挂载
  mounted () {
    this.$store.dispatch('showLoading')
    // 此时设置当前会话
    this.$store.dispatch('setCurrSession', this.sessionId)
    this.scrollToBottom()
    this.$store.dispatch('resetNoMoreHistoryMsgs')
    this.$route.query.firstFlag = false
    setTimeout(() => {
      this.$store.dispatch('hideLoading')
    }, 1000)

    // 获取群成员
    if (this.scene === 'team') {
      var teamMembers = this.$store.state.teamMembers[this.to]
      if (teamMembers === undefined || teamMembers.length < this.teamInfo.memberNum) {
        this.$store.dispatch('getTeamMembers', this.to)
      }
    }
  },
  updated () {
    if (this.$route.query.firstFlag) {
      this.$store.dispatch('resetCurrSession')
      this.$store.dispatch('setCurrSession', this.sessionId)
      this.scrollToBottom()
      this.$store.dispatch('resetNoMoreHistoryMsgs')
      this.$route.query.firstFlag = false
    }
  },
  // 离开该页面，此时重置当前会话
  destroyed () {
    this.$store.dispatch('resetCurrSession')
  },
  data () {
    return {
      showNewMsgTip: false
    }
  },
  computed: {
    sessionId () {
      let sessionId = this.$route.query.sessionId
      return sessionId
    },
    sessionName () {
      let sessionId = this.sessionId
      let user = null
      if (/^p2p-/.test(sessionId)) {
        user = sessionId.replace(/^p2p-/, '')
        if (user === this.$store.state.userUID) {
          return '我的手机'
        } else if (this.isRobot) {
          return this.robotInfos[user].nick
        } else {
          let userInfo = this.userInfos[user] || {}
          return util.getFriendAlias(userInfo)
        }
      } else if (/^team-/.test(sessionId)) {
        if (this.teamInfo) {
          // teamInfo中的人数为初始获取的值，在人员增减后不会及时更新，而teamMembers在人员增减后同步维护的人员信息
          var members = this.$store.state.teamMembers && this.$store.state.teamMembers[this.teamInfo.teamId]
          var memberCount = members && members.length
          return this.teamInfo.name + (memberCount ? `(${memberCount})` : '')
        } else {
          return '群'
        }
      }
    },
    scene () {
      return util.parseSession(this.sessionId).scene
    },
    to () {
      return util.parseSession(this.sessionId).to
    },
    // 判断是否是机器人
    isRobot () {
      let sessionId = this.sessionId
      let user = null
      if (/^p2p-/.test(sessionId)) {
        user = sessionId.replace(/^p2p-/, '')
        if (this.robotInfos[user]) {
          return true
        }
      }
      return false
    },
    myInfo () {
      return this.$store.state.myInfo
    },
    userInfos () {
      return this.$store.state.userInfos
    },
    robotInfos () {
      return this.$store.state.robotInfos
    },
    msglist () {
      let msgs = this.$store.state.currSessionMsgs
      return msgs
    },
    teamInfo () {
      if (this.scene === 'team') {
        var teamId = this.sessionId.replace('team-', '')
        return this.$store.state.teamlist.find(team => {
          return team.teamId === teamId
        })
      }
      return undefined
    },
    muteInTeam () {
      if (this.scene !== 'team') return false
      var teamMembers = this.$store.state.teamMembers
      var Members = teamMembers && teamMembers[this.teamInfo.teamId]
      var selfInTeam = Members && Members.find(item => {
        return item.account === this.$store.state.userUID
      })
      return (selfInTeam && selfInTeam.mute) || false
    },
    teamInvalid () {
      if (this.scene === 'team') {
        return !(this.teamInfo && this.teamInfo.validToCurrentUser)
      }
      return false
    },
    sendInvalidHint () {
      if (this.scene === 'team' && this.teamInvalid) {
        return `您已不在该${this.teamInfo && this.teamInfo.type === 'normal' ? '讨论组' : '群'}，不能发送消息`
      } else if (this.muteInTeam) {
        return '您已被禁言'
      }
      return '无权限发送消息'
    },
    canLoadMore () {
      return !this.$store.state.noMoreHistoryMsgs
    },
    incomingMsg () {
      return this.$store.state.newMsg
    }
  },
  watch: {
    incomingMsg (newMsg, oldMsg) {
      let isCurrent = newMsg.sessionId === this.$store.state.currSessionId
      if (!isCurrent) return
      let gap = pageUtil.getChatListHeight() - pageUtil.getChatListScroll() - pageUtil.getChatListClientHeight()
      if (gap > 50) this.showNewMsgTip = true
      else this.scrollToBottom()
    }
  },
  methods: {
    scrollToBottom () {
      pageUtil.scrollChatListDown()
      this.showNewMsgTip = false
    },
    getHistoryMsgs () {
      if (this.canLoadMore) {
        this.$store.dispatch('getHistoryMsgs', {
          scene: this.scene,
          to: this.to
        })
      }
    },
    loadMore () {
      if (pageUtil.getChatListScroll() <= 5) {
        this.getHistoryMsgs()
      }
    }
  }
}
</script>

<style scoped>
.m-chat .m-header {
  height: 2rem;
}

.m-chat .m-body {
  top: 2rem;
  bottom: 14rem;
}

.m-chat .m-footer {
  height: 14rem;
}

.invalidHint {
  width: 100%;
  height: 2rem;
  line-height: 2rem;
  text-align: center;
  background-color: rgb(251, 252, 190);
  color: gray;
  font-size: 0.9rem;
}

.newMsgHint {
  width: 100%;
  height: 2rem;
  line-height: 2rem;
  text-align: center;
  background-color: rgb(251, 252, 190);
  color: gray;
  font-size: 0.9rem;
  bottom: 14rem;
  position: absolute;
  opacity: 0.8;
}
</style>
