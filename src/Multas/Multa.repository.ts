import { Multa } from "./Multa.entity.js";
import { Repository } from "../shared2/repository.js";
import crypto from 'node:crypto'
const Multas =  [
  new Multa(
    crypto.randomUUID(),
    "robaste",
    "pagador anashi",
    "una fecha",
    "casi en cana",
    "paga ya rata"
  ),
]

export class multaRepository implements Repository<Multa>{
    
   public findAll() : Multa[] | undefined{
      console.log('funciona bien esta mierda')
      return Multas;
    }

    public findOne(item: {id:string}): Multa | undefined {
        return Multas.find((Multa)=>Multa.id === item.id); 
    }
  
    public add(item:Multa):Multa | undefined{
      Multas.push(item);
      return item;
    }
  
    public update(item:Multa): Multa | undefined{
      const MultaIdx = Multas.findIndex((Multa)=>Multa.id === item.id)
      if(MultaIdx !== -1){
        Multas[MultaIdx]={...Multas[MultaIdx],...item}
      }
      return Multas[MultaIdx];
    }
  
    public delete(item: {id:string}): Multa | undefined {
      const MultaIdx = Multas.findIndex((Multa)=>Multa.id === item.id)
      if(MultaIdx!==-1){
        const eliminado = Multas[MultaIdx];
        Multas.splice(MultaIdx,1);
        return eliminado;
      }
    }

}