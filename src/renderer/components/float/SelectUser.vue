<template>
<div v-if="selectData.showSelect" id="selectUserCover" style="width:100%;height:100%;top: 0;position: absolute;" @click="checkClose()">
<div style="background-color:rgb(245,249,255);width:40rem;height:30rem;top:50%;left:50%;position:absolute;margin:-15rem 0 0 -20rem;box-shadow: rgb(102, 102, 102) 0px 0px 1rem;">
  <div class="u-caption" style="border-bottom-style:solid;border-bottom-width:1px; border-color:rgb(220,222,224);">
    <div style="display:inline-block;margin-left:1rem;margin-top:0.5rem">{{captionName}}</div>
    <div class="u-sysbtn">
      <a class="btn-close" @click="onClose"/>
    </div>
  </div>
  <div class="g-hbf-container">
      <div class="g-hbf-header" style="height:25rem;background-color:white;-webkit-app-region: no-drag;" v-if="step === 'select'">
          <div style="width:31rem; height: 25rem; float:left;flex-grow: 1;">
            <div v-for="group in friendsGroups" :key="group.letter" class='m-group'>
                <div style="background-color:rgb(245,249,255);">
                    <em >{{group.letter}}</em>
                </div>             
                <a v-for="friend in group.arr" :key="friend.account" @click='itemClick(friend)' >
                    <span class='check-icon' style="margin-left:0.5rem;" slot='icon' :class='friend.ingroup ? "checked-grey": (friend.checked ? "checked-blue": "unchecked")'></span>
                    <img class="icon u-circle" slot="icon" width="25" height="25" :src="userInfos[friend.account].avatar">
                    <div style="overflow:hidden;text-overflow:ellipsis; text-align:left;white-space:nowrap;display:inline-block; width:6rem;">{{friend.alias}}</div>
                </a>
            </div>            
          </div>
          <div style="width:8rem;height:25rem;display:inline-block;border-left-style:solid;border-left-width:1px; border-color:rgb(220,222,224);">
            <div class='m-selected'>
                <a style="display:list-item;align-items: center;margin:auto; display: flex;padding:6px" v-for='friend in selected' :key='friend.account' @click='unSelect(friend)'>
                    <img class='u-circle' width="25" height="25" :src='userInfos[friend.account].avatar'/>
                    <div style="margin-left:0.5rem;overflow:hidden;text-overflow:ellipsis; text-align:left;white-space:nowrap;display:inline-block; width:5rem;">{{friend.alias}}</div> 
                </a>
            </div>
          </div>
      </div>
      <div class="g-hbf-header" style="background-color:white;height:25rem;-webkit-app-region: no-drag;" v-else>
        <div style="margin: 0 auto;top: 50%;left: 50%; width: 60%; height:100%; ">
          <div class="cells">
            <div class="cell">
              <span>群名称</span>
              <input type="text" class="ipt" maxlength="20" v-model="teamInfo.name"/>
            </div>
            <div class="cell">
              <span>群介绍</span>
              <input type="text" class="ipt" maxlength="20" v-model="teamInfo.intro"/>
            </div>
          </div>    
        </div>
      </div>
      <div class="g-hbf-footer" style="background-color: rgb(245,249,255);height:3rem;bottom:2rem;">
          <div v-if="selectMode === 'createTeam'" style="margin-top:0.8rem">
            <a style="float: left;margin-left: 1rem;" @click="step = 'select'">上一步</a>
            <a style="float: right;margin-right: 1rem;" @click="nextStep">{{confirmText}}</a>
          </div>
          <a v-else-if="selectMode === 'addMember'" style="float: right;margin-right:1rem;margin-top:0.8rem" @click="addMembers">{{`确认(${selected.length})`}}</a>
      </div>
  </div>
</div>
</div>
</template>

