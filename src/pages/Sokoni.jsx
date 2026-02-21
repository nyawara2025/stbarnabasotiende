import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveShops, getStoredUser } from '../utils/apiClient';

const Sokoni = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setTimeout(() => {
        setShops([
          {
            id: 1,
            name: 'China Square Electronics',
            category: 'Electronics',
            products_count: 45,
            logo: '📱'
          },
          {
            id: 2,
            name: 'Langata Wines & Spirits',
            category: 'Food & Drinks',
            products_count: 32,
            logo: '🍷'
          },
          {
            id: 3,
            name: 'Maliet Salon',
            category: 'Services',
            products_count: 8,
            logo: '💇'
          },
          {
            id: 4,
            name: 'Kika Wines',
            category: 'Food & Drinks',
            products_count: 28,
            logo: '🍾'
          },
          {
            id: 5,
            name: 'China Square Fashion',
            category: 'Fashion',
            products_count: 56,
            logo: '👗'
          }
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading shops:', error);
      setLoading(false);
    }
  };

  const openSokoni = () => {
    window.open('https://tenearwhatsappcheckins.pages.dev', '_blank');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        color: '#6B7280'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #e5e7eb',
          borderTopColor: '#E31C23',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '12px'
        }} />
        <p>Loading marketplace...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: '#E31C23',
            cursor: 'pointer',
            fontSize: '0.875rem',
            marginBottom: '12px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ← Back
        </button>
        <h1 style={{ 
          margin: 0, 
          fontSize: '1.5rem', 
          fontWeight: 700,
          color: '#1F2937'
        }}>
          🛒 Sokoni Marketplace
        </h1>
        <p style={{ 
          margin: '4px 0 0', 
          color: '#6B7280',
          fontSize: '0.875rem'
        }}>
          Browse shops and products from our marketplace
        </p>
      </div>

      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: 'white',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🛍️</div>
        <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>
          Welcome to Sokoni
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: '0.9rem', opacity: 0.9 }}>
          Browse products from various shops and make inquiries directly
        </p>
        <button
          onClick={openSokoni}
          style={{
            background: 'white',
            color: '#10B981',
            border: 'none',
            borderRadius: '10px',
            padding: '14px 28px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Open Full Marketplace →
        </button>
      </div>

      {/* Categories */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {['Electronics', 'Fashion', 'Food', 'Services', 'Home'].map((cat) => (
          <div
            key={cat}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '16px 8px',
              textAlign: 'center',
              border: '1px solid #e5e7eb',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
              {cat === 'Electronics' && '📱'}
              {cat === 'Fashion' && '👗'}
              {cat === 'Food' && '🍔'}
              {cat === 'Services' && '✂️'}
              {cat === 'Home' && '🏠'}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
              {cat}
            </span>
          </div>
        ))}
      </div>

      {/* Shops Preview */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
            Popular Shops
          </h3>
          <button
            onClick={openSokoni}
            style={{
              background: 'none',
              border: 'none',
              color: '#10B981',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            View All →
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {shops.map((shop) => (
            <div
              key={shop.id}
              onClick={openSokoni}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                {shop.logo}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 600 }}>
                  {shop.name}
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>
                  {shop.category} • {shop.products_count} products
                </p>
              </div>
              <span style={{ color: '#9CA3AF', fontSize: '1.25rem' }}>→</span>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div style={{
        marginTop: '24px',
        padding: '20px',
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600 }}>
          How Sokoni Works
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { step: '1', title: 'Browse Shops', desc: 'Explore products from various shops' },
            { step: '2', title: 'Ask Questions', desc: 'Inquire about products directly' },
            { step: '3', title: 'Get Responses', desc: 'Shop owners reply to your questions' },
          ].map((item) => (
            <div key={item.step} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#10B981',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 600,
                flexShrink: 0
              }}>
                {item.step}
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '0.9rem' }}>
                  {item.title}
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Sokoni;
