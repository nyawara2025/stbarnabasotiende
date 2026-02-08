import React, { useState, useEffect, useContext } from 'react';
import { ConfigContext } from '../App';

const Gallery = () => {
  const config = useContext(ConfigContext);
  const primaryColor = config?.theme?.colors?.primary || '#7C3AED';
  
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const sampleAlbums = [
    {
      id: 1,
      title: 'Sunday Service - Feb 2, 2026',
      date: '2026-02-02',
      category: 'Service',
      coverImage: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=400',
      images: [
        { id: 1, url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800', caption: 'Worship session' },
        { id: 2, url: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800', caption: 'Choir singing' },
        { id: 3, url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800', caption: 'Congregation' },
      ]
    },
    {
      id: 2,
      title: 'Youth Camp 2026',
      date: '2026-01-20',
      category: 'Youth',
      coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',
      images: [
        { id: 1, url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800', caption: 'Team building' },
        { id: 2, url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800', caption: 'Praise session' },
        { id: 3, url: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?w=800', caption: 'Group photo' },
      ]
    },
    {
      id: 3,
      title: 'Christmas Celebration 2025',
      date: '2025-12-25',
      category: 'Event',
      coverImage: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400',
      images: [
        { id: 1, url: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800', caption: 'Christmas decorations' },
        { id: 2, url: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800', caption: 'Children\'s choir' },
      ]
    },
    {
      id: 4,
      title: 'Women Ministry Retreat',
      date: '2025-11-15',
      category: 'Ministry',
      coverImage: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400',
      images: [
        { id: 1, url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800', caption: 'Retreat session' },
        { id: 2, url: 'https://images.unsplash.com/photo-1573497491208-6b1acb260507?w=800', caption: 'Prayer time' },
      ]
    },
    {
      id: 5,
      title: 'Mt. Olive Zone Fellowship',
      date: '2025-11-10',
      category: 'Zone',
      coverImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400',
      images: [
        { id: 1, url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800', caption: 'Zone meeting' },
      ]
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setAlbums(sampleAlbums);
      setLoading(false);
    }, 500);
  }, []);

  const getCategoryColor = (category) => {
    const colors = {
      'Service': '#7C3AED',
      'Youth': '#059669',
      'Event': '#F59E0B',
      'Ministry': '#EC4899',
      'Zone': '#3B82F6'
    };
    return colors[category] || '#6B7280';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
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

  // Image Viewer Modal
  if (selectedImage) {
    return (
      <div 
        onClick={() => setSelectedImage(null)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.95)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        <button
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
        <div style={{ maxWidth: '90%', maxHeight: '80vh' }}>
          <img 
            src={selectedImage.url} 
            alt={selectedImage.caption}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '70vh',
              borderRadius: '8px'
            }}
          />
          {selectedImage.caption && (
            <p style={{ color: 'white', textAlign: 'center', marginTop: '12px', fontSize: '0.9rem' }}>
              {selectedImage.caption}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Album View
  if (selectedAlbum) {
    return (
      <div style={{ padding: '16px', paddingBottom: '100px' }}>
        {/* Back Button */}
        <button
          onClick={() => setSelectedAlbum(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: primaryColor,
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '16px',
            padding: 0
          }}
        >
          ← Back to Albums
        </button>

        {/* Album Header */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 700, color: '#1F2937' }}>
            {selectedAlbum.title}
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7280' }}>
            {new Date(selectedAlbum.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
            {' • '}{selectedAlbum.images.length} photos
          </p>
        </div>

        {/* Image Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '4px'
        }}>
          {selectedAlbum.images.map((image) => (
            <div
              key={image.id}
              onClick={() => setSelectedImage(image)}
              style={{
                aspectRatio: '1',
                cursor: 'pointer',
                overflow: 'hidden',
                borderRadius: '4px'
              }}
            >
              <img
                src={image.url}
                alt={image.caption}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Albums Grid
  return (
    <div style={{ padding: '16px', paddingBottom: '100px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700, color: '#1F2937' }}>
        📸 Photo Gallery
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
      }}>
        {albums.map((album) => (
          <div
            key={album.id}
            onClick={() => setSelectedAlbum(album)}
            style={{
              background: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              cursor: 'pointer'
            }}
          >
            <div style={{
              aspectRatio: '4/3',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <img
                src={album.coverImage}
                alt={album.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <span style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: 600
              }}>
                {album.images.length} 📷
              </span>
            </div>
            <div style={{ padding: '12px' }}>
              <span style={{
                background: `${getCategoryColor(album.category)}15`,
                color: getCategoryColor(album.category),
                padding: '3px 8px',
                borderRadius: '8px',
                fontSize: '0.65rem',
                fontWeight: 600
              }}>
                {album.category}
              </span>
              <h3 style={{ 
                margin: '8px 0 4px', 
                fontSize: '0.85rem', 
                fontWeight: 600, 
                color: '#1F2937',
                lineHeight: 1.3
              }}>
                {album.title}
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#9CA3AF' }}>
                {new Date(album.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
