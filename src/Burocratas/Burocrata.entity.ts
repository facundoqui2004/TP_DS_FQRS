
import { Carpeta } from "../carpeta/carpeta.entity.js";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Usuario } from "../auth/usuario.entity.js";
import { Cascade, Collection, Entity, OneToMany, OneToOne, Property, Rel } from "@mikro-orm/core";

@Entity()
export class Burocrata extends BaseEntity{
  @Property({nullable:false})
  nombre!:string

  @Property({nullable:false})
  alias!:string

  @Property({nullable:false})
  origen!:string

  // Relación OneToOne con Usuario (obligatoria y única)
  @OneToOne({ entity: () => Usuario, inversedBy: 'burocrata', owner: true })
  usuario!: Rel<Usuario>
  
  @OneToMany(()=>Carpeta, carpeta => carpeta.burocrata,{
    cascade : [Cascade.ALL]
  })
  carpetas = new Collection<Carpeta>(this)

  // Métodos para acceder a los campos de contacto desde Usuario
  getEmail(): string {
    return this.usuario?.email || ''
  }

  getTelefono(): string {
    return this.usuario?.telefono || ''
  }
}