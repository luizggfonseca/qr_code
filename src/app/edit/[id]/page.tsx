'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CreateForm from '@/components/CreateForm';
import styles from '@/app/create/[type]/page.module.css';

function EditQRContent() {
  const params = useParams();
  const id = params.id;
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/qrcode/${id}`)
        .then(res => res.json())
        .then(data => {
          setQrData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <p className="outfit">Carregando dados do QR Code...</p>
        </div>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <p className="outfit">QR Code não encontrado.</p>
        </div>
      </div>
    );
  }

  return <CreateForm type={qrData.type} initialData={qrData} />;
}

export default function EditQRPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <EditQRContent />
    </Suspense>
  );
}
