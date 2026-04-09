'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CreateForm from '@/components/CreateForm';
import styles from '@/app/create/create.module.css';
import { getDeviceId } from '@/lib/auth-utils';

function EditQRContent() {
  const params = useParams();
  const id = params.id;
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const currentDeviceId = getDeviceId();
      fetch(`/api/qrcode/${id}`)
        .then(res => res.json())
        .then(data => {
          // Bloqueia acesso se não for o dono
          if (data.device_id && data.device_id !== 'unknown' && data.device_id !== currentDeviceId) {
            setQrData({ error: 'PERMISSION_DENIED' });
          } else {
            setQrData(data);
          }
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

  if (!qrData || qrData.error === 'PERMISSION_DENIED') {
    return (
      <div className={styles.container}>
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <p className="outfit" style={{ color: '#f43f5e' }}>
            {qrData?.error === 'PERMISSION_DENIED' 
              ? 'Você não tem permissão para editar este QR Code. Apenas a máquina que o criou pode alterá-lo.' 
              : 'QR Code não encontrado.'}
          </p>
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
