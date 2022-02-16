interface ImportMetaEnv {
  readonly VITE_ALERTA_ENDPOINT: string
  readonly VITE_CLIENT_ID: string
  readonly VITE_TRACKING_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
