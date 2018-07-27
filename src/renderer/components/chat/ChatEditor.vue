<template>
<div class="m-chat-editor" style="border-top-style:solid; border-top-width:1px; border-color:rgb(220,222,224);">
  <!--<chat-emoji
    v-bind:type="type"
    v-bind:scene="scene"
    v-bind:to="to"
    v-show="isEmojiShown"
    v-on:add-emoji="addEmoji"
    v-on:hide-emoji="hideEmoji"
  ></chat-emoji>-->
  <div class="m-chat-editor-main">
    <div class="u-editor-input">
      <textarea v-model="msgToSent"/>
    </div>
    <div class="u-editor-icons">
      <!--<div v-if="!isRobot" class="u-editor-icon" style="cursor: pointer;" @click="showEmoji">
        <i class="u-icon-img"><img :src="icon1"></i>
      </div>-->
      <div v-if="!isRobot" class="u-editor-icon" @change="sendFileMsg">
        <i class="u-icon-img">
          <img :src="icon2"/>
        </i>
        <input type="file" ref="fileToSent" accept="image/*"/>
      </div>
    </div>
    <div class="u-positive-btn btn-send" @click="sendTextMsg">发 送</div>
  </div>
</div>
</template>

<script>
import ChatEmoji from './ChatEmoji'
// import util from '../../utils'
import config from '../../configs'
export default {
  components: {
    ChatEmoji
  },
  updated () {
    window.document.body.addEventListener('click', () => {
      this.isEmojiShown = false
    })
  },
  props: {
    type: String,
    scene: String,
    to: String,
    isRobot: {
      type: Boolean,
      default () {
        return false
      }
    },
    invalid: {
      type: Boolean,
      default: false
    },
    invalidHint: {
      type: String,
      default: '您无权限发送消息'
    },
    advancedTeam: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    continueRobotAccid (curVal, oldVal) {
      if (curVal && this.robotInfos[curVal]) {
        this.msgToSent = `@${this.robotInfos[curVal].nick} `
      }
      // 重置
      this.$store.dispatch('continueRobotMsg', '')
    },
    msgToSent (curVal, oldVal) {
      if (this.isRobot) {
        return
      }
      let indexAt = this.msgToSent.indexOf('@')
      if (indexAt >= 0 && (indexAt === this.msgToSent.length - 1)) {
        if (this.robotslist && this.robotslist.length > 0) {
          this.isRobotListShown = true
        }
      } else if (this.isRobotListShown === true) {
        this.isRobotListShown = false
      }
    }
  },
  data () {
    return {
      isEmojiShown: false,
      isRobotListShown: false,
      msgToSent: '',
      icon1: `${config.resourceUrl}/im/chat-editor-1.png`,
      icon2: `${config.resourceUrl}/im/chat-editor-2.png`,
      icon3: `${config.resourceUrl}/im/chat-editor-3.png`
    }
  },
  computed: {
    continueRobotAccid () {
      return this.$store.state.continueRobotAccid
    },
    robotslist () {
      return this.$store.state.robotslist
    },
    robotInfos () {
      return this.$store.state.robotInfos
    },
    robotInfosByNick () {
      return this.$store.state.robotInfosByNick
    }
  },
  methods: {
    sendTextMsg () {
      if (this.invalid) {
        this.$toast(this.invalidHint)
        return
      }
      if (/^\s*$/.test(this.msgToSent)) {
        this.$vux.alert.show({
          title: '请不要发送空消息'
        })
        return
      } else if (this.msgToSent.length > 800) {
        this.$vux.alert.show({
          title: '请不要超过800个字'
        })
        return
      }
      this.msgToSent = this.msgToSent.trim()
      if (this.type === 'session') {
        // 如果是机器人
        if (this.isRobot) {
          this.$store.dispatch('sendRobotMsg', {
            type: 'text',
            scene: this.scene,
            to: this.to,
            robotAccid: this.to,
            // 机器人后台消息
            content: this.msgToSent,
            // 显示的文本消息
            body: this.msgToSent
          })
        } else {
          let robotAccid = ''
          let robotText = ''

          let atUsers = this.msgToSent.match(/@[^\s@$]+/g)
          if (atUsers) {
            for (let i = 0; i < atUsers.length; i++) {
              let item = atUsers[i].replace('@', '')
              if (this.robotInfosByNick[item]) {
                robotAccid = this.robotInfosByNick[item].account
                robotText = (this.msgToSent + '').replace(atUsers[i], '').trim()
                break
              }
            }
          }
          if (robotAccid) {
            if (robotText) {
              this.$store.dispatch('sendRobotMsg', {
                type: 'text',
                scene: this.scene,
                to: this.to,
                robotAccid,
                // 机器人后台消息
                content: robotText,
                // 显示的文本消息
                body: this.msgToSent
              })
            } else {
              this.$store.dispatch('sendRobotMsg', {
                type: 'welcome',
                scene: this.scene,
                to: this.to,
                robotAccid,
                // 显示的文本消息
                body: this.msgToSent
              })
            }
          } else {
            this.$store.dispatch('sendMsg', {
              type: 'text',
              scene: this.scene,
              to: this.to,
              text: this.msgToSent
            })
          }
        }
      } else if (this.type === 'chatroom') {
        let robotAccid = ''
        let robotText = ''

        let atUsers = this.msgToSent.match(/@[^\s@$]+/g)
        if (atUsers) {
          for (let i = 0; i < atUsers.length; i++) {
            let item = atUsers[i].replace('@', '')
            if (this.robotInfosByNick[item]) {
              robotAccid = this.robotInfosByNick[item].account
              robotText = (this.msgToSent + '').replace(atUsers[i], '').trim()
              break
            }
          }
        }
        if (robotAccid) {
          if (robotText) {
            this.$store.dispatch('sendChatroomRobotMsg', {
              type: 'text',
              robotAccid,
              // 机器人后台消息
              content: robotText,
              // 显示的文本消息
              body: this.msgToSent
            })
          } else {
            this.$store.dispatch('sendChatroomRobotMsg', {
              type: 'welcome',
              robotAccid,
              // 显示的文本消息
              body: this.msgToSent
            })
          }
        } else {
          this.$store.dispatch('sendChatroomMsg', {
            type: 'text',
            text: this.msgToSent
          })
        }
      }
      this.msgToSent = ''
    },
    sendPlayMsg () {
      if (this.invalid) {
        this.$toast(this.invalidHint)
        return
      }
      // 发送猜拳消息
      if (this.type === 'session') {
        this.$store.dispatch('sendMsg', {
          type: 'custom',
          scene: this.scene,
          to: this.to,
          pushContent: '[猜拳]',
          content: {
            type: 1,
            data: {
              value: Math.ceil(Math.random() * 3)
            }
          }
        })
      } else if (this.type === 'chatroom') {
        this.$store.dispatch('sendChatroomMsg', {
          type: 'custom',
          pushContent: '[猜拳]',
          content: {
            type: 1,
            data: {
              value: Math.ceil(Math.random() * 3)
            }
          }
        })
      }
    },
    sendFileMsg () {
      if (this.invalid) {
        this.$toast(this.invalidHint)
        return
      }
      let ipt = this.$refs.fileToSent
      if (ipt.value) {
        if (this.type === 'session') {
          this.$store.dispatch('sendFileMsg', {
            scene: this.scene,
            to: this.to,
            fileInput: ipt
          })
        } else if (this.type === 'chatroom') {
          this.$store.dispatch('sendChatroomFileMsg', {
            fileInput: ipt
          })
        }
      }
    },
    showEmoji () {
      alert('showEmoji')
      this.isEmojiShown = true
    },
    hideEmoji () {
      this.isEmojiShown = false
    },
    addEmoji (emojiName) {
      this.msgToSent += emojiName
      this.hideEmoji()
    },
    chooseRobot (robot) {
      if (robot && robot.account) {
        let len = this.msgToSent.length
        if (len === 0 || this.msgToSent[len - 1] !== '@') {
          this.msgToSent += '@' + robot.nick + ' '
        } else {
          this.msgToSent += robot.nick + ' '
        }
      }
    },
    hideRobotList () {
      this.isRobotListShown = false
    },
    turnToMsgReceipt () {
      if (this.invalid) {
        this.$toast(this.invalidHint)
        return
      }
      this.location = `#/teamSendMsgReceipt/${this.to}`
    }
  }
}
</script>