<script>
import {getPinyin} from '../../utils/pinyin'
export default {
  name: 'select-user',
  mounted () {
    var _this = this
    this.eventBus.$on('openSelect', function (data) {
      _this.selectData.selectMode = data.selectMode
      _this.selectData.teamId = data.teamId
      _this.selectData.showSelect = true
      _this.selected = []
      _this.step = 'select'
      _this.teamInfo = {name: '', intro: ''}
    })
  },
  data () {
    return {
      step: 'select',
      selected: [],
      teamInfo: {name: '', intro: ''},
      selectData: {showSelect: false, selectMode: 'addMember', teamId: ''}
    }
  },
  methods: {
    checkClose (e) {
      e = e || window.event
      e = e.target || e.srcElement
      if (e.nodeName === 'DIV' && e.id === 'selectUserCover') {
        // this.onClose()
      }
    },
    onClose: function () {
      this.selectData.showSelect = false
    },
    itemClick (friend) {
      if (!friend.ingroup) {
        friend.checked = !friend.checked
        if (friend.checked) {
          this.selected.push(friend)
        } else {
          this.selected.splice(this.selected.indexOf(friend), 1)
        }
      }
    },
    unSelect (friend) {
      friend.checked = false
      this.selected.splice(this.selected.indexOf(friend), 1)
      this.$forceUpdate()
    },
    addMembers () {
      if (this.selected.length === 0) return
      this.$store.dispatch('showLoading')
      var accounts = this.selected.map((friend) => {
        return friend.account
      })
      this.$store.dispatch('delegateTeamFunction', {
        functionName: 'addTeamMembers',
        options: {
          teamId: this.teamId,
          accounts: accounts,
          done: (error, obj) => {
            this.$store.dispatch('hideLoading')
            if (error) {
              this.$toast(error)
              return
            }
            this.$toast('邀请成员成功')
            setTimeout(() => {
              this.onClose()
            }, 1000)
          }
        }
      })
    },
    nextStep () {
      if (this.step === 'select') {
        this.step = 'confirm'
        return
      }
      if (this.step === 'confirm') {
        this.$store.dispatch('showLoading')
        var accounts = this.selected.map((friend) => {
          return friend.account
        })
        this.teamInfo.name = this.teamInfo.name.replace(/^\s+|\s+$/g, '')
        if (this.teamInfo.name.length === 0) {
          var count = 0
          var _name = []
          _name.push(this.$store.state.myInfo.nick)
          for (var i = 0; i < this.selected.length; i++) {
            if (count === 2) break
            _name.push(this.selected[i].alias)
            count++
          }
          this.teamInfo.name = _name.join(',')
        }
        this.$store.dispatch('delegateTeamFunction', {
          functionName: 'createTeam',
          options: {
            type: 'advanced',
            name: this.teamInfo.name,
            intro: this.teamInfo.intro,
            accounts: accounts,
            joinMode: 'noVerify',
            beInviteMode: 'noVerify',
            inviteMode: 'manager',
            done: (error, obj) => {
              this.$store.dispatch('hideLoading')
              if (error) {
                this.$toast(error)
                return
              }
              this.$toast('创建群成功')
              setTimeout(() => {
                this.onClose()
              }, 1000)
            }
          }
        })
      }
    }
  },
  computed: {
    captionName () {
      return this.selectMode === 'addMember' ? '添加群成员' : '创建群'
    },
    confirmText () {
      return this.step === 'select' ? '下一步' : '确认'
    },
    frinedList () {
      var teamMember = this.$store.state.teamMembers && this.$store.state.teamMembers[this.teamId]
      var list = this.$store.state.friendslist.map(item => {
        var friend = Object.assign({}, item)
        let account = friend.account
        let thisAttrs = this.userInfos[account]
        let alias = thisAttrs.alias ? thisAttrs.alias.trim() : ''
        friend.alias = alias || thisAttrs.nick || account
        friend.pinyin = getPinyin(friend.alias, '').toUpperCase()
        friend.checked = false

        if (teamMember) {
          teamMember.forEach(item => {
            if (friend.account === item.account) {
              friend.ingroup = true
            }
          })
        }
        return friend
      })
      list.sort((a, b) => {
        return a.pinyin < b.pinyin ? -1 : a.pinyin > b.pinyin ? 1 : 0
      })
      return list
    },
    friendsGroups () {
      var map = Object.create(null)
      this.frinedList.forEach(friend => {
        var firstLetter = friend.pinyin[0]
        firstLetter = firstLetter >= 'A' && firstLetter <= 'Z' ? firstLetter : '#'
        if (map[firstLetter] === undefined) {
          map[firstLetter] = []
        }
        map[firstLetter].push(friend)
      })
      var groups = []
      for (const key in map) {
        groups.push({
          letter: key,
          arr: map[key]
        })
      }
      return groups
    },
    userInfos () {
      return this.$store.state.userInfos
    },
    selectMode () {
      return this.selectData.selectMode
    },
    teamId () {
      return this.selectData.teamId
    },
    showSelect () {
      return this.selectData.showSelect
    }
  }
}
</script>

<style>
.m-group .checked-grey, .checked-blue, .unchecked{
        display: inline-block;
        width: 1.4rem;
        height: 1.4rem;
        background-size: 20rem;
        background-image: url(http://yx-web.nos.netease.com/webdoc/h5/im/icons.png);
        background-position: -5rem .2rem;
      }

.m-group .checked-blue {
        background-position: -3.7rem -2.95rem;
      }

.m-group .unchecked {
        background-position: -5.15rem -2.95rem;
      }

.m-group em{
        display: block;
        position: relative;
        padding-left: 1rem;
      }
</style>
