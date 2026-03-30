import path from 'path';

// Define o caminho físico dos uploads baseado no ambiente
export const UPLOADS_DIR = process.env.NODE_ENV === 'production' 
  ? '/app/storage/uploads' 
  : path.join(process.cwd(), 'public', 'uploads');

// O prefixo da URL para acessar os uploads
export const UPLOADS_URL_PREFIX = '/api/files';
