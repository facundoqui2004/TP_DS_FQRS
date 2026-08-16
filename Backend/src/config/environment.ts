import dotenv from 'dotenv'
import path from 'path'

// Determinar el ambiente actual (default: 'development')
const nodeEnv = process.env.NODE_ENV || 'development'

// Cargar el archivo .env correspondiente si existe, y el base .env
dotenv.config({ path: path.resolve(process.cwd(), `.env.${nodeEnv}`) })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

export interface DbConfig {
  host: string
  port: number
  dbName: string
  user: string
  password: string
}

export interface AppConfig {
  env: 'development' | 'test' | 'production' | string
  port: number
  frontendUrl: string
  jwtSecret: string
  jwtExpiresIn: string
  db: DbConfig
  mercadopago: {
    accessToken: string
    publicKey: string
  }
  isProduction: () => boolean
  isDevelopment: () => boolean
  isTest: () => boolean
}

export const config: AppConfig = {
  env: nodeEnv,
  port: parseInt(process.env.PORT || '3000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'supergestor_secret_key_jwt_token_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3309', 10),
    dbName: process.env.DB_NAME || 'metahumano',
    user: process.env.DB_USER || 'dsw',
    password: process.env.DB_PASSWORD || 'dsw',
  },
  mercadopago: {
    accessToken: process.env.MP_ACCESS_TOKEN || '',
    publicKey: process.env.MP_PUBLIC_KEY || '',
  },
  isProduction: () => (process.env.NODE_ENV || 'development') === 'production',
  isDevelopment: () => (process.env.NODE_ENV || 'development') === 'development',
  isTest: () => (process.env.NODE_ENV || 'development') === 'test',
}

export default config
