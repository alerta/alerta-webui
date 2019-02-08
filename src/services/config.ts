import Axios, { AxiosResponse, AxiosInstance } from 'axios'

class Config {
  private config: any = {}
  private localConfig: any = {}
  private remoteConfig: any = {}

  private $http: AxiosInstance

  constructor() {
    this.$http = Axios.create()
  }

  getConfig(): Promise<any> {
    return this.getLocalConfig()
      .then(response => {
        return this.setLocalConfig(response)
      })
      .then(response => {
        return this.getRemoteConfig(response.endpoint)
      })
      .then(response => {
        return this.setRemoteConfig(response)
      })
      .catch((error: any) => {
        console.log(error)
      })
  }

  getLocalConfig() {
    return this.$http
      .get('/config.json')
      .then(response => {
        let envConfig = {}
        if (process.env.VUE_APP_ALERTA_ENDPOINT) {
          envConfig['endpoint'] = process.env.VUE_APP_ALERTA_ENDPOINT
        }
        if (process.env.VUE_APP_CLIENT_ID) {
          envConfig['client_id'] = process.env.VUE_APP_CLIENT_ID
        }
        return { ...response.data, ...envConfig }
      })
      .catch((error: any) => {
        console.log(error)
      })
  }

  getRemoteConfig(endpoint: string) {
    return this.$http
      .get(`${endpoint}/config`)
      .then(response => response.data)
      .catch((error: any) => {
        console.log(error)
      })
  }

  mergeConfig() {
    return (this.config = { ...this.remoteConfig, ...this.localConfig })
  }

  setLocalConfig(data: any) {
    this.localConfig = data
    return this.mergeConfig()
  }

  setRemoteConfig(data: any) {
    this.remoteConfig = data
    return this.mergeConfig()
  }

  $get() {
    return this.config
  }
}

export default new Config()
