<template>
<div v-if="showFindX" id="findXCover" style="width:100%;height:100%;top: 0;position: absolute;" @click="checkClose()">
<div style="background-color:rgb(245,249,255);width:20rem;height:15rem;top:50%;left:50%;position:absolute;margin:-10rem 0 0 -10rem;box-shadow: rgb(102, 102, 102) 0px 0px 1rem;" >
  <div class="u-caption" style="border-bottom-style:solid;border-bottom-width:1px; border-color:rgb(220,222,224);">
    <div style="display:inline-block;margin-left:1rem;margin-top:0.5rem">{{captionName}}</div>
    <div class="u-sysbtn">
      <a class="btn-close" @click="onClose"/>
    </div>
  </div>
  <div class="g-hbf-container">
      <div class="g-hbf-header" style="height:10rem;background-color:white;-webkit-app-region: no-drag;display: flex;align-items: center;" v-if="step === 'select'">
        <div style="margin: 0 auto;top: 50%;left: 50%; width: 60%; height:100%;align-items: center; margin-top: 5rem; ">
          <div class="cells">
            <div class="cell" style="width: 12rem;">
              <input type="text" class="ipt" placeholder="输入群号/账号" v-model="searchId" style="padding: 0.6rem 0 0.6rem 0;"/>
            </div>
          </div> 
          <div class="cells">
            <div v-show="errorMsg" style="color:red;">{{errorMsg}}</div>
          </div>
        </div>
      </div>
      <div class="g-hbf-header" style="background-color:white;height:10rem;-webkit-app-region: no-drag;display: flex;align-items: center;" v-else>
        <div class="u-list-item-container m-findx-res" v-if="findXMode === 'team'">
          <img class="icon" slot="icon" style="display: inline-block;width: 3rem;" :src="X.avatar"/>
          <div class="multi-content" style="display: inline-block;margin-left: 1rem;">
            <div class="title">{{X.name}}</div>
            <div class="content">{{X.teamId}}</div>
          </div>
          <div class="cells">
            <div v-show="errorMsg" style="color:red;">{{errorMsg}}</div>
          </div>   
        </div>
        <div class="u-list-item-container m-findx-res" v-else>
          <img class="icon" style="display: inline-block;width: 3rem;" :src="X.avatar"/>
          <div class="multi-content" style="display: inline-block;margin-left: 1rem;">
            <div class="title">{{X.name}}</div>
            <div class="content">{{X.account}}</div>
          </div>
          <div class="cells">
            <div v-show="errorMsg" style="color:red;">{{errorMsg}}</div>
          </div>
        </div>
      </div>
      <div class="g-hbf-footer" style="background-color: rgb(245,249,255);height:3rem;bottom:2rem;">
          <div style="margin-top:0.5rem">
            <button type="button" class="u-positive-btn" style="float: right;margin-right: 1rem;height:2rem;width:5rem;" @click="nextStep">{{confirmText}}</button>
            <button type="button" class="u-negative-btn" style="float: right;margin-right: 1rem;height:2rem;width:5rem;" @click="onClose">取消</button>
          </div>
      </div>
  </div>
</div>
</div>
</template>

