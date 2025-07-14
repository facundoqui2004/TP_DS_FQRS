import {
  Entity,
  Property,
  ManyToOne,
  Rel,
} from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Metahumano } from '../metahumano/metahumano.entity.js'
import { Poder } from '../poder/poder.entity.js'

@Entity()
export class MetaPoder extends BaseEntity {
  @Property({ nullable: false })
  estado!: string

  @Property({ nullable: false })
  fechaSolicitud!: Date

  @Property({ nullable: false })
  fechaRespuesta!: Date

  @Property({ nullable: true })
  certificado?: string

  @ManyToOne(() => Metahumano)
  metahumano!: Rel<Metahumano>

  @ManyToOne(() => Poder)
  poder!: Rel<Poder>
}
