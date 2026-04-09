import { v4 as uuidv4 } from 'uuid';

/**
 * Obtém ou gera um ID único para o dispositivo atual.
 * Salva no localStorage para persistência entre sessões.
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  
  let deviceId = localStorage.getItem('qr_gen_device_id');
  
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem('qr_gen_device_id', deviceId);
  }
  
  return deviceId;
}
