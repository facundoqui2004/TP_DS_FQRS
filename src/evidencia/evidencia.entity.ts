import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import { Multa } from '../Multas/Multa.entity';
import { Carpeta } from '../carpeta/carpeta.entity';
import { BaseEntity } from '../shared/db/baseEntity.entity';

@Entity()
export class Evidencia extends BaseEntity  {

   @Property({ type: 'text' })
    descripcion!: string;

    @OneToMany(()=>Multa, multa => multa.evidencia)
    multas = new Collection<Multa>(this)

    @ManyToOne(()=>Carpeta)
    carpeta!:Rel<Carpeta>
}

