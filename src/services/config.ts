import { IConfig } from '@/store/interfaces'
import axios, { AxiosInstance } from 'axios'

class Config {
  private config?: IConfig = undefined
  private envConfig: Partial<IConfig> = {}
  private localConfig: Partial<IConfig> = {}
  private remoteConfig: Partial<IConfig> = {}

  private $http: AxiosInstance

  constructor() {
    this.$http = axios.create()
  }

  async getConfig() {
    return this.getEnvConfig()
      .then((config) => this.setEnvConfig(config))
      .then(() => this.getLocalConfig())
      .then((response) => (response ? this.setLocalConfig(response) : {}))
      .then(async () =>
        this.getRemoteConfig(this.config?.endpoint ?? 'http://localhost:8080')
      )
      .then((config) => this.setRemoteConfig(config))
      .catch((error) => {
        console.log(error)
        throw error
      })
  }

  async getEnvConfig() {
    const envConfig: Partial<IConfig> = {}

    envConfig.endpoint = import.meta.env.VITE_ALERTA_ENDPOINT
    envConfig.client_id = import.meta.env.VITE_CLIENT_ID
    envConfig.tracking_id = import.meta.env.VITE_TRACKING_ID

    return envConfig
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

  mergeConfig() {
    return (this.config = {
      ...this.remoteConfig,
      ...this.localConfig,
      ...this.envConfig
    } as IConfig)
  }

  setEnvConfig(data: Partial<IConfig>) {
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
