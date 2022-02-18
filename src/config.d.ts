import { IConfig } from '@/store/interfaces'

declare module 'vue/types/vue' {
  interface VueConstructor {
    $config: IConfig
  }
}
