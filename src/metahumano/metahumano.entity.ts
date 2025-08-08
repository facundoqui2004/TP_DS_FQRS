import {
  Entity,
  Property,
  OneToMany,
  OneToOne,
  Cascade,
  Collection,
  Rel,
} from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { MetaPoder } from  '../metaPoder/metaPoder.entity.js'
import { Carpeta } from '../carpeta/carpeta.entity.js'
import { Usuario } from '../auth/usuario.entity.js'

@Entity({
  discriminatorColumn: 'tipo_meta',
  discriminatorMap: {
    'metahumano': 'Metahumano',
    'villano': 'Villano',
    'heroe': 'Heroe'
  }
}) //PARA QUE VILLANO HEREDE DE METAHUMANO LOS ATRIBUTOS
export class Metahumano extends BaseEntity {
  @Property({ nullable: false })
  nombre!: string

  @Property({ nullable: false })
  alias!: string

  @Property({ nullable: false })
  origen!: string

  // Relación OneToOne con Usuario (obligatoria y única)
  @OneToOne({ entity: () => Usuario, inversedBy: 'metahumano', owner: true })
  usuario!: Rel<Usuario>

  @OneToMany(()=>Carpeta, carpeta => carpeta.metahumano, {
    cascade: [Cascade.ALL]
  })
  carpetas = new Collection<Carpeta>(this)

  @OneToMany(() => MetaPoder, (metaPoder) => metaPoder.metahumano, {
    cascade: [Cascade.ALL],
  })
  poderes = new Collection<MetaPoder>(this)

  // Métodos para acceder a los campos de contacto desde Usuario
  getEmail(): string {
    return this.usuario?.email || ''
  }

  getTelefono(): string {
    return this.usuario?.telefono || ''
  }

  // Getter para acceder al tipo de metahumano
  get tipoMeta(): string {
    return this.constructor.name.toLowerCase()
  }

  constructor() {
    super()
    // El discriminator se maneja automáticamente por MikroORM
  }
}
