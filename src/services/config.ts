import Axios, { AxiosInstance } from 'axios'

class Config {
  private config: any = {}
  private envConfig: any = {}
  private localConfig: any = {}
  private remoteConfig: any = {}

  private $http: AxiosInstance

  constructor() {
    this.$http = Axios.create()
  }

  async getConfig(): Promise<any> {
    return this.getEnvConfig()
      .then((response) => {
        return this.setEnvConfig(response)
      })
      .then(async () => {
        return this.getLocalConfig()
      })
      .then((response) => {
        return this.setLocalConfig(response)
      })
      .then(async () => {
        const endpoint = this.config.endpoint
          ? this.config.endpoint
          : 'http://localhost:8080'
        return this.getRemoteConfig(endpoint)
      })
      .then((response) => {
        return this.setRemoteConfig(response)
      })
      .catch((error) => {
        console.log(error)
        throw error
      })
  }

  async getEnvConfig() {
    return new Promise((resolve, reject) => {
      const envConfig = {}
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

  async getLocalConfig() {
    const basePath = process.env.BASE_URL
    return this.$http
      .get(`${basePath}config.json`)
      .then((response) => response.data)
      .catch((error) => {
        console.warn(error.message)
      })
  }

  async getRemoteConfig(endpoint: string) {
    return this.$http
      .get(`${endpoint}/config`)
      .then((response) => response.data)
      .catch((error) => {
        alert(
          `ERROR: Failed to retrieve client config from Alerta API endpoint ${endpoint}/config.\n\n` +
            'This could be due to the API not being available, or to a missing or invalid ' +
            'config.json file. Please confirm a config.json file exists, contains an "endpoint" ' +
            'setting and is in the same directory as the application index.html file.'
        )
        throw error
      })
  }

  mergeConfig() {
    return (this.config = {
      ...this.remoteConfig,
      ...this.localConfig,
      ...this.envConfig
    })
  }

  setEnvConfig(data) {
    this.envConfig = data
    return this.mergeConfig()
  }

  setLocalConfig(data) {
    this.localConfig = data
    return this.mergeConfig()
  }

  setRemoteConfig(data) {
    this.remoteConfig = data
    return this.mergeConfig()
  }

  $get() {
    return this.config
  }
}

export default new Config()
