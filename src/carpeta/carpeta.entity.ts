import { Cascade, Collection, Entity, ManyToOne, OneToMany,  Rel } from '@mikro-orm/core';
import { Metahumano } from '../metahumano/metahumano.entity';
import { Burocrata } from '../Burocratas/Burocrata.entity';
import { Evidencia } from '../evidencia/evidencia.entity';
import { BaseEntity } from '../shared/db/baseEntity.entity';

@Entity()
export class Carpeta extends BaseEntity {
   
   @ManyToOne(()=>Metahumano)
   metahumano!:Rel<Metahumano>
   
   @ManyToOne(()=>Burocrata)
   burocrata!:Rel<Burocrata>

   @OneToMany(()=>Evidencia,evidencia => evidencia.carpeta, {
      cascade: [Cascade.ALL]
   })
   evidencias = new Collection<Evidencia>(this)
}