// /src/models/metahumano.model.ts
import crypto from 'node:crypto';

export class Metahumano {
    constructor(
        public poderes: string[] = [],
        public debilidades: string[] = [],
        public fechaLicencia: Date = new Date(),
        public estadoLicencia: string = "vigente",
        public id: string = crypto.randomUUID(),
        public nombre: string = "",
        public alias: string = "",
        public origen: string = "",
        public telefono: string = "",
        public mail: string = "",
    ) {}
}

/*id_meta
nombre
alias
origen
telefono
mail*/