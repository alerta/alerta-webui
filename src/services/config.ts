import { IConfig } from '@/common/interfaces'
import Axios, { AxiosInstance } from 'axios'

class Config {
  private config?: IConfig = undefined
  private envConfig: Partial<IConfig> = {}
  private localConfig: Partial<IConfig> = {}
  private remoteConfig: Partial<IConfig> = {}

  private $http: AxiosInstance

  constructor() {
    this.$http = Axios.create()
  }

  async getConfig() {
    return this.getEnvConfig()
      .then((response) => this.setEnvConfig(response))
      .then(async () => this.getLocalConfig())
      .then((response) => {
        if (!response) return {}
        return this.setLocalConfig(response)
      })
      .then(async () => {
        const endpoint = this.config?.endpoint
          ? this.config?.endpoint
          : 'http://localhost:8080'
        return this.getRemoteConfig(endpoint)
      })
      .then((response) => this.setRemoteConfig(response))
      .catch((error) => {
        console.log(error)
        throw error
      })
  }

  async getEnvConfig() {
    return new Promise<IConfig>((resolve) => {
      const envConfig = {}
      if (import.meta.env.VITE_ALERTA_ENDPOINT) {
        envConfig['endpoint'] = import.meta.env.VITE_ALERTA_ENDPOINT
      }
      if (import.meta.env.VITE_CLIENT_ID) {
        envConfig['client_id'] = import.meta.env.VITE_CLIENT_ID
      }
      if (import.meta.env.VITE_TRACKING_ID) {
        envConfig['tracking_id'] = import.meta.env.VITE_TRACKING_ID
      }
      resolve(envConfig as IConfig)
    })
  }

  async getLocalConfig() {
    const basePath = import.meta.env.BASE_URL
    return this.$http
      .get<IConfig>(`${basePath}config.json`)
      .then((response) => response.data)
      .catch((error) => console.warn(error.message))
  }

  async getRemoteConfig(endpoint: string) {
    return this.$http
      .get<IConfig>(`${endpoint}/config`)
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

  mergeConfig(): IConfig {
    return (this.config = {
      ...this.remoteConfig,
      ...this.localConfig,
      ...this.envConfig
    } as IConfig)
  }

  setEnvConfig(data: IConfig) {
    this.envConfig = data
    return this.mergeConfig()
  }

  setLocalConfig(data: IConfig) {
    this.localConfig = data
    return this.mergeConfig()
  }

  setRemoteConfig(data: IConfig) {
    this.remoteConfig = data
    return this.mergeConfig()
  }

  $get() {
    return this.config
  }
}

export default new Config()
