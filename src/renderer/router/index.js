import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login-page',
      component: require('@/components/LoginPage').default
    },
    {
      path: '/mainpage',
      name: 'main-page',
      component: require('@/components/MainPage').default,
      children: [
        {
          path: 'session',
          component: require('@/components/page/Session').default,
          name: 'session',
          children: [
            {
              path: 'chat',
              component: require('@/components/chat/Chat').default,
              name: 'chat'
            },
            {
              path: 'sysmsgs',
              component: require('@/components/module/SysMsgs').default,
              name: 'sysmsgs'
            },
            {
              path: 'session-default',
              component: require('@/components/controls/Default').default,
              name: 'session-default'
            }
          ]
        },
        {
          path: '/contacts',
          component: require('@/components/page/Contacts').default,
          name: 'contacts',
          children: [
            {
              path: 'namecard',
              component: require('@/components/module/NameCard').default,
              name: 'namecard'
            },
            {
              path: 'contacts-default',
              component: require('@/components/controls/Default').default,
              name: 'contacts-default'
            }
          ]
        },
        {
          path: '/team',
          component: require('@/components/page/Team').default,
          name: 'team',
          children: [
            {
              path: 'teamcard',
              component: require('@/components/team/TeamCard').default,
              name: 'teamcard'
            },
            {
              path: 'team-default',
              component: require('@/components/controls/Default').default,
              name: 'team-default'
            }
          ]
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
