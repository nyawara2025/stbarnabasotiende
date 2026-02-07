import React, { useState, useContext } from 'react';
import { MessageCircle } from 'lucide-react';
import { ConfigContext } from '../App';

/**
 * WhatsAppReplyButton - For Shop Admins responding to customer inquiries
 * 
 * Usage:
 * <ShopWhatsAppButton
 *   customerPhone="+254701910180"
 *   customerName="John Doe"
 *   productName="Samsung Galaxy A54"
 *   inquiryText="Is this phone available in black color?"
 *   responseText={replyText}
 *   onSendComplete={() => console.log('Message opened in WhatsApp')}
 * />
 */
const ShopWhatsAppButton = ({ 
  customerPhone, 
  customerName, 
  productName, 
  inquiryText, 
  responseText,
  onSendComplete 
}) => {
  const config = useContext(ConfigContext);
  const [sending, setSending] = useState(false);

  const formatPhone = (phone) => {
    if (!phone) return '';
    // Remove any non-digits
    const cleanPhone = phone.replace(/\D/g, '');
    // Add country code if not present (assume Kenya)
    if (cleanPhone.length === 10) {
      return `254${cleanPhone.slice(1)}`;
    }
    // Already has country code
    if (cleanPhone.length === 12 && cleanPhone.startsWith('254')) {
      return cleanPhone;
    }
    return cleanPhone;
  };

  const handleWhatsAppClick = () => {
    if (!customerPhone || !responseText) return;

    setSending(true);
    
    const formattedPhone = formatPhone(customerPhone);
    const encodedMessage = encodeURIComponent(
      `Hi ${customerName || 'there'},\n\nRegarding your inquiry about "${productName}":\n"${inquiryText.substring(0, 100)}${inquiryText.length > 100 ? '...' : ''}"\n\nOur response:\n${responseText}\n\n[${config?.appName || 'SOKONI SHOP'}]`
    );

    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    // Open in new tab/window
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    setSending(false);
    if (onSendComplete) onSendComplete();
  };

  const isDisabled = !customerPhone || !responseText || sending;

  return (
    <button
      onClick={handleWhatsAppClick}
      disabled={isDisabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        padding: '14px 20px',
        background: '#25D366',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        marginTop: '8px'
      }}
      title={!customerPhone ? 'No customer phone number' : 'Send response via WhatsApp'}
    >
      <MessageCircle size={20} />
      {sending ? 'Opening WhatsApp...' : 'Send via WhatsApp 💬'}
    </button>
  );
};

export default ShopWhatsAppButton;
