import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const formDataJson = formData.get('formDataJson') as string;
    const file = formData.get('file') as File | null;
    const color = (formData.get('color') as string) || '#000000';
    const bgcolor = (formData.get('bgcolor') as string) || '#ffffff';

    let filePath = null;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const fileName = `${Date.now()}-${file.name}`;
      filePath = `/uploads/${fileName}`;
      const absolutePath = path.join(process.cwd(), 'public', 'uploads', fileName);
      
      await writeFile(absolutePath, buffer);
    }

    const stmt = db.prepare(`
      INSERT INTO qr_codes (type, title, content, form_data, file_path, color, bgcolor)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(type, title, content, formDataJson, filePath, color, bgcolor);

    return NextResponse.json({ 
      success: true, 
      id: result.lastInsertRowid,
      filePath 
    });
  } catch (error: any) {
    console.error('Error saving QR code:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const qrs = db.prepare('SELECT * FROM qr_codes ORDER BY created_at DESC').all();
    return NextResponse.json(qrs);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
