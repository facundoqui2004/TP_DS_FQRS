// /src/models/poder.model.ts
import crypto from 'node:crypto';

export class Poder {
    constructor(
        public id_Poder: string = crypto.randomUUID(),
        public nom_poder: string = "",
        public debilidad: string = "",
        public desc_poder: string = "",
        public desc_debilidad: string = "",
        public categoria: string = "",
        public costoMulta: number = 0
    ) {}
}

