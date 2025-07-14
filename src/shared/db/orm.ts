import { MikroORM } from '@mikro-orm/core'
import { SqlHighlighter } from '@mikro-orm/sql-highlighter'

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  dbName: 'metahumano',
  password: 'dsw',
  user: 'dsw',
  type: 'mysql',
  clientUrl: 'mysql://dsw:dsw@127.0.0.1:3308/metahumano', // 👈 CORREGIDO
  highlighter: new SqlHighlighter(),
  debug: true,
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

