<template>
  <div class="g-hbf-container">
    <div class="g-hbf-header">
      <div style="height:100%;width: 20rem;margin: 0 auto;display: flex;align-items: center;">
          <img :src="userInfo.avatar" style="height:4rem;display:inline-block;margin-top:2rem;">
          <div style="margin-left:2rem;display:inline-block;text-align:left;">
            <p v-show="hasAlias">{{userInfo._alias}}</p>
            <p>账号: {{userInfo.account}}</p>
            <p>昵称: {{userInfo.alias}}</p>
           </div>
      </div>
    </div>
    <div class="g-hbf-body">
      <div v-if="isRobot" class="m-list m-robot">
        <div class="u-logo">
          <img class="logo" :src="userInfo.avatar">
          <h3>{{userInfo.alias}}</h3>
          <p>@{{userInfo.account}}</p>
        </div>
        <div class="u-desc">
          <p>{{userInfo.intro}}</p>
        </div>
      </div>
      <div v-else class="m-list">
        <ul class="u-card">
          <li>
            <div style="width: 20rem;margin: 0 auto;">
              <li class="u-card-cell" v-show="isFriend">备注名:&emsp;{{userInfo._alias}}</li>
              <li class="u-card-cell">性&emsp;别:&emsp;{{userInfo.gender}}</li>
              <li class="u-card-cell">生&emsp;日:&emsp;{{userInfo.birth}}</li>
              <li class="u-card-cell">手&emsp;机:&emsp;{{userInfo.tel}}</li>
              <li class="u-card-cell">邮&emsp;箱:&emsp;{{userInfo.email}}</li>
              <li class="u-card-cell">签&emsp;名:&emsp;{{userInfo.sign}}</li>
              <li class="u-card-cell" v-show='!isSelf && isFriend'>黑名单:&emsp;
                <img :src="switchOn" style="width:4rem; height:1.5rem; top:0.4rem; position:relative;" @click="changeBlack(false)" v-if="isBlack"/>
                <img :src="switchOff" style="width:4rem; height:1.5rem; top:0.4rem; position:relative;" @click="changeBlack(true)" v-else/>
              </li>     
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="g-hbf-footer">
      <div class="u-bottom" v-if="isRobot">
        <button type="button" @click="enterChat">开始对话</button>
      </div>
      <div class="u-bottom" v-else>
        <div style="margin:0 auto;width:20rem;padding-top:1rem">
          <button type="button" class="u-positive-btn btn-chat" @click="enterChat">聊天</button>
          <!--<button v-show="isFriend" type="button" @click="enterHistory">历史记录</button>-->
          <button v-show="isFriend" type="button" class="u-negative-btn btn-chat" @click="deleteFriend">删除好友</button>
          <button v-show="!isFriend && !isSelf" type="button" class="u-positive-btn btn-chat" @click="addFriend">添加好友</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import util from '../../utils'
export default {
  name: 'namecard',
  data () {
    return {
      isBlack: false,
      isSelf: false,
      switchOn: '../../static/img/setting/on_normal.png',
      switchOff: '../../static/img/setting/off_normal.png'
    }
  },
  computed: {
    account () {
      return this.$route.query.accid
    },
    userInfo () {
      let info = {}
      if (this.isRobot) {
        info = Object.assign({}, this.robotInfos[this.account])
        info.alias = info.nick || this.account
        info.avatar = info.originAvatar || info.avatar
      } else if (this.account === this.$store.state.userUID) {
        info = Object.assign({}, this.$store.state.myInfo)
        info.alias = info.nick
        this.isSelf = true
      } else {
        info = Object.assign({}, this.$store.state.userInfos[this.account])
        info._alias = info.alias // 服务器中存的别名，在备注栏展示
        info.alias = util.getFriendAlias(info)
        this.isBlack = info.isBlack
      }
      return info
    },
    robotInfos () {
      return this.$store.state.robotInfos
    },
    // 是否是联系人，黑名单和好友都算
    isFriend () {
      let userInfo = this.userInfo
      return userInfo.isFriend
    },
    hasAlias () {
      let userInfo = this.userInfo
      return userInfo.isFriend && userInfo._alias != null
    },
    isRobot () {
      if (this.robotInfos[this.account]) {
        return true
      }
      return false
    },
    remarkLink () {
      return `/namecardremark/${this.account}`
    }
  },
  methods: {
    changeBlack (black) {
      this.$store.dispatch('updateBlack', {
        account: this.account,
        isBlack: black
      })
    },
    enterChat () {
      let data = { navTo: 'session' }
      this.eventBus.$emit('updateNavBar', data)
      let sdata = { listType: 'session', activeId: 'p2p-' + this.account }
      this.eventBus.$emit('locationMainListItem', sdata)
      location.href = `#/mainpage/session/chat?sessionId=p2p-${this.account}`
    },
    enterHistory () {
      location.href = `#/chatHistory/p2p-${this.account}`
    },
    addFriend () {
      this.$store.dispatch('addFriend', this.account)
    },
    deleteFriend () {
      let that = this
      if (window.confirm('删除好友后，将同时解除双方的好友关系')) that.$store.dispatch('deleteFriend', that.account)
    }
  }
}
</script>

<style type="text/css">
  .m-list {
      padding-top: 1rem;
  }

  .u-bottom {
    height: 100%;
  }

  .u-bottom .btn-chat {
    margin: 0 1rem 0 0;
    line-height: 2.4rem;
    height: 2rem;
    width: 8rem;
  }

  /* 名片页面 */
.g-window .m-robot .u-logo {

    position: relative;

    margin: 1rem auto;

    text-align: center;
}
.g-window .m-robot .u-logo .logo {

    display: inline-block;

    margin: 1rem 0;

    width: 40%;

    height: auto;
}
.g-window .m-robot .u-logo h3 {

    margin: 1rem 0;

    font-weight: bold;

    font-size: 1.4rem;
}
.g-window .m-robot .u-desc {

    position: relative;

    margin: 1rem auto;

    width: 80%;

    text-align: left;

    color: #999;
}

</style>
