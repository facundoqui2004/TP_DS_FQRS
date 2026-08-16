import { MikroORM } from '@mikro-orm/core'
import { SqlHighlighter } from '@mikro-orm/sql-highlighter'
import { config } from '../../config/environment.js'

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  dbName: config.db.dbName,
  password: config.db.password,
  user: config.db.user,
  type: 'mysql',
  host: config.db.host,
  port: config.db.port,
  clientUrl: `mysql://${config.db.user}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.dbName}`,
  highlighter: new SqlHighlighter(),
  debug: config.isDevelopment(),
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
  },
  schemaGenerator: {
    // nunca en producción
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: [],
  },
})

export const syncSchema = async () => {
  const generator = orm.getSchemaGenerator()
  /*   
  await generator.dropSchema()
  await generator.createSchema()
  */
  await generator.updateSchema()
}

