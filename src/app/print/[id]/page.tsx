'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useParams, useRouter } from 'next/navigation';
import { Printer, ArrowLeft } from 'lucide-react';
import styles from './print.module.css';

export default function PrintPage() {
  const params = useParams();
  const router = useRouter();
  const [qr, setQr] = useState<any>(null);
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        const res = await fetch('/api/qrcode');
        const data = await res.json();
        const found = data.find((item: any) => item.id.toString() === id);
        if (found) {
          setQr(found);
          const content = found.file_path ? `${window.location.protocol}//${window.location.host}${found.file_path}` : found.content;
          const url = await QRCode.toDataURL(content, {
            width: 800,
            margin: 2,
            color: {
              dark: found.color || '#000000',
              light: found.bgcolor || '#ffffff'
            }
          });
          setQrUrl(url);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQR();
  }, [params.id]);

  if (loading) return <div className="main-container">Carregando...</div>;
  if (!qr) return <div className="main-container">QR Code não encontrado.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.noPrint}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={18} />
          Voltar
        </button>
        <button onClick={() => window.print()} className="button-primary">
          <Printer size={18} style={{ marginRight: '8px' }} />
          Imprimir Agora
        </button>
      </header>

      <main className={styles.printable}>
        <div className={styles.qrCard}>
          <h1 className={styles.title}>{qr.title}</h1>
          <div className={styles.qrFrame} style={{ background: qr.bgcolor }}>
            <img src={qrUrl} alt="QR Code" />
          </div>
          <p className={styles.footer}>Escaneie para acessar o conteúdo</p>
        </div>
      </main>
    </div>
  );
}
