import api from './index'

export default {
  userInfo() {
    return api.get('/userinfo')
  }
}
