import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppReplyButton = ({ phone, message, userName, disabled }) => {
  const formatPhone = (phone) => {
    // Remove any non-digits
    const cleanPhone = phone.replace(/\D/g, '');
    // Add country code if not present (assume Kenya)
    if (cleanPhone.length === 10) {
      return `254${cleanPhone.slice(1)}`;
    }
    return cleanPhone;
  };

  const handleWhatsAppClick = () => {
    if (!phone || !message) return;

    const formattedPhone = formatPhone(phone);
    const encodedMessage = encodeURIComponent(
      `Hi ${userName || 'there'},\n\nRegarding your inquiry:\n"${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"\n\nOur response:\n\n[CARE KENYA SUPPORT]`
    );

    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    // Open in new tab/window
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      disabled={!phone || !message || disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px 20px',
        background: '#25D366',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: (!phone || !message || disabled) ? 'not-allowed' : 'pointer',
        opacity: (!phone || !message || disabled) ? 0.6 : 1,
        transition: 'all 0.2s ease'
      }}
      title={!phone ? 'No phone number available' : 'Send reply via WhatsApp'}
    >
      <MessageCircle size={18} />
      Send via WhatsApp
    </button>
  );
};

export default WhatsAppReplyButton;
