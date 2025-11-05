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
  dominio!: string // NOVATO, INTERMEDIO, AVANZADO, EXPERTO, MAESTRO

  @Property({ nullable: true })
  fechaAdquisicion?: Date

  @Property({ nullable: true })
  nivelControl?: number // 1-100

  @Property({ nullable: true })
  estado?: string // ACTIVO, INACTIVO, BLOQUEADO

  @Property({ nullable: true })
  certificado?: string

  @ManyToOne(() => Metahumano)
  metahumano!: Rel<Metahumano>

  @ManyToOne(() => Poder)
  poder!: Rel<Poder>
}
