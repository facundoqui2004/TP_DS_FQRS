import { Collection, Entity, ManyToOne, OneToMany, Property, Rel } from '@mikro-orm/core';
import { Multa } from '../Multas/Multa.entity.js';
import { Carpeta } from '../carpeta/carpeta.entity.js';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';

@Entity()
export class Evidencia extends BaseEntity  {

   @Property({ type: 'text' })
    descripcion!: string;

    @OneToMany(()=>Multa, multa => multa.evidencia)
    multas = new Collection<Multa>(this)

    @ManyToOne(()=>Carpeta)
    carpeta!:Rel<Carpeta>
}

