// src/components/common/ContactActionBtn.tsx
import React from 'react';
import { trackTrafficClick } from '../../services/analytics.service';

interface ContactActionBtnProps {
  type: 'whatsapp' | 'call';
  to: string;
  productId?: string;
  vendorId?: string;
  className?: string;
  children: React.ReactNode;
}

export const ContactActionBtn = ({
  type,
  to,
  productId,
  vendorId,
  className = '',
  children,
}: ContactActionBtnProps) => {
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation click

    try {
      // 1. Await the tracking call so the request successfully sends before redirection
      await trackTrafficClick({
        actionType: type, // 'whatsapp' or 'call'
        productId,
        vendorId,
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }

    // 2. Perform the actual redirection action
    if (type === 'whatsapp') {
      const cleanPhone = to.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    } else {
      window.location.href = `tel:${to}`;
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
};