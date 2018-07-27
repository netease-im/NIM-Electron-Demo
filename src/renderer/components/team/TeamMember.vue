<template>
  <div class="m-members">
    <a v-if='hasInvitePermission && showAllMode' class='u-member' @click="openSelect">
      <img class='avatar' src="http://yx-web.nos.netease.com/webdoc/h5/im/team_member_add.png" alt="">
      <span>添加</span>
    </a>
    <a class='u-member' v-for='(member, index) in membersInDisplay' :key='member.account'>
      <img class='avatar u-circle' :src='member.avatar' @mouseover='hoverIndex = index' @mouseleave='hoverIndex = 0'>
      <span v-show='member.type !== "owner" && member.account !== $store.state.userUID && hasRemovePermission && showRemove(index)' class='remove' @click='remove($event, member)' @mouseover='hoverIndex = index'></span>
      <span v-if='member.type !== "normal"' :class='member.type === "manager" ? "manager" : "owner"' ></span>
      <span>{{member.alias}}</span>
    </a>
  </div>
</template>

<script>
export default {
  name: 'team-memeber',
  props: {
    teamId: {
      type: String
    },
    // 是否为高级群
    advanced: {
      type: Boolean,
      default: false
    },
    // 显示全部群成员模式
    showAllMode: {
      type: Boolean,
      default: false
    },
    filterAccount: {
      type: Array
      // [account1, account2]。 若设置了，则只显示该数组中的群成员, 应用场景：群消息回执中, 对已读未读进行了分组。
    }
  },
  data () {
    return {
      hasSearched: false,
      isOwner: false,
      hoverIndex: 0
    }
  },
  computed: {
    teamInfo () {
      var teamList = this.$store.state.teamlist
      var team = teamList && teamList.find(team => {
        return team.teamId === this.teamId
      })
      if (!team) {
        return undefined
      }
      return team
    },
    teamMemberInfo () {
      var members = this.$store.state.teamMembers[this.teamId]
      var info = members && members.find(item => {
        return item.account === this.$store.state.userUID
      })
      if (!info) return undefined
      return info
    },
    hasManagePermission () {
      let info = this.teamMemberInfo
      if (info !== undefined) return info.type !== 'normal'
      return false
    },
    members () {
      var members = this.$store.state.teamMembers[this.teamId]
      var userInfos = this.$store.state.userInfos
      var needSearchAccounts = []
      if (members) {
        members = members.map(item => {
          var member = Object.assign({}, item) // 重新创建一个对象，用于存储展示数据，避免对vuex数据源的修改
          member.valid = true // 被管理员移除后，标记为false
          if (member.account === this.$store.state.userUID) {
            member.alias = '我'
            member.avatar = this.$store.state.myInfo.avatar
            this.isOwner = member.type === 'owner'
          } else if (userInfos[member.account] === undefined) {
            needSearchAccounts.push(member.account)
            member.avatar = member.avatar || this.avatar
            member.alias = member.nickInTeam || member.account
          } else {
            member.avatar = userInfos[member.account].avatar
            member.alias = member.nickInTeam || userInfos[member.account].nick
          }
          return member
        })
        if (needSearchAccounts.length > 0 && !this.hasSearched) {
          this.hasSearched = true
          while (needSearchAccounts.length > 0) {
            this.searchUsers(needSearchAccounts.splice(0, 150))
          }
        }
        return members
      }
      return []
    },
    membersInDisplay () {
      if (this.filterAccount) {
        return this.members.filter(member => {
          return !!this.filterAccount.find(account => account === member.account)
        })
      } else if (this.advanced || this.showAllMode) {
        return this.members
      } else {
        return this.members.slice(0, this.hasInvitePermission ? 3 : 4)
      }
    },
    hasInvitePermission () {
      return this.advanced && (this.hasManagePermission || (this.teamInfo && this.teamInfo.inviteMode === 'all'))
    },
    hasRemovePermission () {
      return this.advanced && this.hasManagePermission
    }
  },
  methods: {
    openSelect () {
      let data = {teamId: this.teamId, selectMode: 'addMember'}
      this.eventBus.$emit('openSelect', data)
    },
    showRemove (currentIndex) {
      return this.hoverIndex === currentIndex
    },
    searchUsers (Accounts) {
      this.$store.dispatch('searchUsers',
        {
          accounts: Accounts,
          done: (users) => {
            this.updateTeamMember(users)
          }
        })
    },
    updateTeamMember (users) {
      users.forEach(user => {
        var member = this.members.find(member => {
          return member.account === user.account
        })
        if (member) {
          member.avatar = user.avatar
          member.alias = member.nickInTeam || user.nick
        }
      })
    },
    remove (e, member) {
      this.$store.dispatch('showLoading')
      this.$store.dispatch('delegateTeamFunction', {
        functionName: 'removeTeamMembers',
        options: {
          teamId: this.teamId,
          accounts: [member.account],
          done: (_error, obj) => {
            this.$toast('移除成功')
            this.$store.dispatch('hideLoading')
          }
        }
      })
      e.cancelBubble = true
      e.preventDefault()
    }
  }
}
</script>

<style scoped>

.m-members {
  display: flex;
  flex-wrap: wrap;
  margin: 0 auto;
  text-align: center;
  width: 100%;
  }

.m-members img.avatar {
    width: 3.8rem;
    height: 3.8rem;
    flex: 0 1 auto;
}

.u-member {
    display: flex;
    position: relative;
    flex-direction: column;
    align-items: center;
    width: 25%;
    margin: .5rem 0;
}

.u-member .remove,.u-member .manager,.u-member .owner {
      display: inline-block;
      position: absolute;
      bottom: 1.1rem;
      right: 0;
      width: 2rem;
      height: 2rem;
      background: url(http://yx-web.nos.netease.com/webdoc/h5/im/icons.png);
      background-position: -10.3rem 0;
      background-size: 20rem
    }

.u-member .owner {
      background-position: -10.3rem -2.7rem;
}

.u-member .remove {
      top: 0;
      right: 0;
      width: 2.4rem;
      height: 2.4rem;
      background-position: -10.1rem -5.1rem;
    }

.u-member span {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

 .u-member .s-bg-white{
    background-color: white;
  }
</style>
