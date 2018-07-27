/*
 * SDK连接相关
 */

import config from '../../configs'
import pageUtil from '../../utils/page'
import util from '../../utils'
import store from '../'
import {onFriends, onSyncFriendAction} from './friends'
import {onRobots} from './robots'
import {onBlacklist, onMarkInBlacklist} from './blacks'
import {onMyInfo, onUserInfo} from './userInfo'
import {onSessions, onUpdateSession} from './session'
import {onRoamingMsgs, onOfflineMsgs, onNewMsg} from './msgs'
import {onSysMsgs, onSysMsg, onSysMsgUnread, onCustomSysMsgs} from './sysMsgs'
import {onTeams, onSynCreateTeam, onCreateTeam, onUpdateTeam, onTeamMembers, onUpdateTeamMember, onAddTeamMembers, onRemoveTeamMembers, onUpdateTeamManagers, onDismissTeam, onUpdateTeamMembersMute, onTeamMsgReceipt} from './team'
const electron = require('electron')
const ipcRenderer = electron.ipcRenderer
const SDK = require('../../nim_sdk/NIM_Web_SDK_v5.2.1')

// 重新初始化 NIM SDK
export function initNimSDK ({ state, commit, dispatch }, loginInfo) {
  if (state.nim) {
    state.nim.disconnect()
  }
  // dispatch('showLoading')
  // 初始化SDK
  window.nim = state.nim = SDK.NIM.getInstance({
    debug: true,
    appKey: config.appkey,
    account: loginInfo.uid,
    token: loginInfo.sdktoken,
    db: false,
    syncSessionUnread: true,
    syncRobots: true,
    autoMarkRead: true, // 默认为true
    onconnect: function onConnect (event) {
      if (loginInfo) {
        // 连接上以后更新uid
        // alert('200')
        commit('updateUserUID', loginInfo)
        if (loginInfo.done instanceof Function) {
          loginInfo.done(200)
        }
        ipcRenderer.send('logined', null)
      }
    },
    onerror: function onError (event) {
      let str = JSON.stringify(event)
      // if (str.indexOf('msg::handleMsg') !== 0) return
      alert(str)
      alert('网络连接状态异常')
      location.href = config.loginUrl
    },
    onwillreconnect: function onWillReconnect () {
      console.log(event)
    },
    ondisconnect: function onDisconnect (error) {
      switch (error.code) {
        // 账号或者密码错误, 请跳转到登录页面并提示错误
        case 302:
          if (loginInfo.done instanceof Function) {
            loginInfo.done('帐号或密码错误')
          } else {
            pageUtil.turnPage('帐号或密码错误', 'login')
          }
          break
        // 被踢, 请提示错误后跳转到登录页面
        case 'kicked':
          let map = {
            PC: '电脑版',
            Web: '网页版',
            Android: '手机版',
            iOS: '手机版',
            WindowsPhone: '手机版'
          }
          let str = error.from
          let errorMsg = `你的帐号于${util.formatDate(new Date())}被${(map[str] || '其他端')}踢出下线，请确定帐号信息安全!`
          pageUtil.turnPage(errorMsg, 'login')
          ipcRenderer.send('kicked', null)
          break
        case 'logout':
          ipcRenderer.send('logout', null)
          break
        default:
          break
      }
    },
    // // 多端登录
    // onloginportschange: onLoginPortsChange,
    // 用户关系及好友关系
    onblacklist: onBlacklist,
    onsyncmarkinblacklist: onMarkInBlacklist,
    // onmutelist: onMutelist,
    // onsyncmarkinmutelist: onMarkInMutelist,
    onfriends: onFriends,
    onsyncfriendaction: onSyncFriendAction,
    // 机器人
    onrobots: onRobots,
    // 用户名片 - actions/userInfo
    onmyinfo: onMyInfo,
    onupdatemyinfo: onMyInfo,
    onusers: onUserInfo,
    onupdateuser: onUserInfo,
    // // 群组
    onteams: onTeams,
    onsynccreateteam: onSynCreateTeam,
    syncTeams: true,
    onteammembers: onTeamMembers,
    onCreateTeam: onCreateTeam,
    onDismissTeam: onDismissTeam,
    onUpdateTeam: onUpdateTeam,
    onAddTeamMembers: onAddTeamMembers,
    onRemoveTeamMembers: onRemoveTeamMembers,
    onUpdateTeamManagers: onUpdateTeamManagers,
    onupdateteammember: onUpdateTeamMember,
    onUpdateTeamMembersMute: onUpdateTeamMembersMute,
    onTeamMsgReceipt: onTeamMsgReceipt,
    // // 会话
    onsessions: onSessions,
    onupdatesession: onUpdateSession,
    // // 消息
    onroamingmsgs: onRoamingMsgs,
    onofflinemsgs: onOfflineMsgs,
    onmsg: onNewMsg,
    // // 系统通知
    onsysmsg: onSysMsg,
    onofflinesysmsgs: onSysMsgs,
    onupdatesysmsg: onSysMsg, // 通过、拒绝好友申请会收到此回调

    onsysmsgunread: onSysMsgUnread,
    onupdatesysmsgunread: onSysMsgUnread,

    onofflinecustomsysmsgs: onCustomSysMsgs,
    oncustomsysmsg: onCustomSysMsgs,
    // // 同步完成
    onsyncdone: function onSyncDone () {
      dispatch('hideLoading')
      // 说明在聊天列表页
      if (store.state.currSessionId) {
        dispatch('setCurrSession', store.state.currSessionId)
      }
    }
  })
}
