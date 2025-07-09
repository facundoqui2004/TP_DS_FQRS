import { Poder } from "./poder.model.js";
import { PoderRepository } from "./poder.repository.js";

export class PoderService {
  constructor(private repository: PoderRepository) {}

  async getAll(): Promise<Poder[]> {
    return this.repository.getAll();
  }

  async getById(id: string): Promise<Poder> {
    const poder = await this.repository.getById(id);
    if (!poder) {
      throw new Error("Poder not found");
    }
    return poder;
  }

  async create(data: Partial<Poder>): Promise<Poder> {
    const poder = new Poder(
      undefined,
      data.nom_poder ?? "",
      data.debilidad ?? "",
      data.desc_poder,
      data.desc_debilidad,
      data.categoria,
      data.costoMulta
    );
    await this.repository.create(poder);
    return poder;
  }

  async update(id: string, data: Partial<Poder>): Promise<Poder> {
    const updated = await this.repository.update(id, data);
    if (!updated) {
      throw new Error("Poder not found");
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new Error("Poder not found");
    }
  }
}
