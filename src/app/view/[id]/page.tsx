'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FileText, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';
import styles from './view.module.css';

export default function ViewPage() {
  const params = useParams();
  const [qr, setQr] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        const res = await fetch('/api/qrcode');
        const data = await res.json();
        const found = data.find((item: any) => item.id.toString() === id);
        setQr(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQR();
  }, [params.id]);

  if (loading) return <div className={styles.loading}>Carregando arquivo...</div>;
  if (!qr || !qr.file_path) return <div className={styles.error}>Arquivo não encontrado ou removido.</div>;

  const isPDF = qr.type === 'pdf';

  return (
    <div className={styles.container}>
      <div className={`${styles.card} glass`}>
        <header className={styles.header}>
          <div className={styles.iconWrapper} style={{ color: isPDF ? '#6366f1' : '#8b5cf6' }}>
            {isPDF ? <FileText size={32} /> : <ImageIcon size={32} />}
          </div>
          <div>
            <h1 className="outfit">{qr.title}</h1>
            <p>Arquivo disponibilizado via QR Code Pro</p>
          </div>
        </header>

        <main className={styles.content}>
          {isPDF ? (
            <div className={styles.pdfFrame}>
              <iframe 
                src={qr.file_path} 
                width="100%" 
                height="600px" 
                title={qr.title}
                className={styles.iframe}
              />
              <div className={styles.mobileOnly}>
                <p>O visualizador de PDF pode não funcionar em todos os dispositivos móveis.</p>
                <a href={qr.file_path} download className="button-primary" style={{ width: '100%', marginTop: '1rem' }}>
                  <Download size={18} style={{ marginRight: '8px' }} />
                  Baixar PDF
                </a>
              </div>
            </div>
          ) : (
            <div className={styles.imageFrame}>
              <img src={qr.file_path} alt={qr.title} className={styles.mainImage} />
            </div>
          )}
        </main>

        <footer className={styles.footer}>
          <a href={qr.file_path} download className="button-primary">
            <Download size={18} style={{ marginRight: '8px' }} />
            Download do Arquivo
          </a>
          {!isPDF && (
            <a href={qr.file_path} target="_blank" rel="noopener noreferrer" className={styles.secondaryBtn}>
              <ExternalLink size={18} style={{ marginRight: '8px' }} />
              Ver em Tamanho Cheio
            </a>
          )}
        </footer>
      </div>
      
      <p className={styles.branding}>Gerado por <strong>QR Code Pro</strong></p>
    </div>
  );
}
