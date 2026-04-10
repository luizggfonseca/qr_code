'use client';

import { useState, useEffect } from 'react';
import styles from "./page.module.css";
import { 
  Calendar, 
  Contact, 
  MapPin, 
  Phone, 
  Wifi, 
  FileText, 
  Image as ImageIcon,
  Plus,
  QrCode as QrIcon,
  Trash2,
  MessageCircle,
  Mail,
  Zap,
  Instagram,
  Youtube,
  MessageSquare,
  Search,
  Filter,
  Download,
  Printer,
  Edit2
} from "lucide-react";
import Link from "next/link";
import ModalStyles from "@/components/Modal.module.css";
import FeedbackModal from '@/components/FeedbackModal';
import QRCode from 'qrcode';
import { getDeviceId } from '@/lib/auth-utils';

const categories = [
  { id: 'whatsapp', title: 'WhatsApp', description: 'Abrir conversa com mensagem pré-definida', icon: MessageCircle, color: '#25D366' },
  { id: 'pix', title: 'PIX Pagamento', description: 'Receber via PIX', icon: Zap, color: '#32BCAD' },
  { id: 'vcard', title: 'Cartão de visita', description: 'Cartão de visita profissional', icon: Contact, color: '#3b82f6' },
  { id: 'wifi', title: 'WiFi', description: 'Compartilhar rede e senha', icon: Wifi, color: '#f59e0b' },
  { id: 'event', title: 'Eventos', description: 'Adicionar evento na agenda', icon: Calendar, color: '#ef4444' },
  { id: 'instagram', title: 'Instagram', description: 'Link direto para perfil', icon: Instagram, color: '#E1306C' },
  { id: 'youtube', title: 'YouTube', description: 'Canal ou vídeo específico', icon: Youtube, color: '#FF0000' },
  { id: 'email', title: 'E-mail', description: 'Enviar e-mail pré-preenchido', icon: Mail, color: '#10b981' },
  { id: 'pdf', title: 'Documento PDF', description: 'Hospedar e compartilhar PDFs', icon: FileText, color: '#6366f1' },
  { id: 'photo', title: 'Galeria de imagens', description: 'Hospedar imagens', icon: ImageIcon, color: '#8b5cf6' },
  { id: 'address', title: 'Localização', description: 'GPS ou Endereço físico', icon: MapPin, color: '#64748b' },
  { id: 'phone', title: 'Telefone', description: 'Ligação instantânea', icon: Phone, color: '#4ade80' },
  { id: 'sms', title: 'SMS', description: 'Enviar torpedo rápido', icon: MessageSquare, color: '#fb923c' },
];

