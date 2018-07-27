const tools = {
  isUrlValid: function (url) {
    if (!url) return false
    if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) return true
    var urlRegExp = "/^((https|http)?://)+[A-Za-z0-9]+.[A-Za-z0-9]+[/=?%-&_~`@[]':+!]*([^<>\"\"])*$/"
    var re = new RegExp(urlRegExp)
    if (re.test(url)) {
      return true
    } else {
      return false
    }
  }
}

export default tools
