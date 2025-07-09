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

/*
{
    "nom_poder": "pajaman",
    "debilidad": "cansancio",
    "desc_poder": "Se hace 7 pajas al dia",
    "desc_debilidad": "Se cansa mucho, por lo que no puede hacer mas de 7 pajas al dia",
    "categoria": "Virgen"
    "costoMulta": 69
}*/