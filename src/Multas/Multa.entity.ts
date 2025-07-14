import crypto from 'node:crypto'

export class Multa{
    constructor(
      public id = crypto.randomUUID(),
      public motivoMulta:string,
      public lugarDePago:string,
      public fechaEmision:string,
      public estado:string,
      public fechaVencimiento:string
    ){}
}