export default function Home() {
  const [qrs, setQrs] = useState<any[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState('');

  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // Default: Mais recentes
  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'confirm' | 'info';
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showFeedback = (type: 'success' | 'error' | 'confirm' | 'info', title: string, message: string, onConfirm?: () => void, onCancel?: () => void) => {
    setFeedback({
      isOpen: true,
      type,
      title,
      message,
      onConfirm: onConfirm || (() => setFeedback(f => ({ ...f, isOpen: false }))),
      onCancel: onCancel || (() => setFeedback(f => ({ ...f, isOpen: false }))),
    });
  };

  const fetchQRs = async () => {
    try {
      const res = await fetch('/api/qrcode');
      const data = await res.json();
      setQrs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentDeviceId(getDeviceId());
    fetchQRs();
  }, []);

  const getIcon = (type: string) => {
    const cat = categories.find(c => c.id === type);
    return cat ? <cat.icon size={18} /> : <QrIcon size={18} />;
  };

  const confirmDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/qrcode/${id}`, { 
        method: 'DELETE',
        headers: {
          'x-device-id': getDeviceId()
        }
      });
      if (res.ok) {
        fetchQRs();
        showFeedback('success', 'Excluído', 'O QR Code foi removido com sucesso.');
      } else {
        const result = await res.json();
        showFeedback('error', 'Erro ao Excluir', result.error || 'Não foi possível remover este item.');
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Erro do Sistema', 'Falha na comunicação com o servidor.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const sortedQRs = qrs
    .filter(qr => qr.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'type') return a.type.localeCompare(b.type);
      if (sortBy === 'date') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });

  return (
    <main className="main-container">
      <FeedbackModal 
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onConfirm={feedback.onConfirm}
        onCancel={feedback.onCancel}
        confirmText={feedback.type === 'confirm' ? 'Excluir' : 'OK'}
      />

      <FeedbackModal 
        isOpen={deleteTarget !== null}
        type="confirm"
        title="Excluir QR Code?"
        message="Esta ação não pode ser desfeita. O arquivo associado também será removido definitivamente."
        onConfirm={() => confirmDelete(deleteTarget!)}
        onCancel={() => setDeleteTarget(null)}
        confirmText="Excluir"
      />
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.title}>
            <h1>Gerador PRO</h1>
            <p>Gerencie seus códigos e crie novos conteúdos inteligentes</p>
          </div>
        </header>

        {/* Seção de Criação (No Topo por preferência do usuário) */}
        <section style={{ marginBottom: '5rem' }}>
          <h2 className="outfit" style={{ marginBottom: '2rem' }}>Criar Novo QR Code</h2>
          <div className={styles.grid}>
            {categories.map((cat) => {
              const isPhotoLimit = cat.id === 'photo' && qrs.filter(q => q.type === 'photo' && q.device_id === currentDeviceId).length >= 5;
              
              return (
                <Link 
                  href={isPhotoLimit ? '#' : `/create/${cat.id}`} 
                  key={cat.id} 
                  className={`${styles.card} glass ${isPhotoLimit ? styles.cardDisabled : ''}`} 
                  style={{ 
                    borderLeft: `4px solid ${isPhotoLimit ? '#cbd5e1' : cat.color}`,
                    opacity: isPhotoLimit ? 0.6 : 1,
                    cursor: isPhotoLimit ? 'not-allowed' : 'pointer'
                  }}
                  onClick={(e) => {
                    if (isPhotoLimit) {
                      e.preventDefault();
                      showFeedback('error', 'Limite Atingido', 'Você atingiu o limite de 5 galerias de imagens.');
                    }
                  }}
                >
                  <div className={styles.iconWrapper} style={{ color: isPhotoLimit ? '#94a3b8' : cat.color, background: `${isPhotoLimit ? '#f1f5f9' : cat.color + '15'}` }}>
                    <cat.icon size={24} />
                  </div>
                  <div>
                    <h3 style={{ color: isPhotoLimit ? '#94a3b8' : 'inherit' }}>{cat.title}</h3>
                    <p>{isPhotoLimit ? 'Limite de 5 atingido' : cat.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
          {currentDeviceId && (
            <div style={{ marginTop: '1.5rem', textAlign: 'right', fontSize: '0.85rem', color: '#64748b' }}>
              Uso de armazenamento: <strong>{(qrs.filter(q => q.device_id === currentDeviceId).reduce((acc, curr) => acc + (curr.file_size || 0), 0) / (1024 * 1024)).toFixed(2)} MB</strong> / 50 MB
            </div>
          )}
        </section>

        {/* Seção de Códigos Gerados (Abaixo da criação) */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="outfit">Meus Códigos Gerados</h2>
            <div className={styles.filterGroup}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', marginRight: '0.5rem' }}>Ordenar por:</span>
              <button 
                className={`${styles.filterBtn} ${sortBy === 'name' ? styles.filterBtnActive : ''}`}
                onClick={() => setSortBy('name')}
              >
                Nome
              </button>
              <button 
                className={`${styles.filterBtn} ${sortBy === 'type' ? styles.filterBtnActive : ''}`}
                onClick={() => setSortBy('type')}
              >
                Tipo
              </button>
              <button 
                className={`${styles.filterBtn} ${sortBy === 'date' ? styles.filterBtnActive : ''}`}
                onClick={() => setSortBy('date')}
              >
                Data
              </button>
            </div>
          </div>

          <div className={styles.controls}>
            <div className={styles.searchBar}>
              <Search className={styles.searchIcon} size={18} />
              <input 
                placeholder="Procurar por título..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <p>Carregando registros...</p>
          ) : sortedQRs.length > 0 ? (
            <div className={styles.grid}>
              {sortedQRs.map((qr) => (
                <div key={qr.id} className={`${styles.card} glass`} style={{ padding: '1.5rem', cursor: 'default' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div className={styles.iconWrapper} style={{ width: '32px', height: '32px', color: categories.find(c => c.id === qr.type)?.color || 'var(--primary)' }}>
                      {getIcon(qr.type)}
                    </div>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      {qr.device_id === currentDeviceId && (
                        <>
                          <Link href={`/edit/${qr.id}`} title="Editar" style={{ color: '#94a3b8' }}>
                            <Edit2 size={16} />
                          </Link>
                        </>
                      )}
                      <Link href={`/print/${qr.id}`} title="Imprimir" style={{ color: '#94a3b8' }}>
                        <Printer size={16} />
                      </Link>
                      {qr.device_id === currentDeviceId && (
                        <button onClick={() => setDeleteTarget(qr.id)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{qr.title}</h3>
                  <p className={styles.typeTag}>{qr.type?.toUpperCase()}</p>
                  <p className={styles.date}>Criado em: {new Date(qr.created_at).toLocaleDateString('pt-BR')}</p>
                  {qr.expires_at && (
                    <p className={styles.expiryDate} style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px' }}>
                      Expira em: {new Date(qr.expires_at).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                    <QRCodeComponent 
                      content={(qr.type === 'pdf' || qr.type === 'photo') ? `https://${typeof window !== 'undefined' ? window.location.host : ''}/view/${qr.id}` : qr.content} 
                      color={qr.color}
                      bgcolor={qr.bgcolor}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`${styles.empty} glass`}>
              <p>{searchTerm ? 'Nenhum resultado para sua busca.' : 'Sua lista está vazia. Crie seu primeiro QR Code acima!'}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


function QRCodeComponent({ content, color, bgcolor }: { content: string, color?: string, bgcolor?: string }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!content) return;
    QRCode.toDataURL(content, { 
      width: 200, 
      margin: 1,
      color: {
        dark: color || '#000000',
        light: bgcolor || '#ffffff'
      }
    })
      .then(setUrl)
      .catch(err => console.error('Erro ao gerar QR Code:', err));
  }, [content, color, bgcolor]);

  if (!content) return null;

  return url ? (
    <div style={{ background: bgcolor || 'white', padding: '8px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <img src={url} alt="QR Code" style={{ width: '120px', height: '120px', display: 'block' }} />
    </div>
  ) : <div style={{ width: '120px', height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />;
}
