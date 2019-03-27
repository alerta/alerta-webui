import Axios, { AxiosResponse, AxiosInstance } from 'axios'

class Config {
  private config: any = {}
  private envConfig: any = {}
  private localConfig: any = {}
  private remoteConfig: any = {}

  private $http: AxiosInstance

  constructor() {
    this.$http = Axios.create()
  }

  getConfig(): Promise<any> {
    return this.getEnvConfig()
      .then(response => {
        return this.setEnvConfig(response)
      })
      .then(() => {
        return this.getLocalConfig()
      })
      .then(response => {
        return this.setLocalConfig(response)
      })
      .then(response => {
        let endpoint = this.config.endpoint ? this.config.endpoint : 'http://localhost:8080'
        return this.getRemoteConfig(endpoint)
      })
      .then(response => {
        return this.setRemoteConfig(response)
      })
      .catch((error: any) => {
        console.log(error)
      })
  }

  getEnvConfig() {
    return new Promise((resolve, reject) => {
      let envConfig = {}
      if (process.env.VUE_APP_ALERTA_ENDPOINT) {
        envConfig['endpoint'] = process.env.VUE_APP_ALERTA_ENDPOINT
      }
      if (process.env.VUE_APP_CLIENT_ID) {
        envConfig['client_id'] = process.env.VUE_APP_CLIENT_ID
      }
      if (process.env.VUE_APP_TRACKING_ID) {
        envConfig['tracking_id'] = process.env.VUE_APP_TRACKING_ID
      }
      resolve(envConfig)
    })
  }

  getLocalConfig() {
    return this.$http
      .get('./config.json')
      .then(response => response.data)
      .catch((error: any) => {
        console.warn(error.message)
      })
  }

  getRemoteConfig(endpoint: string) {
    return this.$http
      .get(`${endpoint}/config`)
      .then(response => response.data)
      .catch((error: any) => {
        console.error(error.message)
      })
  }

  mergeConfig() {
    return (this.config = { ...this.remoteConfig, ...this.localConfig, ...this.envConfig })
  }

  setEnvConfig(data: any) {
    this.envConfig = data
    return this.mergeConfig()
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
