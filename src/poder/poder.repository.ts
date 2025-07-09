import { Poder } from "./poder.model.js";

export interface PoderRepository {
  getAll(): Promise<Poder[]>;
  getById(id: string): Promise<Poder | undefined>;
  create(poder: Poder): Promise<void>;
  update(id: string, poder: Partial<Poder>): Promise<Poder | undefined>;
  delete(id: string): Promise<boolean>;
}
