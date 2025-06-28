import { type Usuario, type InsertUsuario } from "@shared/schema";

export interface IStorage {
  getUsuarioByCorreo(correo: string): Promise<Usuario | undefined>;
  createUsuario(usuario: InsertUsuario): Promise<Usuario>;
  createMultipleUsuarios(usuarios: InsertUsuario[]): Promise<Usuario[]>;
  getAllUsuarios(): Promise<Usuario[]>;
  clearUsuarios(): Promise<void>;
}

export class MemStorage implements IStorage {
  private usuarios: Map<number, Usuario>;
  private correoIndex: Map<string, number>;
  currentId: number;

  constructor() {
    this.usuarios = new Map();
    this.correoIndex = new Map();
    this.currentId = 1;
  }

  async getUsuarioByCorreo(correo: string): Promise<Usuario | undefined> {
    const id = this.correoIndex.get(correo.toLowerCase());
    if (!id) return undefined;
    return this.usuarios.get(id);
  }

  async createUsuario(insertUsuario: InsertUsuario): Promise<Usuario> {
    const id = this.currentId++;
    const usuario: Usuario = { ...insertUsuario, id };
    this.usuarios.set(id, usuario);
    this.correoIndex.set(insertUsuario.correo.toLowerCase(), id);
    return usuario;
  }

  async createMultipleUsuarios(insertUsuarios: InsertUsuario[]): Promise<Usuario[]> {
    const usuarios: Usuario[] = [];
    for (const insertUsuario of insertUsuarios) {
      const usuario = await this.createUsuario(insertUsuario);
      usuarios.push(usuario);
    }
    return usuarios;
  }

  async getAllUsuarios(): Promise<Usuario[]> {
    return Array.from(this.usuarios.values());
  }

  async clearUsuarios(): Promise<void> {
    this.usuarios.clear();
    this.correoIndex.clear();
    this.currentId = 1;
  }
}

export const storage = new MemStorage();
