import {
  Entity,
  Property,
} from '@mikro-orm/core'
import { Metahumano } from '../metahumano/metahumano.entity.js'

@Entity()
export class Villano extends Metahumano {
  @Property({ nullable: false })
  nivelPeligrosidad!: string

  @Property({ nullable: true })
  motivacion?: string 

  @Property({ nullable: true })
  fechaCaptura?: Date 

  @Property({ nullable: false, default: 'activo' })
  estado!: string // activo, capturado, rehabilitado, fugitivo

  @Property({ nullable: true })
  recompensa?: number 



  constructor() {
    super()
    
  }
}