<script>
import tools from '../../utils/tool.js'
import config from '../../configs'
export default {
  name: 'find-x',
  mounted () {
    var _this = this
    this.eventBus.$on('findX', function (data) {
      _this.findXMode = data.findXMode
      _this.searchId = ''
      _this.X = {}
      _this.step = 'select'
      _this.showFindX = true
      _this.existX = false
    })
  },
  data () {
    return {
      findXMode: 'team',
      step: 'select',
      searchId: '',
      showFindX: false,
      errorMsg: '',
      X: {},
      existX: false,
      // 首次加载标志，因为mount和watch会有时序问题，首次加载不显示errorMsg
      firstEntry: true
    }
  },
  methods: {
    checkClose (e) {
      e = e || window.event
      e = e.target || e.srcElement
      if (e.nodeName === 'DIV' && e.id === 'findXCover') {
        // this.onClose()
      }
    },
    onClose: function () {
      this.showFindX = false
      this.step = 'select'
      this.searchId = ''
      this.errorMsg = ''
      this.X = {}
      this.firstEntry = true
      this.existX = false
      this.$store.dispatch('resetSearchResult')
    },
    doPreResult (val) {
      if ((val.length === 0) && (!this.firstEntry)) {
        this.errorMsg = this.findXMode === 'team' ? '无此群，请确认群号是否正确' : '无此用户，请确认账号是否正确'
      } else {
        this.errorMsg = ''
      }
      if (val.length !== 0) {
        this.X = val[0]
        if (this.findXMode === 'team') {
          if (this.teamValid()) {
            this.errorMsg = '你已经在群里'
            this.existX = true
          }
          if (!tools.isUrlValid(this.X.avatar)) {
            this.X.avatar = config.defaultGroupIcon
          }
        } else {
          if (this.friendExist()) {
            this.errorMsg = '好友已存在'
            this.existX = true
          }
          this.X.name = this.X.nick || this.X.account
          if (!tools.isUrlValid(this.X.avatar)) {
            this.X.avatar = config.defaultUserIcon
          }
        }
        this.step = 'confirm'
      }
    },
    friendExist () {
      if (this.searchId === '') return false
      let friend = this.$store.state.friendslist.find(f => {
        return f.account === this.searchId
      })
      return friend
    },
    teamValid () {
      if (this.searchId === '') return false
      let team = this.$store.state.teamlist && this.$store.state.teamlist.find(t => {
        return t.validToCurrentUser
      })
      return team
    },
    locationSession () {
      if (this.searchId === '') return false
      if (this.findXMode === 'team') {
        location.href = `#/mainpage/session/chat?sessionId=team-${this.searchId}&firstFlag=true`
      } else {
        location.href = `#/mainpage/session/chat?sessionId=p2p-${this.searchId}&firstFlag=true`
      }
      let data = { navTo: 'session' }
      this.eventBus.$emit('updateNavBar', data)
      let sdata = { listType: 'session', activeId: this.findXMode === 'team' ? 'team-' + this.searchId : 'p2p-' + this.searchId }
      this.eventBus.$emit('locationMainListItem', sdata)
      this.onClose()
    },
    nextStep: function () {
      if (this.step === 'select') {
        this.errorMsg = ''
        this.firstEntry = false
        if (this.searchId.lenght === 0) return
        if (this.findXMode === 'team') {
          if (!/^(\d){4,9}$/.test(this.searchId)) {
            this.errorMsg = '输入的群号非法'
            return
          }
          let _this = this
          this.$store.dispatch('searchTeam', {
            teamId: this.searchId,
            done (teams) {
              _this.doPreResult(teams)
            }
          })
        } else {
          if (this.searchId === this.$store.state.userUID) {
            this.errorMsg = '别看了，就是你自己！'
          } else {
            let _this = this
            this.$store.dispatch('searchUsers', {
              accounts: [this.searchId],
              done (users) {
                _this.doPreResult(users)
              }
            })
          }
        }
      } else {
        if (this.existX) this.locationSession()
        else if (this.findXMode === 'team') {
          this.$store.dispatch('delegateTeamFunction', {
            functionName: 'applyTeam',
            options: {
              teamId: this.searchId,
              ps: 'ps',
              done: (error, obj) => {
                if (error) {
                  this.$toast(error)
                  return
                }
                this.$toast('申请成功')
                setTimeout(() => {
                  this.onClose()
                }, 1000)
              }
            }
          })
        } else {
          this.$store.dispatch('addFriend', this.searchId)
          this.$toast('添加成功')
          setTimeout(() => {
            this.onClose()
          }, 1000)
        }
      }
    }
  },
  computed: {
    captionName () {
      return this.findXMode === 'team' ? '查找群组' : '添加好友'
    },
    confirmText () {
      return this.step === 'select' ? '查找' : this.existX ? '打开会话' : (this.findXMode === 'team' ? '申请加入' : '添加好友')
    }
  }
}
</script>

<style>
.g-window .m-findx-res {
  margin: 0 auto;
}
</style>
