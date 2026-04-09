import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { UPLOADS_DIR } from '@/lib/storage-utils';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const formDataJson = formData.get('formDataJson') as string;
    const color = (formData.get('color') as string) || '#000000';
    const bgcolor = (formData.get('bgcolor') as string) || '#ffffff';
    const expiresAt = formData.get('expiresAt') as string; // Opcional
    const deviceId = (formData.get('deviceId') as string) || req.headers.get('x-device-id') || 'unknown';
    const file = formData.get('file') as File | null;

    // --- Validação de Limites ---
    if (deviceId !== 'unknown') {
      const MAX_PHOTOS = 5;
      const MAX_STORAGE_MB = 50;
      const MAX_STORAGE_BYTES = MAX_STORAGE_MB * 1024 * 1024;

      // 1. Limite de 5 fotos
      if (type === 'photo') {
        const photoCount: any = db.prepare('SELECT COUNT(*) as count FROM qr_codes WHERE device_id = ? AND type = "photo"').get(deviceId);
        if (photoCount.count >= MAX_PHOTOS) {
          return NextResponse.json({ success: false, error: `Você atingiu o limite de ${MAX_PHOTOS} galeria de imagens.` }, { status: 403 });
        }
      }

      // 2. Limite de 50MB total
      const usage: any = db.prepare('SELECT SUM(file_size) as total FROM qr_codes WHERE device_id = ?').get(deviceId);
      const currentBytes = usage.total || 0;
      const incomingBytes = file ? file.size : 0;
      
      if (currentBytes + incomingBytes > MAX_STORAGE_BYTES) {
        return NextResponse.json({ success: false, error: `Limite de armazenamento de ${MAX_STORAGE_MB}MB atingido.` }, { status: 403 });
      }
    }
    // ---------------------------


    let filePath = null;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const fileName = `${Date.now()}-${file.name}`;
      
      // Garante que a pasta existe (no volume ou local)
      await mkdir(UPLOADS_DIR, { recursive: true });
      
      filePath = `/api/files/${fileName}`;
      const absolutePath = path.join(UPLOADS_DIR, fileName);
      
      await writeFile(absolutePath, buffer);
    }

    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO qr_codes (id, type, title, content, form_data, file_path, color, bgcolor, expires_at, device_id, file_size)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, type, title, content, formDataJson, filePath, color, bgcolor, expiresAt || null, deviceId, file ? file.size : 0);

    return NextResponse.json({ 
      success: true, 
      id,
      filePath 
    });
  } catch (error: any) {
    console.error('Error saving QR code:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Lazy Cleanup: Remove os expirados automaticamente antes de listar
    const now = new Date().toISOString();
    const expiredCodes = db.prepare('SELECT id, file_path FROM qr_codes WHERE expires_at IS NOT NULL AND expires_at < ?').all(now) as any[];
    
    for (const code of expiredCodes) {
       // Se tiver arquivo, apaga do disco
       if (code.file_path && code.file_path.startsWith('/api/files/')) {
          try {
             const fileName = code.file_path.replace('/api/files/', '');
             await unlink(path.join(UPLOADS_DIR, fileName));
          } catch(e) {}
       }
       // Apaga do banco
       db.prepare('DELETE FROM qr_codes WHERE id = ?').run(code.id);
    }

    const qrs = db.prepare('SELECT * FROM qr_codes ORDER BY created_at DESC').all();
    return NextResponse.json(qrs);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
