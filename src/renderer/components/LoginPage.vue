<template>
    <div class="g-window">
        <div class="g-inherit">
            <system-caption :resizable="false"/>
                  <div class="m-login" style="padding-top: 1rem;">
                    <div class="cells">
                      <img class="logo" :src="logo">
                    </div>
                    <div class="cells" style="-webkit-app-region: no-drag;" v-if="mode === 'login'">
                      <div class="cell">
                        <span class="icon icon-account"></span>
                        <input type="text" class="ipt ipt-account" maxlength="20" v-model="account" placeholder="请输入帐号" />
                      </div>
                      <div class="cell">
                        <span class="icon icon-pwd"></span>
                        <input type="password" class="ipt ipt-account" maxlength="20" v-model="password" placeholder="请输入密码" />
                      </div>
                    </div>
                    <div class="cells" style="-webkit-app-region: no-drag;" v-else>
                      <div class="cell">
                        <span class="icon icon-account"></span>
                        <input type="text" class="ipt ipt-account" maxlength="32" v-model="regAccount" placeholder="账号限32位字母或数字" />
                      </div>
                      <div class="cell">
                        <span class="icon icon-account"></span>
                        <input type="text" class="ipt ipt-account" maxlength="32" v-model="regNickname" placeholder="昵称为汉字、字母或数字的组合" />
                      </div>
                      <div class="cell">
                        <span class="icon icon-pwd"></span>
                        <input type="password" class="ipt ipt-account" maxlength="32" v-model="regPassword" placeholder="密码限6-128位字母或数字" />
                      </div>
                    </div>
                    <div class="cells">
                      <div v-show="errorMsg" class="error">{{errorMsg}}</div>
                    </div>
                    <div class="cells" style="-webkit-app-region: no-drag;" v-if="mode === 'login'">
                      <button type="button" class="u-positive-btn btn-login" @click="login">登录</button>
                      <button type="button" class="u-negative-btn btn-login" @click="changeMode('regist')">注册</button>
                    </div>
                    <div class="cells" style="-webkit-app-region: no-drag;" v-else>
                      <button type="button" class="u-positive-btn btn-login" @click="regist">注册</button>
                      <button type="button" class="u-negative-btn btn-login" @click="changeMode('login')">返回</button>
                    </div>
                  </div>
        </div>
    </div>
</template>

<script>
  import SystemCaption from './controls/SystemCaption.vue'
  import md5 from '../utils/md5.js'
  import config from '../configs'
  import LocalStorage from 'localStorage'
  import util from '../utils'
  const electron = require('electron')
  const ipcRenderer = electron.ipcRenderer
  export default {
    name: 'login-page',
    components: {SystemCaption},
    mounted () {
      ipcRenderer.on('onCallbackRegistUser', (evt, arg) => {
        if (this.mode !== 'regist') return
        this.errorMsg = arg.errorMsg
      })
    },
    data () {
      return {
        logo: './static/img/logo.png',
        account: '',
        password: '',
        errorMsg: '',
        mode: 'login',
        regAccount: '',
        regPassword: '',
        regNickname: ''
      }
    },
    methods: {
      changeMode (mode) {
        this.errorMsg = ''
        this.mode = mode
      },
      login () {
        this.errorMsg = ''
        if (this.account === '') {
          this.errorMsg = '帐号不能为空'
          return
        } else if (this.password === '') {
          this.errorMsg = '密码不能为空'
          return
        } else if (this.password.length < 6) {
          this.errorMsg = '密码至少需要6位'
          return
        }
        this.errorMsg = ''
        var sdktoken = md5(this.password)
        LocalStorage.setItem('uid', this.account.toLowerCase())
        LocalStorage.setItem('sdktoken', sdktoken)
        this.errorMsg = '登录中...'
        this.$store.dispatch('connect', {
          force: true,
          done: (error) => {
            if (error !== 200) {
              this.errorMsg = '登录失败(' + error + ')'
              return
            }
            this.errorMsg = '登录成功'
            location.href = config.homeUrl
          }
        })
      },
      regist () {
        if (this.regAccount === '') {
          this.errorMsg = '帐号不能为空'
          return
        } else if (this.regAccount.length > 20) {
          this.errorMsg = '帐号最多限20位'
          return
        } else if (/[^a-zA-Z0-9]/.test(this.regAccount)) {
          this.errorMsg = '帐号限字母或数字'
          return
        } else if (this.regNickname.length > 10) {
          this.errorMsg = '昵称限10位中文、英文或数字'
          return
        } else if (this.regPassword === '') {
          this.errorMsg = '密码不能为空'
          return
        } else if (this.regPassword.length < 6) {
          this.errorMsg = '密码至少需要6位'
          return
        }
        this.errorMsg = ''
        let sdktoken = md5(this.regPassword)
        let accountLowerCase = this.regAccount.toLowerCase()

        ipcRenderer.send('onRegistUser', util.object2query({username: accountLowerCase, password: sdktoken, nickname: this.regNickname}))
        /*
        let xhr = new XMLHttpRequest()
        xhr.open('POST', `${config.postUrl}/api/createDemoUser`, true)
        xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded')
        xhr.setRequestHeader('appkey', config.appkey)
        xhr.send(util.object2query({
          username: accountLowerCase,
          password: sdktoken,
          nickname: this.regNickname
        }))
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              let data = JSON.parse(xhr.responseText)
              if (data.res === 200) {
                this.account = this.regAccount
                this.password = this.regPassword
                this.mode = 'login'
              } else if (data.res === 414) {
                this.errorMsg = data.errmsg
              } else {
                this.errorMsg = data.errmsg
              }
            } else {
              this.errorMsg = '网络断开或其他未知错误(' + xhr.status + ')'
            }
          }
        }
        */
      }
    }
  }
</script>

<style>
/* 登录页面背景皮肤 */
.g-window .m-login {
    margin: 0 auto;
    top: 50%; 
    left: 50%; 
    width: 80%; 
    height:100%
}

.g-window .m-login .cells .icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    background-image: url(http://yx-web.nos.netease.com/webdoc/h5/im/icons.png);
    background-repeat: no-repeat;
    vertical-align: middle;
}

.g-window .m-login .cells .icon-account {
    background-position: 0 -112px;
    position: absolute;
    left: 0.4rem;
    top: 0.6rem;
}

.g-window .m-login .cells .icon-pwd {
    background-position: 0 -133px;
    position: absolute;
    left: 0.4rem;
    top: 0.6rem;
}

.g-window .m-login .cells .btn-login {
    margin: 0.6rem 0;
    line-height: 2.4rem;
    height: 2.4rem;
}

</style>
