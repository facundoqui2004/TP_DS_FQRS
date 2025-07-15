
import { Collection, Entity, ManyToOne, Property, Rel } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Evidencia } from '../evidencia/evidencia.entity.js';



@Entity()
export class Multa extends BaseEntity{
  @Property({nullable:false})
  motivoMulta!:string

  @Property({nullable:true})
  montoMulta!:number

  @Property({nullable:false})
  lugarDePago!:string

  @Property({nullable:false})
  fechaEmision!:string

  @Property({nullable:true})
  estado!:string

  @Property({nullable:false})
  fechaVencimiento!:string

  
  @ManyToOne(()=>Evidencia)
  evidencia!:Rel<Evidencia>
}