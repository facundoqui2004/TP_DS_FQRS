import {
  Entity,
  Property,
  OneToMany,
  Cascade,
  Collection,
} from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { MetaPoder } from  './metaPoder.entity.js'

@Entity()
export class Metahumano extends BaseEntity {
  @Property({ nullable: false })
  nombre!: string

  @Property({ nullable: false })
  alias!: string

  @Property({ nullable: false })
  origen!: string

  @Property({ nullable: false })
  telefono!: string

  @Property({ nullable: false })
  mail!: string

  @OneToMany(() => MetaPoder, (metaPoder) => metaPoder.metahumano, {
    cascade: [Cascade.ALL],
  })
  poderes = new Collection<MetaPoder>(this)
}
