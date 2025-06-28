import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUsuarioSchema } from "@shared/schema";
import multer from "multer";
import { z } from "zod";

const upload = multer({ dest: 'uploads/' });

export async function registerRoutes(app: Express): Promise<Server> {
  // Search usuario by correo
  app.post("/api/search", async (req, res) => {
    try {
      const { correo } = z.object({ correo: z.string().email() }).parse(req.body);
      
      const usuario = await storage.getUsuarioByCorreo(correo);
      
      if (usuario) {
        res.json({ found: true, usuario: usuario.usuario });
      } else {
        res.json({ found: false, message: "No se encontró el usuario para este correo" });
      }
    } catch (error) {
      res.status(400).json({ error: "Correo inválido" });
    }
  });

  // Upload CSV file
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fs = await import('fs');
      const csv = await import('csv-parser');
      const path = await import('path');
      
      const usuarios: any[] = [];
      const filePath = req.file.path;
      
      // Determine file type
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      
      if (fileExtension === '.csv') {
        // Parse CSV
        await new Promise((resolve, reject) => {
          const parser = csv.default ? csv.default() : csv();
          fs.createReadStream(filePath)
            .pipe(parser)
            .on('data', (data: any) => usuarios.push(data))
            .on('end', resolve)
            .on('error', reject);
        });
      } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        // Parse Excel
        const XLSX = await import('xlsx');
        const xlsxModule = XLSX.default || XLSX;
        const workbook = xlsxModule.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsxModule.utils.sheet_to_json(worksheet);
        usuarios.push(...jsonData);
      } else {
        return res.status(400).json({ error: "Unsupported file format" });
      }

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      // Validate and insert usuarios
      const validUsuarios = [];
      for (const userData of usuarios) {
        try {
          // Try different column name variations
          const usuario = userData.Usuario || userData.usuario || userData.USUARIO;
          const correo = userData.Correo || userData.correo || userData.CORREO || userData.email || userData.Email;
          
          if (usuario && correo) {
            const validatedData = insertUsuarioSchema.parse({
              usuario: String(usuario).trim(),
              correo: String(correo).trim().toLowerCase()
            });
            validUsuarios.push(validatedData);
          }
        } catch (error) {
          // Skip invalid rows
          continue;
        }
      }

      if (validUsuarios.length === 0) {
        return res.status(400).json({ error: "No valid data found in file" });
      }

      // Clear existing data and insert new data
      await storage.clearUsuarios();
      await storage.createMultipleUsuarios(validUsuarios);

      res.json({ 
        success: true, 
        message: `${validUsuarios.length} usuarios cargados exitosamente`,
        count: validUsuarios.length
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: "Error processing file" });
    }
  });

  // Get all usuarios for preview
  app.get("/api/usuarios", async (req, res) => {
    try {
      const usuarios = await storage.getAllUsuarios();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: "Error fetching usuarios" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
