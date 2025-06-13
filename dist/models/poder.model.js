// /src/models/poder.model.ts
import crypto from 'node:crypto';
export class Poder {
    constructor(id_Poder = crypto.randomUUID(), nom_poder = "", debilidad = "", desc_poder = "", desc_debilidad = "", categoria = "", costoMulta = 0) {
        this.id_Poder = id_Poder;
        this.nom_poder = nom_poder;
        this.debilidad = debilidad;
        this.desc_poder = desc_poder;
        this.desc_debilidad = desc_debilidad;
        this.categoria = categoria;
        this.costoMulta = costoMulta;
    }
}
//# sourceMappingURL=poder.model.js.map