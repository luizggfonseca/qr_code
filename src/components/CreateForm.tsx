'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { ArrowLeft, Save, Download } from 'lucide-react';
import { generatePixPayload, generateDynamicPixPayload } from '@/lib/pix-utils';


import Link from 'next/link';
import styles from '@/app/create/create.module.css';

interface Props {
  type: string;
  initialData?: any;
}

export default function CreateForm({ type, initialData }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [formData, setFormData] = useState<any>(
    initialData?.form_data ? JSON.parse(initialData.form_data) : {}
  );
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [qrColor, setQrColor] = useState(initialData?.color || '#000000');
  const [qrBgColor, setQrBgColor] = useState(initialData?.bgcolor || '#ffffff');
  
  // Regra: WiFi e PIX permitem "never", os outros expiram por padrão (ex: 1 mês)
  const isInfiniteAllowed = type === 'wifi' || type === 'pix';
  const [expiryOption, setExpiryOption] = useState(initialData?.expires_at ? 'custom' : (isInfiniteAllowed ? 'never' : '1m'));
  
  const [customExpiryDate, setCustomExpiryDate] = useState('');
  const [pixMode, setPixMode] = useState(
    initialData?.form_data ? (JSON.parse(initialData.form_data).pixMode || 'static') : 'static'
  );

  useEffect(() => {
    if (initialData?.expires_at) {
       setExpiryOption('custom');
       setCustomExpiryDate(new Date(initialData.expires_at).toISOString().split('T')[0]);
    }
  }, [initialData]);

  useEffect(() => {
    if (initialData?.form_data) {
      const parsed = JSON.parse(initialData.form_data);
      if (parsed.pixMode) setPixMode(parsed.pixMode);
    }
  }, [initialData]);

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
        if (pixMode === 'dynamic') {
          return generateDynamicPixPayload(formData.url || '');
        }
        return generatePixPayload({
          key: formData.key || '',
          name: formData.name || 'RECEBEDOR',
          city: formData.city || 'CIDADE',
          amount: formData.amount,
          txId: formData.txId
        });


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
        return initialData?.content === 'FILE_URL_PLACEHOLDER' ? 'FILE_URL_PLACEHOLDER' : (initialData?.content || 'FILE_URL_PLACEHOLDER');
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
  }, [formData, type, qrColor, qrBgColor, pixMode]);

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
      
      // Cálculo da data de expiração
      let expiresAt: string | null = null;
      if (expiryOption !== 'never') {
        const now = new Date();
        if (expiryOption === '1d') now.setDate(now.getDate() + 1);
        else if (expiryOption === '1w') now.setDate(now.getDate() + 7);
        else if (expiryOption === '1m') now.setMonth(now.getMonth() + 1);
        else if (expiryOption === 'custom' && customExpiryDate) {
           const custom = new Date(customExpiryDate);
           if (!isNaN(custom.getTime())) {
              expiresAt = custom.toISOString();
           }
        }
        
        if (expiryOption !== 'never' && expiryOption !== 'custom') {
           expiresAt = now.toISOString();
        }
      }
      
      if (expiresAt) {
        data.append('expiresAt', expiresAt);
      }
      
      const fullFormData = { ...formData, pixMode };
      data.append('formDataJson', JSON.stringify(fullFormData));
      
      let content = generateQRCodeContent();
      data.append('content', content);
      
      if (file) {
        data.append('file', file);
      }

      if (initialData?.file_path) {
        data.append('file_path', initialData.file_path);
      }

      const url = initialData?.id ? `/api/qrcode/${initialData.id}` : '/api/qrcode';
      const method = initialData?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
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
              <input name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="Ex: 11988888888" />
            </div>
            <div className={styles.inputGroup}>
              <label>Mensagem Inicial (Opcional)</label>
              <textarea name="message" value={formData.message || ''} onChange={handleInputChange} placeholder="Olá, gostaria de mais informações..." rows={3} />
            </div>
          </>
        );
      case 'email':
        return (
          <>
            <div className={styles.inputGroup}>
              <label>E-mail do Destinatário</label>
              <input name="email" type="email" value={formData.email || ''} onChange={handleInputChange} placeholder="exemplo@email.com" />
            </div>
            <div className={styles.inputGroup}>
              <label>Assunto</label>
              <input name="subject" value={formData.subject || ''} onChange={handleInputChange} placeholder="Assunto do e-mail" />
            </div>
            <div className={styles.inputGroup}>
              <label>Corpo da Mensagem</label>
              <textarea name="body" value={formData.body || ''} onChange={handleInputChange} rows={3} />
            </div>
          </>
        );
      case 'pix':
        return (
          <>
            <div className={styles.inputGroup} style={{ marginBottom: '2rem' }}>
              <label>Modalidade PIX</label>
              <div className={styles.modeToggle}>
                <button 
                  className={`${styles.modeBtn} ${pixMode === 'static' ? styles.modeBtnActive : ''}`}
                  onClick={() => setPixMode('static')}
                >
                  Estático
                </button>
                <button 
                  className={`${styles.modeBtn} ${pixMode === 'dynamic' ? styles.modeBtnActive : ''}`}
                  onClick={() => setPixMode('dynamic')}
                >
                  Dinâmico
                </button>
              </div>
            </div>


            {pixMode === 'static' ? (
              <>
                <div className={styles.inputGroup}>
                  <label>Chave PIX</label>
                  <input name="key" value={formData.key || ''} onChange={handleInputChange} placeholder="E-mail, CPF, CNPJ ou Celular" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Nome do Recebedor</label>
                  <input name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Ex: JOAO DA SILVA" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Cidade do Recebedor</label>
                  <input name="city" value={formData.city || ''} onChange={handleInputChange} placeholder="Ex: SAO PAULO" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={styles.inputGroup}>
                    <label>Valor (Opcional)</label>
                    <input name="amount" type="number" step="0.01" value={formData.amount || ''} onChange={handleInputChange} placeholder="0.00" />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>TXID (Identificador)</label>
                    <input name="txId" value={formData.txId || ''} onChange={handleInputChange} placeholder="Opcional" />
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.inputGroup}>
                <label>URL de Cobrança (Location)</label>
                <input name="url" value={formData.url || ''} onChange={handleInputChange} placeholder="Ex: https://pix.me/..." />
                <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.6 }}>
                  Cole o link retornado pela sua API do banco (Endpoint /cob).
                </p>
              </div>
            )}
          </>
        );


      case 'instagram':
      case 'linkedin':
        return (
          <div className={styles.inputGroup}>
            <label>Nome de Usuário (Username)</label>
            <input name="username" value={formData.username || ''} onChange={handleInputChange} placeholder="Ex: seunome_perfil" />
          </div>
        );
      case 'youtube':
        return (
          <div className={styles.inputGroup}>
            <label>URL do Canal ou Vídeo</label>
            <input name="url" value={formData.url || ''} onChange={handleInputChange} placeholder="https://youtube.com/..." />
          </div>
        );
      case 'sms':
        return (
          <>
            <div className={styles.inputGroup}>
              <label>Número do Telefone</label>
              <input name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="Ex: 11988888888" />
            </div>
            <div className={styles.inputGroup}>
              <label>Mensagem SMS</label>
              <textarea name="message" value={formData.message || ''} onChange={handleInputChange} rows={2} />
            </div>
          </>
        );
      case 'event':
        return (
          <>
            <div className={styles.inputGroup}>
              <label>Nome do Evento</label>
              <input name="summary" value={formData.summary || ''} onChange={handleInputChange} placeholder="Ex: Reunião de Planejamento" />
            </div>
            <div className={styles.inputGroup}>
              <label>Data de Início</label>
              <input name="start" type="date" value={formData.start || ''} onChange={handleInputChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>Localização</label>
              <input name="location" value={formData.location || ''} onChange={handleInputChange} placeholder="Ex: Sala de Reuniões 1" />
            </div>
            <div className={styles.inputGroup}>
              <label>Descrição</label>
              <textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows={3} />
            </div>
          </>
        );
      case 'vcard':
        return (
          <>
            <div className={styles.inputGroup}>
              <label>Nome</label>
              <input name="firstName" value={formData.firstName || ''} onChange={handleInputChange} placeholder="Ex: João" />
            </div>
            <div className={styles.inputGroup}>
              <label>Sobrenome</label>
              <input name="lastName" value={formData.lastName || ''} onChange={handleInputChange} placeholder="Ex: Silva" />
            </div>
            <div className={styles.inputGroup}>
              <label>Telefone</label>
              <input name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="Ex: +55 11 98888-8888" />
            </div>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input name="email" type="email" value={formData.email || ''} onChange={handleInputChange} placeholder="Ex: joao@exemplo.com" />
            </div>
            <div className={styles.inputGroup}>
              <label>Empresa</label>
              <input name="company" value={formData.company || ''} onChange={handleInputChange} placeholder="Ex: Acme Corp" />
            </div>
          </>
        );
      case 'address':
        return (
          <>
            <div className={styles.inputGroup}>
              <label>Endereço Completo</label>
              <textarea name="address" value={formData.address || ''} onChange={handleInputChange} placeholder="Ex: Av. Paulista, 1000, São Paulo - SP" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={styles.inputGroup}>
                <label>Latitude (Opcional)</label>
                <input name="lat" value={formData.lat || ''} onChange={handleInputChange} placeholder="-23.5505" />
              </div>
              <div className={styles.inputGroup}>
                <label>Longitude (Opcional)</label>
                <input name="lon" value={formData.lon || ''} onChange={handleInputChange} placeholder="-46.6333" />
              </div>
            </div>
          </>
        );
      case 'phone':
        return (
          <div className={styles.inputGroup}>
            <label>Número do Telefone</label>
            <input name="number" type="tel" value={formData.number || ''} onChange={handleInputChange} placeholder="Ex: +55 11 98888-8888" />
          </div>
        );
      case 'wifi':
        return (
          <>
            <div className={styles.inputGroup}>
              <label>Nome da Rede (SSID)</label>
              <input name="ssid" value={formData.ssid || ''} onChange={handleInputChange} placeholder="Ex: Minha_Rede" />
            </div>
            <div className={styles.inputGroup}>
              <label>Senha</label>
              <input name="password" type="password" value={formData.password || ''} onChange={handleInputChange} placeholder="Sua senha secreta" />
            </div>
            <div className={styles.inputGroup}>
              <label>Criptografia</label>
              <select name="encryption" value={formData.encryption || 'WPA'} onChange={handleInputChange}>
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
            {initialData?.file_path && (
               <p style={{ marginBottom: '0.5rem', fontSize: '0.8rem', color: '#10b981' }}>
                 Arquivo atual: {initialData.file_path.split('/').pop()} (Opcional re-upload)
               </p>
            )}
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
          <h2>{initialData?.id ? 'Editar' : 'Criar'} QR Code de {getTitleByType()}</h2>
          
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
          
          <h3 className="outfit" style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Validade do QR Code</h3>
          <div className={styles.inputGroup}>
            <label>Tempo de vida (Expiração)</label>
            <select 
              value={expiryOption} 
              onChange={(e) => setExpiryOption(e.target.value)}
              className={styles.select}
            >
              {isInfiniteAllowed && <option value="never">Infinita (Sem expiração)</option>}
              <option value="1d">1 dia (24 Horas)</option>
              <option value="1w">1 semana (7 Dias)</option>
              <option value="1m">1 mês (30 Dias)</option>
              <option value="custom">Data Personalizada</option>
            </select>
          </div>

          {expiryOption === 'custom' && (
            <div className={styles.inputGroup} style={{ marginTop: '-1rem' }}>
              <label>Escolher Data de Validade (Máximo 6 meses)</label>
              <input 
                type="date" 
                value={customExpiryDate} 
                onChange={(e) => setCustomExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                max={new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]}
              />
              <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.4rem' }}>
                * O limite máximo permitido para datas personalizadas é de 6 meses.
              </p>
            </div>
          )}

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
