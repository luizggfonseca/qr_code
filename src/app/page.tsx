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
  Linkedin,
  Youtube,
  MessageSquare,
  Search,
  Filter,
  Download,
  Printer
} from "lucide-react";
import Link from "next/link";
import ModalStyles from "@/components/Modal.module.css";
import QRCode from 'qrcode';

const categories = [
  { id: 'whatsapp', title: 'WhatsApp', description: 'Abrir conversa com mensagem', icon: MessageCircle, color: '#25D366' },
  { id: 'pix', title: 'PIX Pagamento', description: 'Receber via PIX ou Cripto', icon: Zap, color: '#32BCAD' },
  { id: 'vcard', title: 'vCard Pro', description: 'Cartão de visita profissional', icon: Contact, color: '#3b82f6' },
  { id: 'wifi', title: 'Conexão WiFi', description: 'Compartilhar rede e senha', icon: Wifi, color: '#f59e0b' },
  { id: 'event', title: 'Evento Agenda', description: 'Adicionar na agenda iOS/Google', icon: Calendar, color: '#ef4444' },
  { id: 'instagram', title: 'Instagram', description: 'Link direto para perfil', icon: Instagram, color: '#E1306C' },
  { id: 'linkedin', title: 'LinkedIn', description: 'Conectar profissionalmente', icon: Linkedin, color: '#0077B5' },
  { id: 'youtube', title: 'YouTube', description: 'Canal ou vídeo específico', icon: Youtube, color: '#FF0000' },
  { id: 'email', title: 'E-mail', description: 'Enviar e-mail pré-preenchido', icon: Mail, color: '#10b981' },
  { id: 'pdf', title: 'Documento PDF', description: 'Hospedar e compartilhar PDFs', icon: FileText, color: '#6366f1' },
  { id: 'photo', title: 'Galeria Foto', description: 'Hospedar imagens ou fotos', icon: ImageIcon, color: '#8b5cf6' },
  { id: 'address', title: 'Localização', description: 'GPS ou Endereço físico', icon: MapPin, color: '#64748b' },
  { id: 'phone', title: 'Telefone', description: 'Ligação instantânea', icon: Phone, color: '#4ade80' },
  { id: 'sms', title: 'SMS', description: 'Enviar torpedo rápido', icon: MessageSquare, color: '#fb923c' },
];

export default function Home() {
  const [qrs, setQrs] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // Default: Mais recentes

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
    fetchQRs();
  }, []);

  const getIcon = (type: string) => {
    const cat = categories.find(c => c.id === type);
    return cat ? <cat.icon size={18} /> : <QrIcon size={18} />;
  };

  const confirmDelete = async () => {
    if (!showDeleteModal) return;
    try {
      const res = await fetch(`/api/qrcode/${showDeleteModal}`, { method: 'DELETE' });
      if (res.ok) {
        fetchQRs();
      } else {
        const result = await res.json();
        alert('Erro ao excluir: ' + result.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setShowDeleteModal(null);
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
      {showDeleteModal && (
        <div className={ModalStyles.overlay}>
          <div className={`${ModalStyles.modal} glass`}>
            <div className={ModalStyles.icon}>
              <Trash2 size={32} />
            </div>
            <h2 className={ModalStyles.title}>Excluir QR Code?</h2>
            <p className={ModalStyles.text}>Esta ação não pode ser desfeita. O arquivo associado também será removido definitivamente.</p>
            <div className={ModalStyles.actions}>
              <button 
                className={ModalStyles.cancelBtn} 
                onClick={() => setShowDeleteModal(null)}
              >
                Cancelar
              </button>
              <button 
                className={ModalStyles.deleteBtn} 
                onClick={confirmDelete}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
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
            {categories.map((cat) => (
              <Link href={`/create/${cat.id}`} key={cat.id} className={`${styles.card} glass`} style={{ borderLeft: `4px solid ${cat.color}` }}>
                <div className={styles.iconWrapper} style={{ color: cat.color, background: `${cat.color}15` }}>
                  <cat.icon size={24} />
                </div>
                <div>
                  <h3>{cat.title}</h3>
                  <p>{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/print/${qr.id}`} title="Imprimir" style={{ color: '#94a3b8' }}>
                        <Printer size={16} />
                      </Link>
                      <button onClick={() => setShowDeleteModal(qr.id)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{qr.title}</h3>
                  <p style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '1.5rem' }}>{new Date(qr.created_at).toLocaleDateString('pt-BR')}</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <QRCodeComponent 
                      content={(qr.type === 'pdf' || qr.type === 'photo') ? `${window.location.protocol}//${window.location.host}/view/${qr.id}` : qr.content} 
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
