'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { ArrowLeft, Save, Download } from 'lucide-react';
import Link from 'next/link';
import styles from '@/app/create/create.module.css';

interface Props {
  type: string;
}

export default function CreateForm({ type }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [formData, setFormData] = useState<any>({});
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');

  const getTitleByType = () => {
    const titles: any = {
      event: 'Evento',
      vcard: 'Cartão de Visita',
      address: 'Endereço',
      phone: 'Telefone',
      wifi: 'WiFi',
      pdf: 'Documento PDF',
      photo: 'Foto',
      whatsapp: 'WhatsApp',
      email: 'E-mail',
      pix: 'PIX Pagamento',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      youtube: 'YouTube',
      sms: 'SMS',
    };
    return titles[type] || 'QR Code';
  };

  const generateQRCodeContent = () => {
    switch (type) {
      case 'whatsapp':
        return `https://wa.me/${formData.phone?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(formData.message || '')}`;
      case 'email':
        return `mailto:${formData.email || ''}?subject=${encodeURIComponent(formData.subject || '')}&body=${encodeURIComponent(formData.body || '')}`;
      case 'pix':
        return formData.key || '';
      case 'instagram':
        return `https://instagram.com/${formData.username?.replace('@', '') || ''}`;
      case 'linkedin':
        return `https://linkedin.com/in/${formData.username || ''}`;
      case 'youtube':
        return formData.url || '';
      case 'sms':
        return `sms:${formData.phone || ''}?body=${encodeURIComponent(formData.message || '')}`;
      case 'event':
        return `BEGIN:VEVENT\nSUMMARY:${formData.summary || ''}\nLOCATION:${formData.location || ''}\nDESCRIPTION:${formData.description || ''}\nDTSTART:${formData.start?.replace(/-/g, '') || ''}T000000Z\nEND:VEVENT`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${formData.lastName || ''};${formData.firstName || ''}\nFN:${formData.firstName || ''} ${formData.lastName || ''}\nTEL:${formData.phone || ''}\nEMAIL:${formData.email || ''}\nORG:${formData.company || ''}\nEND:VCARD`;
      case 'address':
        return `geo:${formData.lat || 0},${formData.lon || 0}?q=${encodeURIComponent(formData.address || '')}`;
      case 'phone':
        return `tel:${formData.number || ''}`;
      case 'wifi':
        return `WIFI:T:${formData.encryption || 'WPA'};S:${formData.ssid || ''};P:${formData.password || ''};;`;
      case 'pdf':
      case 'photo':
        return `FILE_URL_PLACEHOLDER`;
      default:
        return '';
    }
  };

  useEffect(() => {
    const content = generateQRCodeContent();
    if (content && content !== 'FILE_URL_PLACEHOLDER' && content.trim() !== '') {
      QRCode.toDataURL(content, { 
        width: 400, 
        margin: 2,
        color: {
          dark: qrColor,
          light: qrBgColor
        }
      })
        .then(url => setQrDataUrl(url))
        .catch(err => {
          console.error('Erro ao gerar preview:', err);
          setQrDataUrl('');
        });
    } else {
      setQrDataUrl('');
    }
  }, [formData, type, qrColor, qrBgColor]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!title) {
      alert('Por favor, dê um título ao seu QR Code');
      return;
    }

    setIsSaving(true);
    try {
      const data = new FormData();
      data.append('type', type);
      data.append('title', title);
      data.append('color', qrColor);
      data.append('bgcolor', qrBgColor);
      
      let content = generateQRCodeContent();
      data.append('content', content);
      
      if (file) {
        data.append('file', file);
      }

      const res = await fetch('/api/qrcode', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (result.success) {
        router.push('/');
      } else {
        alert('Erro ao salvar: ' + result.error);
      }
    } catch (error) {
      console.error(error);
      alert('Erro inesperado ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const renderFormFields = () => {
    switch (type) {
      case 'whatsapp':
        return (
          <>
            <div className={styles.inputGroup}>
              <label>Número do WhatsApp (com DDD)</label>
              <input name="phone" onChange={handleInputChange} placeholder="Ex: 11988888888" />
            </div>
            <div className={styles.inputGroup}>
              <label>Mensagem Inicial (Opcional)</label>
              <textarea name="message" onChange={handleInputChange} placeholder="Olá, gostaria de mais informações..." rows={3} />
            </div>
          </>
        );
      case 'email':
        return (
          <>
            <div className={styles.inputGroup}>
              <label>E-mail do Destinatário</label>
              <input name="email" type="email" onChange={handleInputChange} placeholder="exemplo@email.com" />
            </div>
            <div className={styles.inputGroup}>
              <label>Assunto</label>
              <input name="subject" onChange={handleInputChange} placeholder="Assunto do e-mail" />
            </div>
            <div className={styles.inputGroup}>
              <label>Corpo da Mensagem</label>
              <textarea name="body" onChange={handleInputChange} rows={3} />
            </div>
          </>
        );
      case 'pix':
        return (
          <div className={styles.inputGroup}>
            <label>Chave PIX ou Carteira Cripto</label>
            <input name="key" onChange={handleInputChange} placeholder="Sua chave PIX ou endereço de carteira" />
          </div>
        );
      case 'instagram':
      case 'linkedin':
        return (
          <div className={styles.inputGroup}>
            <label>Nome de Usuário (Username)</label>
            <input name="username" onChange={handleInputChange} placeholder="Ex: seunome_perfil" />
          </div>
        );
      case 'youtube':
        return (
          <div className={styles.inputGroup}>
            <label>URL do Canal ou Vídeo</label>
            <input name="url" onChange={handleInputChange} placeholder="https://youtube.com/..." />
          </div>
        );
      case 'sms':
        return (
          <>
            <div className={styles.inputGroup}>
              <label>Número do Telefone</label>
              <input name="phone" onChange={handleInputChange} placeholder="Ex: 11988888888" />
            </div>
            <div className={styles.inputGroup}>
              <label>Mensagem SMS</label>
              <textarea name="message" onChange={handleInputChange} rows={2} />
            </div>
          </>
        );
      case 'event':
        return (
          <>
            <div className={styles.inputGroup}>
              <label>Nome do Evento</label>
              <input name="summary" onChange={handleInputChange} placeholder="Ex: Reunião de Planejamento" />
            </div>
            <div className={styles.inputGroup}>
              <label>Data de Início</label>
              <input name="start" type="date" onChange={handleInputChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>Localização</label>
              <input name="location" onChange={handleInputChange} placeholder="Ex: Sala de Reuniões 1" />
            </div>
            <div className={styles.inputGroup}>
              <label>Descrição</label>
              <textarea name="description" onChange={handleInputChange} rows={3} />
            </div>
          </>
        );
      case 'vcard':
        return (
          <>
            <div className={styles.inputGroup}>
              <label>Nome</label>
              <input name="firstName" onChange={handleInputChange} placeholder="Ex: João" />
            </div>
            <div className={styles.inputGroup}>
              <label>Sobrenome</label>
              <input name="lastName" onChange={handleInputChange} placeholder="Ex: Silva" />
            </div>
            <div className={styles.inputGroup}>
              <label>Telefone</label>
              <input name="phone" onChange={handleInputChange} placeholder="Ex: +55 11 98888-8888" />
            </div>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input name="email" type="email" onChange={handleInputChange} placeholder="Ex: joao@exemplo.com" />
            </div>
            <div className={styles.inputGroup}>
              <label>Empresa</label>
              <input name="company" onChange={handleInputChange} placeholder="Ex: Acme Corp" />
            </div>
          </>
        );
      case 'address':
        return (
          <>
            <div className={styles.inputGroup}>
              <label>Endereço Completo</label>
              <textarea name="address" onChange={handleInputChange} placeholder="Ex: Av. Paulista, 1000, São Paulo - SP" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={styles.inputGroup}>
                <label>Latitude (Opcional)</label>
                <input name="lat" onChange={handleInputChange} placeholder="-23.5505" />
              </div>
              <div className={styles.inputGroup}>
                <label>Longitude (Opcional)</label>
                <input name="lon" onChange={handleInputChange} placeholder="-46.6333" />
              </div>
            </div>
          </>
        );
      case 'phone':
        return (
          <div className={styles.inputGroup}>
            <label>Número do Telefone</label>
            <input name="number" type="tel" onChange={handleInputChange} placeholder="Ex: +55 11 98888-8888" />
          </div>
        );
      case 'wifi':
        return (
          <>
            <div className={styles.inputGroup}>
              <label>Nome da Rede (SSID)</label>
              <input name="ssid" onChange={handleInputChange} placeholder="Ex: Minha_Rede" />
            </div>
            <div className={styles.inputGroup}>
              <label>Senha</label>
              <input name="password" type="password" onChange={handleInputChange} placeholder="Sua senha secreta" />
            </div>
            <div className={styles.inputGroup}>
              <label>Criptografia</label>
              <select name="encryption" onChange={handleInputChange}>
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Sem Senha</option>
              </select>
            </div>
          </>
        );
      case 'pdf':
      case 'photo':
        return (
          <div className={styles.inputGroup}>
            <label>Upload do Arquivo ({type === 'pdf' ? 'PDF' : 'Imagem'})</label>
            <input 
              type="file" 
              accept={type === 'pdf' ? '.pdf' : 'image/*'} 
              onChange={handleFileChange} 
              style={{ padding: '8px' }}
            />
          </div>
        );
      default:
        return <p>Tipo não suportado</p>;
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>
        <ArrowLeft size={18} />
        Voltar ao Painel
      </Link>

      <div className={styles.layout}>
        <div className={`${styles.formSection} glass`}>
          <h2>Criar QR Code de {getTitleByType()}</h2>
          
          <div className={styles.inputGroup}>
            <label>Título para sua Identificação</label>
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Ex: WiFi da Sala ou vCard do João" 
              required 
            />
          </div>

          <div style={{ margin: '2rem 0', height: '1px', background: 'rgba(255,255,255,0.1)' }} />

          {renderFormFields()}

          <div style={{ margin: '2rem 0', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          
          <h3 className="outfit" style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Personalização PRO</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.inputGroup}>
              <label>Cor do QR Code</label>
              <input type="color" value={qrColor} onChange={(e) => setQrColor(e.target.value)} style={{ height: '40px', padding: '2px' }} />
            </div>
            <div className={styles.inputGroup}>
              <label>Cor do Fundo</label>
              <input type="color" value={qrBgColor} onChange={(e) => setQrBgColor(e.target.value)} style={{ height: '40px', padding: '2px' }} />
            </div>
          </div>

          <button 
            className="button-primary" 
            style={{ width: '100%', marginTop: '2rem' }}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : (
              <>
                <Save size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Salvar QR Code
              </>
            )}
          </button>
        </div>

        <div className={`${styles.previewSection} glass`}>
          <h3 className="outfit" style={{ marginBottom: '1.5rem' }}>Pré-visualização</h3>
          <div className={styles.qrWrapper} style={{ background: qrBgColor }}>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code Preview" style={{ width: '80%', height: 'auto' }} />
            ) : (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', color: '#64748b' }}>
                Preencha os dados
              </div>
            )}
          </div>
          <div className={styles.downloadButtons}>
            <button 
              className={styles.secondaryButton}
              onClick={() => {
                const link = document.createElement('a');
                link.href = qrDataUrl;
                link.download = `qrcode-${type}.png`;
                link.click();
              }}
              disabled={!qrDataUrl}
            >
              <Download size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Baixar PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
