import { MikroORM } from '@mikro-orm/mysql'
import { config } from '../../config/environment.js'

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  dbName: config.db.dbName,
  password: config.db.password,
  user: config.db.user,
  host: config.db.host,
  port: config.db.port,
  debug: config.isDevelopment(),
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
  },
  schemaGenerator: {
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: [],
  },
})

export const syncSchema = async () => {
  const generator = orm.getSchemaGenerator()
  await generator.updateSchema()
}
