import {
  Entity,
  Property,
  ManyToOne,
  Rel,
} from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Burocrata } from '../Burocratas/Burocrata.entity.js'

// Valores permitidos para la clasificación de la noticia
export type ClasificacionNoticia =
  | 'ALERTA'
  | 'INFORMATIVA'
  | 'URGENTE'
  | 'OFICIAL'
  | 'GENERAL'

// Valores permitidos para el estado editorial de la noticia
export type EstadoNoticia = 'BORRADOR' | 'PUBLICADA' | 'ARCHIVADA'

@Entity()
export class Noticia extends BaseEntity {

  @Property({ nullable: false })
  titulo!: string

  @Property({ type: 'text', nullable: false })
  descripcion!: string

  // Relación con el burócrata que creó la noticia
  @ManyToOne(() => Burocrata, { nullable: false })
  autor!: Rel<Burocrata>

  // URL o base64 de la imagen asociada a la noticia
  @Property({ columnType: 'longtext', nullable: true })
  imagen?: string

  @Property({ nullable: false })
  fecha!: Date

  // Clasificación temática/urgencia de la noticia
  @Property({ nullable: false, default: 'GENERAL' })
  clasificacion!: ClasificacionNoticia

  // ── Atributos adicionales ────────────────────────────────────────────────

  // Estado editorial: permite flujo borrador → publicada → archivada
  @Property({ nullable: false, default: 'BORRADOR' })
  estado!: EstadoNoticia

  // Fecha de la última modificación (se actualiza en cada PUT/PATCH)
  @Property({ nullable: true, onUpdate: () => new Date() })
  fechaActualizacion?: Date

  // Permite al burócrata marcar una noticia como destacada en el portal
  @Property({ nullable: false, default: false })
  destacada!: boolean
}
