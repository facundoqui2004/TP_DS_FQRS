import { Entity, ManyToOne, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import { Burocrata } from '../Burocratas/Burocrata.entity';

@Entity()
export class Carpeta {
   @PrimaryKey()
   id_carpeta!: number;

   @ManyToOne(()=>Burocrata)
   burocrata!:Rel<Burocrata>
}