import {
  Entity,
  Property,
  OneToMany,
  Collection,
} from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { MetaPoder } from '../metaPoder/metaPoder.entity.js'


@Entity()
export class Poder extends BaseEntity {
  @Property({ nullable: false, unique: true })
  nomPoder!: string

  @Property({ nullable: false })
  debilidad!: string

  @Property({ nullable: false })
  descPoder!: string

  @Property({ nullable: false })
  descDebilidad!: string

  @Property({ nullable: false })
  categoria!: string

  @Property({ nullable: true})
  costoMulta!: number

  @OneToMany(() => MetaPoder, (metaPoder) => metaPoder.poder)
  metahumanos = new Collection<MetaPoder>(this)
}

