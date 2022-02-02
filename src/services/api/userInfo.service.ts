import api from './index'

export default {
  async userInfo() {
    return api.get('/userinfo')
  }
}
