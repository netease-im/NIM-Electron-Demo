<template>
  <div class="g-hbf-container team-page">
    <div class="g-hbf-header">
      <div style="height:100%;width: 20rem;margin: 0 auto;">
          <img :src="teamInfo && teamInfo.avatar" style="height:4rem;display:inline-block;margin-top:2rem;">
          <div style="margin-left:2rem;display:inline-block;text-align:left;">
            <div style="font-size:1.5rem;overflow: hidden;width: 13rem;white-space:nowrap;text-overflow:ellipsis;">{{teamInfo && teamInfo.name}}</div>
            <div style="overflow: hidden;width: 13rem;white-space:nowrap;text-overflow:ellipsis;">群号: {{teamInfo && teamInfo.teamId}}</div>
           </div>
      </div>    
    </div>
    <div class="g-hbf-body">
      <ul class="u-card" style="overflow-y:auto;height:100%;">
        <li class="u-card-cell" style="width: 25rem;margin: 0 auto;"> 群成员</li>
        <li class="u-card-cell" style="width: 25rem;margin: 0 auto;">
          <team-member :teamId='teamId' :advanced='true' :showAllMode='true' :selectMode='addMember' @openSelect='openSelect'></team-member>
        </li>
      </ul>   
    </div>
    <div class="g-hbf-footer">
      <div class="u-bottom">
        <div style="margin:0 auto;width:20rem;padding-top:1rem">
          <button type="button" class="u-positive-btn btn-chat" @click="enterChat" v-if="isTeamValid">发起会话</button>
          <button type="button" class="u-positive-btn btn-chat" @click="applyTeam" v-else>加入群</button>
          <button type="button" class="u-negative-btn btn-chat" @click="dismissTeam" v-if="isTeamOwner">解散群</button>
          <button type="button" class="u-negative-btn btn-chat" @click="leaveTeam" v-else-if="isTeamValid && !isTeamOwner">退出群</button>    
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TeamMember from './TeamMember.vue'
export default {
  name: 'teamcard',
  components: {
    TeamMember
  },
  mounted () {
    this.checkTeamMemberInfo()
    this.$route.query.firstFlag = false
  },
  updated () {
    if (this.$route.query.firstFlag) {
      this.checkTeamMemberInfo()
      this.$route.query.firstFlag = false
    }
  },
  computed: {
    teamId () {
      return this.$route.query.teamId
    },
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
    teamDesc () {
      if (!this.teamInfo) {
        return ''
      }
      let teamType = this.teamInfo.type === 'advanced' ? '高级群' : '普通群'
      return `${teamType}:${this.teamInfo.memberNum}人`
    },
    teamMemberInfo () {
      var members = this.$store.state.teamMembers[this.teamId]
      var info = members && members.find(item => {
        return item.account === this.$store.state.userUID
      })
      if (!info) return undefined
      return info
    },
    isTeamOwner () {
      let teamMemberInfo = this.teamMemberInfo
      if (teamMemberInfo) return this.teamMemberInfo.type === 'owner'
      return false
    },
    isTeamValid () {
      let teamMemberInfo = this.teamMemberInfo
      if (teamMemberInfo) return teamMemberInfo.valid
      return false
    }
  },
  methods: {
    enterChat () {
      let data = { navTo: 'session' }
      this.eventBus.$emit('updateNavBar', data)
      let sdata = { listType: 'session', activeId: 'team-' + this.teamInfo.teamId }
      this.eventBus.$emit('locationMainListItem', sdata)
      location.href = `#/mainpage/session/chat?sessionId=team-${this.teamInfo.teamId}`
    },
    applyClick () {
      var team = this.$store.state.teamlist.find(team => {
        return team.teamId === this.teamId
      })
      if (team && team.validToCurrentUser) {
        // 查询到该群且该群对自己有效，说明已在群中
        this.$toast('已在群中')
        return
      }
      switch (this.teamInfo.joinMode) {
        case 'rejectAll':
          this.$toast('该群禁止任何人加入')
          break
        case 'noVerify':
          this.applyTeam()
          break
        case 'needVerify':
          this.showConfirm()
          break
      }
    },
    leaveTeam () {
      if (window.confirm('确定退出' + this.teamInfo.name)) {
        this.$store.dispatch('delegateTeamFunction', {
          functionName: 'leaveTeam',
          options: {
            teamId: this.teamId,
            done: (error, obj) => {
              if (error) {
                this.$toast(error)
                return
              }
              this.$toast('已退出群' + this.teamInfo.name)
            }
          }
        })
      }
    },
    dismissTeam () {
      if (window.confirm('确定解散' + this.teamInfo.name)) {
        this.$store.dispatch('delegateTeamFunction', {
          functionName: 'dismissTeam',
          options: {
            teamId: this.teamId,
            done: (error, obj) => {
              if (error) {
                this.$toast(error)
                return
              }
              this.$toast('已解散出群' + this.teamInfo.name)
            }
          }
        })
      }
    },
    showConfirm () {
      this.$vux.confirm.prompt('限十字以内', {
        title: '请输入验证信息',
        closeOnConfirm: false,
        inputAttrs: {
          maxlength: '10'
        },
        onConfirm: (msg) => {
          if (msg) {
            this.applyTeam(msg)
            this.$vux.confirm.hide()
          } else {
            this.$toast('请输入验证信息')
          }
        }
      })
    },
    applyTeam (msg) {
      this.$store.dispatch('delegateTeamFunction', {
        functionName: 'applyTeam',
        options: {
          teamId: this.teamId,
          ps: msg || '',
          done: (error, obj) => {
            if (error) {
              this.$toast(error)
              return
            }
            this.$toast(msg ? '申请成功 等待验证' : '已加入群')
          }
        }
      })
    },
    checkTeamMemberInfo () {
      var teamMembers = this.$store.state.teamMembers[this.teamId]
      if (teamMembers === undefined) {
        this.$store.dispatch('getTeamMembers', this.teamId)
      }
    }
  }
}
</script>

<style>
.team-page .btn-chat {
    margin: 0 1rem 0 0;
    line-height: 2.4rem;
    height: 2rem;
    width: 8rem;
    display: inline-block;
}
</style>
