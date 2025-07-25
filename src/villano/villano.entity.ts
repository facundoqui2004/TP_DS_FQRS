import {
  Entity,
  Property,
} from '@mikro-orm/core'
import { Metahumano } from '../metahumano/metahumano.entity.js'

@Entity()
export class Villano extends Metahumano {
  @Property({ nullable: false })
  nivelPeligrosidad!: string // Alto, Medio, Bajo

  @Property({ nullable: true })
  motivacion?: string // Motivación del villano

  @Property({ nullable: true })
  fechaCaptura?: Date // Fecha de última captura

  @Property({ nullable: false, default: 'activo' })
  estado!: string // activo, capturado, rehabilitado, fugitivo

  @Property({ nullable: true })
  recompensa?: number // Recompensa por captura

  // TODO: Agregar relaciones para futuros trámites
  // - PermisoDestruccion
  // - CertificadoRehabilitacion

  constructor() {
    super()
    // El discriminator se maneja automáticamente por MikroORM
  }
}
