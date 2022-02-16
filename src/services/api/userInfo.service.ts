import api from '.'

export default {
  async userInfo() {
    return api.get('/userinfo')
  }
}
