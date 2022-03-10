interface ImportMetaEnv {
  readonly VITE_ALERTA_ENDPOINT: string
  readonly PACKAGE_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
