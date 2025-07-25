
import { Carpeta } from "../carpeta/carpeta.entity.js";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Cascade, Collection, Entity, OneToMany, Property,Rel } from "@mikro-orm/core";

@Entity()
export class Burocrata extends BaseEntity{
  @Property({nullable:false})
  nombreBuro!:string

  @Property({nullable:false})
  aliasBuro!:string

  @Property({nullable:false})
  origenBuro!:string

  @Property({nullable:true})
  telefono!:string

  @Property({nullable:false})
  mailBuro!:string
  
  @OneToMany(()=>Carpeta, carpeta => carpeta.burocrata,{
  cascade : [Cascade.ALL]
  })
  carpetas = new Collection<Carpeta>(this)
  
}