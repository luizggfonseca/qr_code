import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { UPLOADS_DIR } from '@/lib/storage-utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const qr = db.prepare('SELECT * FROM qr_codes WHERE id = ?').get(id);
    if (!qr) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    return NextResponse.json(qr);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deviceId = req.headers.get('x-device-id') || 'unknown';

    // Verificação de Propriedade
    const existing: any = db.prepare('SELECT device_id FROM qr_codes WHERE id = ?').get(id);
    if (existing && existing.device_id && existing.device_id !== 'unknown' && existing.device_id !== deviceId) {
      return NextResponse.json({ error: 'Você não tem permissão para editar este QR Code.' }, { status: 403 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const formDataJson = formData.get('formDataJson') as string;
    const color = (formData.get('color') as string) || '#000000';
    const bgcolor = (formData.get('bgcolor') as string) || '#ffffff';
    const expiresAt = formData.get('expiresAt') as string;
    const file = formData.get('file') as File | null;
    let filePath = formData.get('file_path') as string | null;

    // --- Validação de Limites no Update ---
    const currentQr: any = db.prepare('SELECT file_size FROM qr_codes WHERE id = ?').get(id);
    const oldFileSize = currentQr?.file_size || 0;
    let newFileSize = oldFileSize;

    if (file && file.size > 0 && deviceId !== 'unknown') {
      const usage: any = db.prepare('SELECT SUM(file_size) as total FROM qr_codes WHERE device_id = ?').get(deviceId);
      const totalBytes = (usage.total || 0) - oldFileSize + file.size;
      const MAX_STORAGE_BYTES = 50 * 1024 * 1024;

      if (totalBytes > MAX_STORAGE_BYTES) {
        return NextResponse.json({ error: 'Limite de armazenamento de 50MB atingido.' }, { status: 403 });
      }
      newFileSize = file.size;
    }
    // --------------------------------------

    if (file && file.size > 0) {
      // Delete old file if exists
      const oldQr: any = db.prepare('SELECT file_path FROM qr_codes WHERE id = ?').get(id);
      if (oldQr && oldQr.file_path && oldQr.file_path.startsWith('/api/files/')) {
        try {
          const oldFileName = oldQr.file_path.replace('/api/files/', '');
          await unlink(path.join(UPLOADS_DIR, oldFileName));
        } catch(e) {}
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${file.name}`;
      
      // Garante que a pasta existe (no volume ou local)
      await mkdir(UPLOADS_DIR, { recursive: true });
      
      filePath = `/api/files/${fileName}`;
      await writeFile(path.join(UPLOADS_DIR, fileName), buffer);
    }
    
    db.prepare(`
      UPDATE qr_codes 
      SET title = ?, content = ?, form_data = ?, color = ?, bgcolor = ?, file_path = ?, file_size = ?
      WHERE id = ?
    `).run(title, content, formDataJson, color, bgcolor, filePath, newFileSize, id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deviceId = req.headers.get('x-device-id') || 'unknown';

    // Verificação de Propriedade
    const existing: any = db.prepare('SELECT device_id FROM qr_codes WHERE id = ?').get(id);
    if (existing && existing.device_id && existing.device_id !== 'unknown' && existing.device_id !== deviceId) {
      return NextResponse.json({ error: 'Você não tem permissão para excluir este QR Code.' }, { status: 403 });
    }
    
    
    // Check if there is a file to delete
    const qr: any = db.prepare('SELECT file_path FROM qr_codes WHERE id = ?').get(id);
    
    if (qr && qr.file_path) {
      const absolutePath = path.join(process.cwd(), 'public', qr.file_path);
      try {
        await unlink(absolutePath);
      } catch (err) {
        console.error('File already deleted or not found');
      }
    }

    db.prepare('DELETE FROM qr_codes WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