<style scoped>
.g-window .m-chat-editor {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 14rem;
  width: 100%;
  background-color: white;
}
/* 聊天按钮组件 */
.g-window .m-chat-editor-main {
  position: relative;
  display: block;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  padding: 0;
  width: 100%;
  height: 100%;
}

.g-window .m-chat-editor-main .u-editor-input {
  position: relative;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  margin: 2px;
  padding: 2.5rem 0.5rem 0.5rem 0.5rem;
  height: 10rem;
  width: 100%;
}

.g-window .m-chat-editor-main .u-editor-input textarea {
  position: relative;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  padding: 0.2rem;
  font-size: 1rem;
  height: 100%;
  width: 100%;
  text-align: left;
  resize:none;
  overflow-x:hidden;
  overflow-y:auto;
  border: 0px;
}
.g-window .m-chat-editor-main .btn-send {
  position: absolute;
  float: right;
  top: 10rem;
  right: 2rem;
  bottom: 0;
  width: 5rem;
  height: 1.5rem;
  line-height: 1.5rem;
  padding: 0.1rem 0.2rem;
  border-radius: 0.2rem;
  text-align: center;
}

.g-window .m-chat-editor-main .u-editor-icons {
    position: absolute;
    display: inline-block;
    left: 0;
    top: 0;
    width: 11rem;
    height: 2rem;
    cursor: pointer;
}
.g-window .m-chat-editor-main .u-editor-icons .u-editor-icon {
    position: relative;
    display: inline-block;
    top: 0.6rem;
    width: 1.2rem;
    height: 1.2rem;
    margin-left: 1rem;
    vertical-align: middle;
}
.g-window .m-chat-editor-main .u-editor-icons .u-editor-icon input[type="file"] {
  position: absolute;
  display: inline-block;
  left: 0;
  top: 0;
  width: inherit;
  height: inherit;
  opacity: 0;
  font-size: 1rem;
}
.g-window .u-icon {
    display: inline-block;
    width: inherit;
    height: inherit;
    background-size: 20rem;
    background-image: url(http://yx-web.nos.netease.com/webdoc/h5/im/icons.png);
}

.g-window .u-icon-img {
    position: relative;
    width: inherit;
    height: inherit;
}
.g-window .u-icon-img img {
    position: relative;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
}

</style>