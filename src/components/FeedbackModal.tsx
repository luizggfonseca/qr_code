'use client';

import React from 'react';
import styles from './Modal.module.css';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'confirm' | 'info';
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancelar'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <div className={`${styles.icon} ${styles.successIcon}`}><CheckCircle2 size={32} /></div>;
      case 'error':
        return <div className={`${styles.icon} ${styles.errorIcon}`}><XCircle size={32} /></div>;
      case 'confirm':
        return <div className={`${styles.icon} ${styles.errorIcon}`}><AlertCircle size={32} /></div>;
      case 'info':
        return <div className={`${styles.icon} ${styles.infoIcon}`}><Info size={32} /></div>;
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onCancel && onCancel()}>
      <div className={styles.modal}>
        {getIcon()}
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        
        <div className={styles.actions}>
          {type === 'confirm' && (
            <button 
              className={`${styles.button} ${styles.secondaryBtn}`}
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          <button 
            className={`${styles.button} ${type === 'confirm' ? styles.dangerBtn : styles.primaryBtn}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
