// /src/models/metahumano.model.ts
import crypto from 'node:crypto';
export class Metahumano {
    constructor(poderes = [], debilidades = [], fechaLicencia = new Date(), estadoLicencia = "vigente", id = crypto.randomUUID(), nombre = "", alias = "", origen = "", telefono = "", mail = "") {
        this.poderes = poderes;
        this.debilidades = debilidades;
        this.fechaLicencia = fechaLicencia;
        this.estadoLicencia = estadoLicencia;
        this.id = id;
        this.nombre = nombre;
        this.alias = alias;
        this.origen = origen;
        this.telefono = telefono;
        this.mail = mail;
    }
}
/*id_meta
nombre
alias
origen
telefono
mail*/ 
//# sourceMappingURL=metahumano.model.js.map