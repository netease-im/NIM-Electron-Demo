<template>
  <ul id="chat-list" class="p-chat-list">
    <li class="msg-attri-tip" v-if="canLoadMore" @click="loadMore">
      点击加载更多
    </li>
    <li class="msg-attri-tip" v-else>
      已无更多记录
    </li>
    <chat-item
      v-for="msg in msglist"
      :type="type"
      :rawMsg="msg"
      :isRobot="isRobot"
      :userInfos="userInfos"
      :myInfo="myInfo"
      :key="msg.idClient"
      :isHistory='isHistory'
      @msg-loaded="msgLoaded"
    ></chat-item>
  </ul>

</template>
<script>
  // import util from '../../utils'
  // import config from '../../configs'
  // import emojiObj from '../../configs/emoji'
  import ChatItem from './ChatItem'

  export default {
    components: {
      ChatItem
    },
    props: {
      type: String, // 类型，chatroom, session
      canLoadMore: [String, Boolean],
      isRobot: {
        type: Boolean,
        default () {
          return false
        }
      },
      msglist: {
        type: Array,
        default () {
          return []
        }
      },
      userInfos: {
        type: Object,
        default () {
          return {}
        }
      },
      myInfo: {
        type: Object,
        default () {
          return {}
        }
      },
      isHistory: {
        type: Boolean,
        default () {
          return false
        }
      }
      // robotInfos: {
      //   type: Object,
      //   default () {
      //     return {}
      //   }
      // }
    },
    data () {
      return {
        isFullImgShow: false,
        msgLoadedTimer: null
      }
    },
    methods: {
      showFullImg (src) {
        this.$store.dispatch('showFullscreenImg', {
          src
        })
      },
      msgLoaded () {
        clearTimeout(this.msgLoadedTimer)
        this.msgLoadedTimer = setTimeout(() => {
          this.$emit('msgs-loaded')
        }, 20)
      },
      loadMore () {
        this.$emit('load-more')
      }
    }
  }
</script>

<style type="text/css">
  .p-chat-list{
    overflow-y:auto;
    overflow-x:hidden;
    height:100%
  }

  .p-chat-list .u-icon {
      width: 1.4rem;
      height: 1.6rem;
      margin-right: 0.2rem;
      vertical-align: bottom;
  }

  .p-chat-list .msg-attri-tip{
    position: relative;
    font-size: 0.8rem;
    text-align: center;
    color: white;
    background-color:#ccc;
    margin: auto;
    width: 10rem;
    border-radius: 0.4rem;
  }
</style>