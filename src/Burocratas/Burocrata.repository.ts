import { Repository } from "../shared/repository";
import{Burocrata} from "./Burocrata.entity.js"; 

const Burocratas = [
  new Burocrata(
    undefined,
    "estaEsUnaContraseña",
    "2004-27-08",
    "mi casa"
  ),

]

export class BurocrataRepository implements Repository<Burocrata>{
  public findAll() : Burocrata[] | undefined{
    return Burocratas;
  }

  public findOne(item: {id:string}): Burocrata | undefined{
      return Burocratas.find((Burocrata)=>Burocrata.idUsuario === item.id); 
  }

  public add(item:Burocrata):Burocrata | undefined{
    Burocratas.push(item);
    return item;
  }

  public update(item:Burocrata): Burocrata | undefined{
    const BurocrataIdx = Burocratas.findIndex((Burocrata)=>Burocrata.idUsuario === item.idUsuario)
    if(BurocrataIdx !== -1){
      Burocratas[BurocrataIdx]={...Burocratas[BurocrataIdx],...item}
    }
    return Burocratas[BurocrataIdx];
  }

  public delete(item: {id:string}): Burocrata | undefined {
    const BurocrataIdx = Burocratas.findIndex((Burocrata)=>Burocrata.idUsuario === item.id)
    if(BurocrataIdx!==-1){
      const eliminado = Burocratas[BurocrataIdx];
      Burocratas.splice(BurocrataIdx,1);
      return eliminado;
    }
  }
}