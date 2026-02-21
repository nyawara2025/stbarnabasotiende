import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ConfigContext } from '../App';
import { getServiceOrder, getUpcomingServices } from '../utils/apiClient';

const ServiceOrder = () => {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const config = useContext(ConfigContext);
  const primaryColor = config?.theme?.colors?.primary || '#7C3AED';
  
  const [serviceOrder, setServiceOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadServiceOrder();
  }, [serviceId]);

  const loadServiceOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch service order from API
      const data = await getServiceOrder(serviceId || 'english');
      
      if (data && (data.sections || data.serviceName)) {
        setServiceOrder(data);
      } else {
        // If no data, show a placeholder message
        setServiceOrder(null);
      }
    } catch (err) {
      console.error('Error loading service order:', err);
      setError('Unable to load service order. Please try again later.');
      setServiceOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = (item, index) => {
    switch (item.type) {
      case 'instruction':
        return (
          <div key={index} style={{
            background: '#FEF3C7',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '12px',
            fontSize: '0.85rem',
            color: '#92400E',
            fontStyle: 'italic'
          }}>
            📌 {item.text}
          </div>
        );

      case 'hymn':
        return (
          <div key={index} style={{
            background: '#EDE9FE',
            padding: '14px',
            borderRadius: '12px',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.25rem' }}>🎵</span>
              <span style={{ fontWeight: 700, color: '#5B21B6' }}>Hymn {item.number}</span>
            </div>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1F2937' }}>{item.title}</p>
            {item.verses && <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#6B7280' }}>Verses: {item.verses}</p>}
          </div>
        );

      case 'versicle':
        return (
          <div key={index} style={{ marginBottom: '12px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.9rem', color: '#1F2937' }}>
              <strong>V:</strong> {item.leader}
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#7C3AED', fontWeight: 600 }}>
              <strong>R:</strong> {item.response}
            </p>
          </div>
        );

      case 'prayer':
      case 'confession':
      case 'absolution':
      case 'canticle':
      case 'creed':
      case 'blessing':
        return (
          <div key={index} style={{
            background: '#F9FAFB',
            padding: '14px',
            borderRadius: '12px',
            marginBottom: '12px',
            borderLeft: `4px solid ${primaryColor}`
          }}>
            {item.title && <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#1F2937' }}>{item.title}</p>}
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
              {item.text}
            </p>
          </div>
        );

      case 'reading':
      case 'gospel':
        return (
          <div key={index} style={{
            background: item.type === 'gospel' ? '#FEE2E2' : '#DBEAFE',
            padding: '14px',
            borderRadius: '12px',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ 
                background: item.type === 'gospel' ? '#DC2626' : '#2563EB', 
                color: 'white', 
                padding: '4px 10px', 
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                {item.label || 'The Gospel'}
              </span>
            </div>
            <p style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#1F2937' }}>{item.reference}</p>
            {item.reader && <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#6B7280' }}>Reader: {item.reader}</p>}
            {item.text && (
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', fontStyle: 'italic', lineHeight: 1.6 }}>
                {item.text}
              </p>
            )}
          </div>
        );

      case 'psalm':
        return (
          <div key={index} style={{
            background: '#D1FAE5',
            padding: '14px',
            borderRadius: '12px',
            marginBottom: '12px'
          }}>
            <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#065F46' }}>📖 {item.reference}</p>
            {item.text && (
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {item.text}
              </p>
            )}
          </div>
        );

      case 'sermon':
        return (
          <div key={index} style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '12px',
            color: 'white'
          }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.8rem', opacity: 0.9 }}>Sermon by {item.preacher}</p>
            <p style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700 }}>"{item.title}"</p>
            {item.duration && <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Duration: ~{item.duration}</p>}
          </div>
        );

      case 'response':
        return (
          <div key={index} style={{
            background: '#F3F4F6',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7280' }}>After each petition:</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#1F2937' }}><strong>V:</strong> {item.cue}</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.95rem', color: primaryColor, fontWeight: 700 }}><strong>R:</strong> {item.response}</p>
          </div>
        );

      case 'sanctus':
        return (
          <div key={index} style={{
            background: '#FDF2F8',
            padding: '14px',
            borderRadius: '12px',
            marginBottom: '12px',
            borderLeft: '4px solid #EC4899',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#1F2937', whiteSpace: 'pre-line', lineHeight: 1.6, fontWeight: 500 }}>
              {item.text}
            </p>
          </div>
        );

      case 'text':
      case 'announcements':
        return (
          <p key={index} style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#6B7280' }}>
            {item.text}
          </p>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e7eb',
          borderTopColor: primaryColor,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // No service order available
  if (!serviceOrder || !serviceOrder.sections) {
    return (
      <div style={{ minHeight: '100vh', background: '#F3F4F6' }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, #5B21B6 100%)`,
          padding: '16px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate(-1)} style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              color: 'white',
              cursor: 'pointer'
            }}>
              ← Back
            </button>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                ⛪ Service Order
              </h1>
            </div>
          </div>
        </div>
        
        <div style={{ 
          padding: '60px 20px', 
          textAlign: 'center',
          color: '#6B7280'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>⛪</div>
          <h2 style={{ margin: '0 0 8px', color: '#1F2937', fontSize: '1.25rem' }}>
            Service Order Not Available
          </h2>
          <p style={{ margin: 0, maxWidth: '300px', marginInline: 'auto' }}>
            {error || 'The service order for this week will be posted soon. Please check back later.'}
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: '24px',
              padding: '12px 24px',
              background: primaryColor,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6' }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, #5B21B6 100%)`,
        padding: '16px',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <button onClick={() => navigate(-1)} style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'white',
            cursor: 'pointer'
          }}>
            ← Back
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
              ⛪ {serviceOrder?.serviceName || serviceOrder?.service_name || 'Service Order'}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', opacity: 0.9 }}>
              {serviceOrder?.date || new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        
        {/* Service Info */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '10px',
          padding: '10px 12px',
          fontSize: '0.8rem'
        }}>
          {serviceOrder?.theme && <p style={{ margin: 0 }}><strong>Theme:</strong> {serviceOrder.theme}</p>}
          {serviceOrder?.presider && <p style={{ margin: '2px 0 0' }}><strong>Presider:</strong> {serviceOrder.presider}</p>}
          {serviceOrder?.preacher && <p style={{ margin: '2px 0 0' }}><strong>Preacher:</strong> {serviceOrder.preacher}</p>}
        </div>
      </div>

      {/* Quick Navigation */}
      {serviceOrder?.sections && serviceOrder.sections.length > 0 && (
        <div style={{
          background: 'white',
          padding: '12px 16px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: '140px',
          zIndex: 99
        }}>
          {serviceOrder.sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                background: activeSection === section.id ? primaryColor : '#F3F4F6',
                color: activeSection === section.id ? 'white' : '#374151',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 14px',
                marginRight: '8px',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {section.title.split(' ')[0]} {section.title.split(' ').slice(1).join(' ').substring(0, 10)}...
            </button>
          ))}
        </div>
      )}

      {/* Service Order Content */}
      <div style={{ padding: '16px', paddingBottom: '100px' }}>
        {serviceOrder?.sections?.map((section) => (
          <div key={section.id} id={section.id} style={{ marginBottom: '24px' }}>
            <h2 style={{
              margin: '0 0 12px',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#1F2937',
              paddingBottom: '8px',
              borderBottom: `2px solid ${primaryColor}`
            }}>
              {section.title}
            </h2>
            {section.items?.map((item, idx) => renderItem(item, idx))}
          </div>
        ))}
      </div>

      {/* Floating Quick Access */}
      <div style={{
        position: 'fixed',
        bottom: '80px',
        right: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            background: primaryColor,
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            fontSize: '1.25rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
};

export default ServiceOrder;
