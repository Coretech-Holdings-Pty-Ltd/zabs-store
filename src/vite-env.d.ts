/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MEDUSA_BACKEND_URL: string
  readonly VITE_MEDUSA_ELECTRONICS_KEY: string
  readonly VITE_MEDUSA_HEALTH_KEY: string
  readonly VITE_DEFAULT_REGION: string
  readonly VITE_MINIO_ENDPOINT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
