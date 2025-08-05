import {
  Entity,
  Property,
} from '@mikro-orm/core'
import { Metahumano } from '../metahumano/metahumano.entity.js'

@Entity()
export class Heroe extends Metahumano {
  @Property({ nullable: false })
  nivelFama!: string // Alto, Medio, Bajo

  @Property({ nullable: true })
  mision?: string // Misión actual del héroe

  @Property({ nullable: true })
  fechaUltimaVictoria?: Date // Fecha de última victoria

  @Property({ nullable: false, default: 'activo' })
  estatus!: string // activo, retirado, desaparecido, fallecido

  @Property({ nullable: true })
  numeroVictorias?: number // Número de victorias

  // TODO: Agregar relaciones para futuros trámites
  // - LicenciaHeroismo
  // - CertificadoValentia

  constructor() {
    super()
    // El discriminator se maneja automáticamente por MikroORM
  }
}