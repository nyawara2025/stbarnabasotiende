import React, { useState, useContext } from 'react';
import { ConfigContext } from '../App';
import { getStoredUser } from '../utils/apiClient';

const ServiceBuilder = () => {
  const config = useContext(ConfigContext);
  const user = getStoredUser();

  const [serviceName, setServiceName] = useState('');
  const [theme, setTheme] = useState('Breakthrough Month');
  // Initialize with current local date string (YYYY-MM-DD)
  const [serviceDate, setServiceDate] = useState(new Date().toLocaleDateString('en-CA')); 
  const [startTime, setStartTime] = useState("10:00");
  const [items, setItems] = useState([]);

  // Add a new empty item based on type
  const addItem = (type) => {
    const templates = {
      hymn: { type: 'hymn', number: '', title: '', verses: '' },
      prayer: { type: 'prayer', title: '', text: '' },
      reading: { type: 'reading', reference: '', reader: '', text: '', label: 'Scripture Reading' },
      sermon: { type: 'sermon', preacher: '', title: '', duration: '' }
    };
    setItems([...items, { ...templates[type], id: Date.now() }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const saveService = async () => {
    // 1. Validation: Ensure there is actually content to save
    if (items.length === 0) {
      alert("Please add at least one item (Hymn, Prayer, etc.) before publishing.");
      return;
    }

    // 2. Structure payload to match your public.services table schema
    const payload = {
      org_id: config?.identity?.orgId || 2, // Pulling from config.json identity
      service_type: 'Sunday Service',
      title: serviceName || 'Sunday Service',
      service_date: serviceDate,
      start_time: `${startTime}:00`,
      theme: theme,
      order_items: items, // Explicitly sending the full Array
      status: 'published',
      description: `Created by: ${user?.first_name || 'Admin'}`,
      sermon_title: items.find(i => i.type === 'sermon')?.title || '',
      preacher: items.find(i => i.type === 'sermon')?.preacher || ''
    };
    
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/save-service-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Service Order Published Successfully!');
        // Optional: Clear items after successful publish
        // setItems([]); 
      } else {
        const errorText = await response.text();
        console.error("Server responded with error:", errorText);
        alert('Failed to save service. Check server logs.');
      }
    } catch (err) {
      console.error("Network/Save failed", err);
      alert('Connection error. Please try again.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', paddingBottom: '100px' }}>
      <h1 style={{ color: config?.theme?.colors?.primary || '#7C3AED', fontSize: '1.5rem', marginBottom: '20px' }}>
        Create Service Order
      </h1>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px', color: '#666' }}>Service Date</label>
          <input type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px', color: '#666' }}>Start Time</label>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
        </div>
      </div>

      <input 
        placeholder="Service Name (e.g. English Service)" 
        value={serviceName} 
        onChange={(e) => setServiceName(e.target.value)} 
        style={{ width: '100%', marginBottom: '10px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
      />

      <input 
        placeholder="Theme (e.g. Harvest time)" 
        value={theme} 
        onChange={(e) => setTheme(e.target.value)} 
        style={{ width: '100%', marginBottom: '20px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
      />
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => addItem('hymn')} style={{ padding: '8px 12px', borderRadius: '20px', border: '1px solid #7C3AED', background: 'none', color: '#7C3AED', cursor: 'pointer' }}>+ Hymn</button>
        <button onClick={() => addItem('prayer')} style={{ padding: '8px 12px', borderRadius: '20px', border: '1px solid #7C3AED', background: 'none', color: '#7C3AED', cursor: 'pointer' }}>+ Prayer</button>
        <button onClick={() => addItem('reading')} style={{ padding: '8px 12px', borderRadius: '20px', border: '1px solid #7C3AED', background: 'none', color: '#7C3AED', cursor: 'pointer' }}>+ Reading</button>
        <button onClick={() => addItem('sermon')} style={{ padding: '8px 12px', borderRadius: '20px', border: '1px solid #7C3AED', background: 'none', color: '#7C3AED', cursor: 'pointer' }}>+ Sermon</button>
      </div>

      {items.map((item, idx) => (
        <div key={item.id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '12px', borderRadius: '12px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
            <strong style={{ color: '#7C3AED', fontSize: '0.8rem' }}>{item.type.toUpperCase()}</strong>
            <button onClick={() => setItems(items.filter((_, i) => i !== idx))} style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
          </div>

          {item.type === 'hymn' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <input style={{ width: '60px', padding: '8px' }} placeholder="No." value={item.number} onChange={e => updateItem(idx, 'number', e.target.value)} />
              <input style={{ flex: 1, padding: '8px' }} placeholder="Hymn Title" value={item.title} onChange={e => updateItem(idx, 'title', e.target.value)} />
            </div>
          )}

          {item.type === 'prayer' && (
            <textarea placeholder="Prayer Text..." value={item.text} onChange={e => updateItem(idx, 'text', e.target.value)} style={{ width: '100%', minHeight: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
          )}

          {item.type === 'reading' && (
            <div style={{ display: 'grid', gap: '8px' }}>
              <input placeholder="Bible Reference (e.g. Psalm 23)" value={item.reference} onChange={e => updateItem(idx, 'reference', e.target.value)} style={{ padding: '8px' }} />
              <input placeholder="Reader Name" value={item.reader} onChange={e => updateItem(idx, 'reader', e.target.value)} style={{ padding: '8px' }} />
            </div>
          )}

          {item.type === 'sermon' && (
            <div style={{ display: 'grid', gap: '8px' }}>
              <input placeholder="Sermon Title" value={item.title} onChange={e => updateItem(idx, 'title', e.target.value)} style={{ padding: '8px' }} />
              <input placeholder="Preacher Name" value={item.preacher} onChange={e => updateItem(idx, 'preacher', e.target.value)} style={{ padding: '8px' }} />
            </div>
          )}
        </div>
      ))}

      <button 
        onClick={saveService} 
        style={{ 
          background: config?.theme?.colors?.primary || '#7C3AED', 
          color: 'white', 
          padding: '16px 20px', 
          width: '100%', 
          border: 'none', 
          borderRadius: '12px', 
          fontWeight: 'bold',
          fontSize: '1rem',
          cursor: 'pointer',
          marginTop: '20px',
          boxShadow: '0 4px 6px rgba(124, 58, 237, 0.2)'
        }}
      >
        Publish Service Order
      </button>
    </div>
  );
};

export default ServiceBuilder;
