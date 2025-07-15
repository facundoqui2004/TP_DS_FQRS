import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Evidencia {
   @PrimaryKey()
   cod_Evidencia!: number;

   @Property({ type: 'text' })
    descripcion!: string;

    @OneToMany(()=>Multa, multa = multa.evidencia)
    multas = new Collection<multa>(this)
}

