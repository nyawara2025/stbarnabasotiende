import React, { useState, useEffect } from 'react';

const SokoniModal = ({ isOpen, onClose, shops }) => {
  const [selectedShopId, setSelectedShopId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedShopId('');
      setSearchTerm('');
      setSelectedCategory('');
    }
  }, [isOpen]);

  // Generate a unique session ID for tracking inquiries
  const generateSessionId = () => {
    const storedSession = localStorage.getItem('carekenya_session_id');
    if (storedSession) return storedSession;

    const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('carekenya_session_id', newSessionId);
    return newSessionId;
  };

  const handleVisitShop = () => {
    if (!selectedShopId) return;

    const selectedShop = shops.find(shop => shop.id.toString() === selectedShopId.toString());
    if (!selectedShop) return;

    setIsLoading(true);

    // Generate/store session ID for tracking
    const sessionId = generateSessionId();

    // Redirect to the marketplace with shop and session parameters
    const marketplaceUrl = `https://tenearwhatsappcheckins.pages.dev?shop_id=${selectedShop.id}&session_id=${sessionId}`;

    // Open in a new tab
    window.open(marketplaceUrl, '_blank');

    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  // Find the selected shop for display
  const selectedShop = shops.find(shop => shop.id.toString() === selectedShopId.toString());

  // Get unique categories from shops
  const categories = [...new Set(shops.map(shop => shop.category).filter(Boolean))].sort();

  // Filter shops based on category and search term
  const filteredShops = shops.filter(shop => {
    const matchesCategory = !selectedCategory || shop.category === selectedCategory;
    const matchesSearch = !searchTerm || shop.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>
              🏪 Sokoni
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#64748b' }}>
              Select a shop to visit
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {/* Dropdown Content */}
        <div style={{
          padding: '20px'
        }}>
          {isLoading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              color: '#64748b'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #e5e7eb',
                borderTopColor: '#10B981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '16px'
              }} />
              <p>Opening {selectedShop?.name || 'Sokoni'}...</p>
            </div>
          ) : shops && shops.length > 0 ? (
            <>
              {/* Category Dropdown */}
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Select Category:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedShopId(''); // Reset shop selection when category changes
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  color: '#1e293b',
                  cursor: 'pointer',
                  marginBottom: '16px',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2310B981%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px top 50%',
                  backgroundSize: '12px auto',
                  paddingRight: '40px'
                }}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Search Input */}
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Search shops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 40px',
                    fontSize: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    color: '#1e293b',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10B981'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <span style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '1rem'
                }}>
                  🔍
                </span>
              </div>

              {/* Shop Dropdown */}
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Choose a shop ({filteredShops.length} available):
              </label>

              <select
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  color: '#1e293b',
                  cursor: 'pointer',
                  marginBottom: '16px',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2310B981%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px top 50%',
                  backgroundSize: '12px auto',
                  paddingRight: '40px'
                }}
              >
                <option value="">-- Select a shop --</option>
                {filteredShops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>

              {/* Selected Shop Info */}
              {selectedShop && (
                <div style={{
                  padding: '16px',
                  background: '#f0fdf4',
                  borderRadius: '12px',
                  border: '1px solid #bbf7d0',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.25rem',
                      flexShrink: 0
                    }}>
                      🏪
                    </div>
                    <div>
                      <p style={{
                        margin: 0,
                        fontWeight: 600,
                        color: '#1e293b',
                        fontSize: '1rem'
                      }}>
                        {selectedShop.name}
                      </p>
                      {selectedShop.description && (
                        <p style={{
                          margin: '4px 0 0',
                          fontSize: '0.75rem',
                          color: '#64748b'
                        }}>
                          {selectedShop.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Visit Button */}
              <button
                onClick={handleVisitShop}
                disabled={!selectedShopId || isLoading}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: selectedShopId && !isLoading ? 'pointer' : 'not-allowed',
                  background: selectedShopId && !isLoading
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : '#e5e7eb',
                  color: selectedShopId && !isLoading ? 'white' : '#9ca3af',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isLoading ? (
                  <>
                    <span style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Opening...
                  </>
                ) : (
                  <>Visit Shop →</>
                )}
              </button>
            </>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              color: '#64748b',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏪</div>
              <p style={{ margin: 0 }}>No shops available at the moment.</p>
              <p style={{ margin: '8px 0 0', fontSize: '0.875rem' }}>Please check back later.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #e5e7eb',
          background: '#f8fafc'
        }}>
          <p style={{
            margin: 0,
            fontSize: '0.75rem',
            color: '#94a3b8',
            textAlign: 'center'
          }}>
            Swahili for "The Market Place"
          </p>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SokoniModal;
