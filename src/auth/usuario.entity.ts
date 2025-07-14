import {
  Entity,
  Property,
  PrimaryKey,
} from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'

@Entity()
export class Usuario extends BaseEntity {
  @Property({ unique: true, nullable: false })
  nomUsuario!: string

  @Property({ unique: true, nullable: false })
  mail!: string


  @Property({ nullable: false })
  contrasena!: string

  @Property({ nullable: false })
  rol!: string

  @Property({ nullable: true })
  idMeta?: number

  @Property({ nullable: true })
  idBurocrata?: number

  @Property({ default: false })
  verificado: boolean = false
}