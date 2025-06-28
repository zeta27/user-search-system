import { usuarios, type Usuario, type InsertUsuario } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUsuarioByCorreo(correo: string): Promise<Usuario | undefined>;
  createUsuario(usuario: InsertUsuario): Promise<Usuario>;
  createMultipleUsuarios(usuarios: InsertUsuario[]): Promise<Usuario[]>;
  getAllUsuarios(): Promise<Usuario[]>;
  clearUsuarios(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUsuarioByCorreo(correo: string): Promise<Usuario | undefined> {
    const [usuario] = await db.select().from(usuarios).where(eq(usuarios.correo, correo.toLowerCase()));
    return usuario || undefined;
  }

  async createUsuario(insertUsuario: InsertUsuario): Promise<Usuario> {
    const [usuario] = await db
      .insert(usuarios)
      .values({
        ...insertUsuario,
        correo: insertUsuario.correo.toLowerCase()
      })
      .returning();
    return usuario;
  }

  async createMultipleUsuarios(insertUsuarios: InsertUsuario[]): Promise<Usuario[]> {
    if (insertUsuarios.length === 0) return [];
    
    const usuariosData = insertUsuarios.map(u => ({
      ...u,
      correo: u.correo.toLowerCase()
    }));

    const createdUsuarios = await db
      .insert(usuarios)
      .values(usuariosData)
      .returning();
    return createdUsuarios;
  }

  async getAllUsuarios(): Promise<Usuario[]> {
    return await db.select().from(usuarios);
  }

  async clearUsuarios(): Promise<void> {
    await db.delete(usuarios);
  }
}

export const storage = new DatabaseStorage();
