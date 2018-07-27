<template>
<div class="m-main-list">

        <!--<router-link :to="{name:'sysmsgs'}">
            <div class="u-list-item">
                <img class="icon" slot="icon" width="24" :src="myPhoneIcon">
                我的手机
            </div>
        </router-link>-->
  <ul class="u-list" id="nsession-list">
    <li class="u-list-item" id="msgCenter" @click="activeId = 'msgCenter'" :class="'msgCenter' === activeId ? 'u-list-item-active' : ''">
      <router-link :to="{name:'sysmsgs'}">
        <div class="u-list-item-container">
          <img class="icon" :src="noticeIcon">
          <div class="single-content">消息中心</div>     
          <span v-show="sysMsgUnread > 0" class="u-unread">{{sysMsgUnread}}</span>
        </div>
      </router-link>
    </li>
    <li class="u-list-item" @contextmenu="showMenu" @click="activeId = session.id" :class="session.id === activeId ? 'u-list-item-active' : ''" v-for="session in sessionlist" :key="session.id" :id="session.id">
      <VueContextMenu :contextMenuData="sessionMenuData" @delete="deleteSession"/>
      <router-link :to="{name:'chat', query:{sessionId: session.id, firstFlag: true}}">
        <div class="u-list-item-container">
          <img class="icon" :src="session.avatar"/>
          <div class="multi-content">
            <div class="title">{{session.name}}</div>
            <div class="content">{{session.lastMsgShow}}</div>
          </div>
          <div style="margin-left:0.6rem;display:list-item;">
            <div style="color:#ccc;overflow:hidden;white-space:nowrap;font-size:0.8rem;">{{session.updateTimeShow}}</div> 
            <span v-show="session.unread > 0" class="u-unread">{{session.unread}}</span>
          </div>
        </div>
      </router-link>
    </li>
  </ul>
</div>
</template>

<script>
import util from '../../utils'
import config from '../../configs'
import { setTimeout } from 'timers'
import pageUtil from '../../utils/page'
export default {
  name: 'session-list',
  mounted () {
    var _this = this
    this.eventBus.$on('locationMainListItem', function (data) {
      if (data.listType === 'session') {
        setTimeout(() => {
          pageUtil.scrollMainList('nsession-list', data.activeId)
          _this.activeId = data.activeId
        }, 500)
      }
    })
  },
  data () {
    return {
      activeId: '',
      delSessionId: null,
      stopBubble: false,
      noticeIcon: config.noticeIcon,
      myPhoneIcon: config.myPhoneIcon,
      myGroupIcon: config.defaultGroupIcon,
      myAdvancedIcon: config.defaultAdvancedIcon,
      menuId: '',
      sessionMenuData: {
        menuName: 'sessionMenu',
        axios: {x: null, y: null},
        menulists: [
          {fnHandler: 'delete', btnName: '删除会话'}
        ]
      }
    }
  },
  computed: {
    sysMsgUnread () {
      let temp = this.$store.state.sysMsgUnread
      let sysMsgUnread = temp.addFriend || 0
      sysMsgUnread += temp.team || 0
      let customSysMsgUnread = this.$store.state.customSysMsgUnread
      let total = sysMsgUnread + customSysMsgUnread
      return total > 99 ? 99 : total
    },
    userInfos () {
      return this.$store.state.userInfos
    },
    myInfo () {
      return this.$store.state.myInfo
    },
    myPhoneId () {
      return `${this.$store.state.userUID}`
    },
    sessionlist () {
      let sessionlist = this.$store.state.sessionlist.filter(item => {
        item.name = ''
        item.avatar = ''
        if (item.scene === 'p2p') {
          let userInfo = null
          if (item.to !== this.myPhoneId) {
            userInfo = this.userInfos[item.to]
          } else {
            // userInfo = this.myInfo
            // userInfo.alias = '我的手机'
            // userInfo.avatar = `${config.myPhoneIcon}`
            return false
          }
          if (userInfo) {
            item.name = util.getFriendAlias(userInfo)
            item.avatar = userInfo.avatar
          }
        } else if (item.scene === 'team') {
          let teamInfo = null
          teamInfo = this.$store.state.teamlist.find(team => {
            return team.teamId === item.to
          })
          if (teamInfo) {
            item.name = teamInfo.name
            item.avatar = teamInfo.avatar || (teamInfo.type === 'normal' ? this.myGroupIcon : this.myAdvancedIcon)
          } else {
            item.name = `群${item.to}`
            item.avatar = item.avatar || this.myGroupIcon
          }
        }
        let lastMsg = item.lastMsg || {}
        if (lastMsg.type === 'text') {
          item.lastMsgShow = lastMsg.text || ''
        } else if (lastMsg.type === 'custom') {
          item.lastMsgShow = util.parseCustomMsg(lastMsg)
        } else if (lastMsg.scene === 'team' && lastMsg.type === 'notification') {
          item.lastMsgShow = util.generateTeamSysmMsg(lastMsg)
        } else if (util.mapMsgType(lastMsg)) {
          item.lastMsgShow = `[${util.mapMsgType(lastMsg)}]`
        } else {
          item.lastMsgShow = ''
        }
        if (item.updateTime) {
          item.updateTimeShow = util.formatDate(item.updateTime, true)
        }
        if (item.unread > 99) item.unread = 99
        return item
      })
      return sessionlist
    }
  },
  methods: {
    enterMyChat () {
      // 我的手机页面
      location.href = `#/chat/p2p-${this.myPhoneId}`
    },
    showMenu (parameter) {
      parameter.preventDefault()
      var x = parameter.clientX
      var y = parameter.clientY
      this.menuId = parameter.currentTarget.id
      this.sessionMenuData.axios = {
        x, y
      }
    },
    deleteSession () {
      if (this.menuId) {
        this.$store.dispatch('deleteSession', this.menuId)
      }
    }
  }
}
</script>

<style>
/*时间提示*/
.g-window .u-session-time {
  display: inline-block;
  position: relative;
  right: 1.8rem;
  top: 1.1rem;
}
/* 未读数标签 */
.g-window .u-unread {
    display: block;
    margin: 0 auto;
    padding: 2px;
    min-width: 1rem;
    width: 1rem;
    min-height: 1rem;
    line-height: 1rem;
    font-size: 12px;
    background-color: #f00;
    color: #fff;
    text-align: center;
    border-radius: 50%;
}
</style>
