import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
