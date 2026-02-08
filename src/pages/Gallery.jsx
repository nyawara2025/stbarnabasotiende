import React, { useState, useEffect, useContext } from 'react';
import { ConfigContext } from '../App';
import { getGalleryAlbums, getGalleryPhotos } from '../utils/apiClient';

const Gallery = () => {
  const config = useContext(ConfigContext);
  const primaryColor = config?.theme?.colors?.primary || '#7C3AED';
  
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const data = await getGalleryAlbums();
      setAlbums(data || []);
    } catch (error) {
      console.error('Error loading albums:', error);
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAlbumPhotos = async (albumId) => {
    try {
      setLoadingPhotos(true);
      const photos = await getGalleryPhotos(albumId);
      setAlbumPhotos(photos || []);
    } catch (error) {
      console.error('Error loading photos:', error);
      setAlbumPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleAlbumClick = async (album) => {
    setSelectedAlbum(album);
    await loadAlbumPhotos(album.id);
  };

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
            src={selectedImage.url || selectedImage.image_url} 
            alt={selectedImage.caption || selectedImage.title}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '70vh',
              borderRadius: '8px'
            }}
          />
          {(selectedImage.caption || selectedImage.title) && (
            <p style={{ color: 'white', textAlign: 'center', marginTop: '12px', fontSize: '0.9rem' }}>
              {selectedImage.caption || selectedImage.title}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Album View
  if (selectedAlbum) {
    const photos = albumPhotos.length > 0 ? albumPhotos : (selectedAlbum.images || []);
    
    return (
      <div style={{ padding: '16px', paddingBottom: '100px' }}>
        {/* Back Button */}
        <button
          onClick={() => {
            setSelectedAlbum(null);
            setAlbumPhotos([]);
          }}
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
            {selectedAlbum.title || selectedAlbum.name}
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7280' }}>
            {selectedAlbum.date && new Date(selectedAlbum.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
            {' • '}{photos.length} photos
          </p>
        </div>

        {/* Loading Photos */}
        {loadingPhotos ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #e5e7eb',
              borderTopColor: primaryColor,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        ) : photos.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            color: '#6B7280',
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📷</div>
            <p style={{ margin: 0 }}>No photos in this album yet</p>
          </div>
        ) : (
          /* Image Grid */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '4px'
          }}>
            {photos.map((image, index) => (
              <div
                key={image.id || index}
                onClick={() => setSelectedImage(image)}
                style={{
                  aspectRatio: '1',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  borderRadius: '4px'
                }}
              >
                <img
                  src={image.url || image.image_url || image.thumbnail_url}
                  alt={image.caption || image.title || `Photo ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            ))}
          </div>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Albums Grid
  return (
    <div style={{ padding: '16px', paddingBottom: '100px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700, color: '#1F2937' }}>
        📸 Photo Gallery
      </h2>

      {albums.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          color: '#6B7280',
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📷</div>
          <p style={{ margin: 0 }}>No photo albums available yet</p>
          <p style={{ margin: '8px 0 0', fontSize: '0.875rem' }}>
            Check back later for church event photos
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          {albums.map((album) => (
            <div
              key={album.id}
              onClick={() => handleAlbumClick(album)}
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
                  src={album.coverImage || album.cover_image || album.thumbnail_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={album.title || album.name}
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
                  {album.photo_count || album.images?.length || 0} 📷
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
                  {album.category || 'Event'}
                </span>
                <h3 style={{ 
                  margin: '8px 0 4px', 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  color: '#1F2937',
                  lineHeight: 1.3
                }}>
                  {album.title || album.name}
                </h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#9CA3AF' }}>
                  {album.date && new Date(album.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
