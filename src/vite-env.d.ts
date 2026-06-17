interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_APPCHECK_RECAPTCHAV3PROVIDER: string
  readonly VITE_ENDPOINT_IFRAME: string
  readonly VITE_ENDPOINT_GITHUT_SRC: string
  readonly VITE_ENDPOINT_LINKEDIN: string
  readonly VITE_ENDPOINT_FORMJSON: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}