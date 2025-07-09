import { Poder } from "../models/poder.model";
import { PoderRepository } from "./poder.repository";

export class InMemoryPoderRepository implements PoderRepository {
  private poderes: Poder[] = [];

  async getAll(): Promise<Poder[]> {
    return [...this.poderes];
  }

  async getById(id: string): Promise<Poder | undefined> {
    return this.poderes.find(p => p.id_Poder === id);
  }

  async create(poder: Poder): Promise<void> {
    this.poderes.push(poder);
  }

  async update(id: string, data: Partial<Poder>): Promise<Poder | undefined> {
    const index = this.poderes.findIndex(p => p.id_Poder === id);
    if (index === -1) return undefined;
    this.poderes[index] = { ...this.poderes[index], ...data, id_Poder: id };
    return this.poderes[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.poderes.findIndex(p => p.id_Poder === id);
    if (index === -1) return false;
    this.poderes.splice(index, 1);
    return true;
  }
}