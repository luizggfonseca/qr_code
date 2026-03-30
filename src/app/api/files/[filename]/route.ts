import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { UPLOADS_DIR } from '@/lib/storage-utils';

export async function GET(
  req: NextRequest,
  { params }: { params: any }
) {
  const { filename } = await params;
  
  try {
    const filePath = path.join(UPLOADS_DIR, filename);
    const fileContent = await readFile(filePath);
    
    // Detecta o tipo de conteúdo baseado na extensão
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new NextResponse('File not found', { status: 404 });
  }
}
