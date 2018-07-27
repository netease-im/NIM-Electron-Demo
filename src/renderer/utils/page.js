import config from '../configs'

const pageMap = {
  'login': config.loginUrl,
  'regist': config.registUrl,
  'test': config.testUrl
}

var scrollTimer = null

var page = {
  // 切换页面，并错误提示
  turnPage: (message, url) => {
    if (message) {
      alert(message)
    }
    if (url) {
      if (pageMap[url]) {
        url = pageMap[url]
      }
      window.location.href = url
    }
  },
  // 确定导航tab页，是否show nav
  showNav: path => {
    switch (path) {
      case '/':
        return true
      case '/session':
        return true
      case '/contacts':
        return true
      case '/room':
        return true
      case '/general':
        return true
      default:
        return false
    }
  },
  // 滚动列表到底部
  scrollMainList: (listName, itemId) => {
    let dom = document.getElementById(listName)
    if (!dom) return
    let item = document.getElementById(itemId)
    if (!item) return
    let pos = item.offsetTop + item.clientHeight
    dom.scrollTop = pos
  },
  // 滚动聊天列表到底部
  scrollChatListDown: (pos, initCount) => {
    let dom = document.getElementById('chat-list')
    if (!dom) {
      return
    }
    let maxCount = 5
    initCount = initCount || 1
    if (typeof pos !== 'number') {
      pos = Math.max(dom.scrollHeight - dom.clientHeight, 888888)
    }
    dom.scrollTop = pos
    if ((dom.scrollTop < pos) && (initCount < maxCount)) {
      clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        initCount++
        page.scrollChatListDown(pos, initCount)
      }, 200)
    }
  },
  getChatListHeight: () => {
    return document.getElementById('chat-list').scrollHeight
  },
  getChatListScroll: () => {
    return document.getElementById('chat-list').scrollTop
  },
  getChatListClientHeight: () => {
    return document.getElementById('chat-list').clientHeight
  }
}

export default page
