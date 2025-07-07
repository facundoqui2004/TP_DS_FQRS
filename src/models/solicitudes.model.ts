import crypto from 'node:crypto';

export class Solicitud {
    constructor(
        public id_solicitud: string = crypto.randomUUID(),
        public id_meta: string = "",
        public id_poder: string = "",
        public fecha_solicitud: Date = new Date(),
        public estado: string = "pendiente",
        public descripcion: string = ""
    ) {}
}

