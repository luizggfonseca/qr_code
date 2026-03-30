/**
 * Utilitários para geração de Payload PIX (Padrão BCB / EMV QRCPS)
 */

interface PixParams {
  key: string;
  name: string;
  city: string;
  amount?: string;
  txId?: string;
}

function crc16ccitt(data: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < data.length; i++) {
    crc ^= (data.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '');
}

export function generatePixPayload({ key, name, city, amount, txId = '***' }: PixParams): string {
  const normalizedName = normalizeText(name).substring(0, 25);
  const normalizedCity = normalizeText(city).substring(0, 15);
  const normalizedTxId = normalizeText(txId).substring(0, 25) || '***';

  // ID 00: Payload Format Indicator
  let payload = formatField('00', '01');

  // ID 26: Merchant Account Information
  const gui = formatField('00', 'br.gov.bcb.pix');
  const keyField = formatField('01', key);
  payload += formatField('26', gui + keyField);


  // ID 52: Merchant Category Code
  payload += formatField('52', '0000');

  // ID 53: Transaction Currency (986 = BRL)
  payload += formatField('53', '986');

  // ID 54: Transaction Amount
  if (amount && parseFloat(amount) > 0) {
    const formattedAmount = parseFloat(amount).toFixed(2);
    payload += formatField('54', formattedAmount);
  }

  // ID 58: Country Code
  payload += formatField('58', 'BR');

  // ID 59: Merchant Name
  payload += formatField('59', normalizedName);

  // ID 60: Merchant City
  payload += formatField('60', normalizedCity);

  // ID 62: Additional Data Field (TXID)
  const txIdField = formatField('05', normalizedTxId);
  payload += formatField('62', txIdField);

  // ID 63: CRC16
  payload += '6304';
  const crc = crc16ccitt(payload);
  payload += crc;

  return payload;
}

export function generateDynamicPixPayload(url: string): string {
  // O link dinâmico deve seguir o padrão EMV onde o ID 26 contém a URL no subcampo 25
  let payload = formatField('00', '01');
  
  const gui = formatField('00', 'br.gov.bcb.pix');
  const urlField = formatField('25', url.replace(/^https?:\/\//, ''));
  payload += formatField('26', gui + urlField);

  payload += formatField('52', '0000');
  payload += formatField('53', '986');
  payload += formatField('58', 'BR');
  payload += formatField('59', 'DYNAMIC'); // Nome genérico para dinâmico
  payload += formatField('60', 'CITY');    // Cidade genérica
  payload += formatField('62', formatField('05', '***'));
  
  payload += '6304';
  const crc = crc16ccitt(payload);
  payload += crc;

  return payload;
}

