<template>
<div class="m-main-list">
  <ul class="u-list">
    <li class="u-list-item" @click="activeId = friend.account" :class="friend.account === activeId ? 'u-list-item-active' : ''" v-for="friend in friendslist" :key="friend.account">
      <router-link :to="{name:'namecard', query:{accid: friend.account}}">
        <div class="u-list-item-container">
          <img class="icon" slot="icon" :src="userInfos[friend.account].avatar"/>
          <div class="single-content">
            {{friend.alias}}
          </div>      
        </div>           
      </router-link>
    </li>
  </ul>
</div>
</template>

<script>
export default {
  name: 'contacts-list',
  data () {
    return {
      activeId: ''
    }
  },
  computed: {
    friendslist () {
      return this.$store.state.friendslist.filter(item => {
        let account = item.account
        let thisAttrs = this.userInfos[account]
        let alias = thisAttrs.alias ? thisAttrs.alias.trim() : ''
        item.alias = alias || thisAttrs.nick || account
        if ((!thisAttrs.isFriend) || (thisAttrs.isBlack)) {
          return false
        }
        return true
      })
    },
    blacklist () {
      return this.$store.state.blacklist.filter(item => {
        let account = item.account
        let thisAttrs = this.userInfos[account]
        let alias = thisAttrs.alias ? thisAttrs.alias.trim() : ''
        item.alias = alias || thisAttrs.nick || account
        if (!thisAttrs.isFriend) {
          return false
        }
        return true
      })
    },
    robotslist () {
      return this.$store.state.robotslist.map(item => {
        return item
      })
    },
    userInfos () {
      return this.$store.state.userInfos
    }
  }
}
</script>

<style>
    .p-contacts .add-friend {
      background-color: #fff;
    }
    .p-contacts .m-list {
      padding-top: 8rem;
    }
    .p-contacts .u-search-box-wrap {
      text-align: center;
    }
    .p-contacts .u-search-box {
      position: relative;
      display: inline-block;
      box-sizing: border-box;
      min-width: 45%;
      padding: 1em;
      height: 3rem;
      text-align: center;
      border: 1px solid #ccc;
      background-color: #fff;
      font-size: 0.8rem;
      box-shadow: 2px 2px 6px #ccc;
    }

    .p-contacts .u-search-box a {
        display: inline-block;
        box-sizing: border-box;
        height: 100%;
        width: 100%;
    }

    .p-contacts .u-card .icon {
        display: inline-block;
        margin-right: 0.4rem;
        width: 1.4rem;
        height: 1.4rem;
        background-size: 20rem;
      }
     .p-contacts .u-card .icon-team-advanced {
        background-position: 0 -3rem;
        background-image: url(http://yx-web.nos.netease.com/webdoc/h5/im/icons.png);
      }
     .p-contacts .u-card .icon-team {
        background-position: -2.1rem -3rem;
        background-image: url(http://yx-web.nos.netease.com/webdoc/h5/im/icons.png);
      }
</style>

