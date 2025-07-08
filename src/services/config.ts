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
      .then((response) => this.setEnvConfig(response))
      .then(() => this.getLocalConfig())
      .then((response) => this.setLocalConfig(response))
      .then(() => {
        const endpoint = this.config.endpoint || 'http://localhost:8080'
        return this.getRemoteConfig(endpoint)
      })
      .then((response) => this.setRemoteConfig(response))
      .catch((error: any) => {
        throw new Error(`[Config] Failed to load configuration: ${error.message || error}`)
      })
  }

  getEnvConfig(): Promise<any> {
    return new Promise((resolve) => {
      const envConfig: any = {}

      if (process.env.VUE_APP_ALERTA_ENDPOINT) {
        envConfig['endpoint'] = process.env.VUE_APP_ALERTA_ENDPOINT
      }
      if (process.env.VUE_APP_CLIENT_ID) {
        envConfig['client_id'] = process.env.VUE_APP_CLIENT_ID
      }
      if (process.env.VUE_APP_CAS_SERVER) {
        envConfig['cas_server'] = process.env.VUE_APP_CAS_SERVER
      }
      if (process.env.VUE_APP_TRACKING_ID) {
        envConfig['tracking_id'] = process.env.VUE_APP_TRACKING_ID
      }

      resolve(envConfig)
    })
  }

  getLocalConfig(): Promise<any> {
    const basePath = process.env.BASE_URL

    return this.$http
      .get(`${basePath}config.json`)
      .then((response) => response.data)
      .catch(() => {
        // On retourne un objet vide en cas d'échec sans console.warn
        return {}
      })
  }

  getRemoteConfig(endpoint: string): Promise<any> {
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

  mergeConfig(): any {
    return (this.config = {
      ...this.remoteConfig,
      ...this.localConfig,
      ...this.envConfig
    })
  }

  setEnvConfig(data: any): any {
    this.envConfig = data
    return this.mergeConfig()
  }

  setLocalConfig(data: any): any {
    this.localConfig = data
    return this.mergeConfig()
  }

  setRemoteConfig(data: any): any {
    this.remoteConfig = data
    return this.mergeConfig()
  }

  $get(): any {
    return this.config
  }
}

export default new Config()
