import { Cascade, Collection, Entity, ManyToOne, OneToMany,  Rel } from '@mikro-orm/core';
import { Metahumano } from '../metahumano/metahumano.entity.js';
import { Burocrata } from '../Burocratas/Burocrata.entity.js';
import { Evidencia } from '../evidencia/evidencia.entity.js';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';

@Entity()
export class Carpeta extends BaseEntity {
   
   @ManyToOne(()=>Metahumano,{
      nullable:true
   })
   metahumano!:Rel<Metahumano>
   
   @ManyToOne(()=>Burocrata,{
      nullable : true
   })
   burocrata!:Rel<Burocrata>

   @OneToMany(()=>Evidencia,evidencia => evidencia.carpeta, {
      cascade: [Cascade.ALL],
      nullable : true
   })
   evidencias = new Collection<Evidencia>(this)
}