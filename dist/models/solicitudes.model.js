import crypto from 'node:crypto';
export class Solicitud {
    constructor(id_solicitud = crypto.randomUUID(), id_meta = "", id_poder = "", fecha_solicitud = new Date(), estado = "pendiente", descripcion = "") {
        this.id_solicitud = id_solicitud;
        this.id_meta = id_meta;
        this.id_poder = id_poder;
        this.fecha_solicitud = fecha_solicitud;
        this.estado = estado;
        this.descripcion = descripcion;
    }
}
//# sourceMappingURL=solicitudes.model.js.map