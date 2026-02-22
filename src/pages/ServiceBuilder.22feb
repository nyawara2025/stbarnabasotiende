import React, { useState, useContext } from 'react';
import { ConfigContext } from '../App';
import { getStoredUser } from '../utils/apiClient';

const ServiceBuilder = () => {
  const config = useContext(ConfigContext);
  const user = getStoredUser();

  const [serviceName, setServiceName] = useState('');
  const [theme, setTheme] = useState('Breakthrough Month');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [items, setItems] = useState([]);

  // Add a new empty item based on type
  const addItem = (type) => {
    const templates = {
      hymn: { type: 'hymn', number: '', title: '', verses: '' },
      prayer: { type: 'prayer', title: '', text: '' },
      reading: { type: 'reading', reference: '', reader: '', text: '', label: 'First Reading' },
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
    // Structure payload to match your public.services table
    const payload = {
      org_id: config?.orgId || 1, // Multi-tenant ID from config
      service_type: 'Sunday Service',
      title: serviceName,
      service_date: serviceDate,
      start_time: `${startTime}:00`,
      theme: theme,
      order_items: items, // Maps to jsonb
      status: 'scheduled',
      description: `Created by admin: ${user?.first_name || 'System'}`,
      // Extract specific sermon details if they exist in items
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
        alert('Service Published Successfully!');
      } else {
        alert('Failed to save service. Check console.');
      }
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', paddingBottom: '100px' }}>
      <h1 style={{ color: config?.theme?.colors?.primary || '#7C3AED' }}>Create Service Order</h1>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.8rem', display: 'block' }}>Date</label>
          <input type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.8rem', display: 'block' }}>Start Time</label>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ width: '100%', padding: '8px' }} />
        </div>
      </div>

      <input 
        placeholder="Service Name (e.g. English Service)" 
        value={serviceName} 
        onChange={(e) => setServiceName(e.target.value)} 
        style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }}
      />

      <input 
        placeholder="Theme (e.g. Breakthrough Month)" 
        value={theme} 
        onChange={(e) => setTheme(e.target.value)} 
        style={{ width: '100%', marginBottom: '20px', padding: '8px', boxSizing: 'border-box' }}
      />
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => addItem('hymn')}>+ Hymn</button>
        <button onClick={() => addItem('prayer')}>+ Prayer</button>
        <button onClick={() => addItem('reading')}>+ Reading</button>
        <button onClick={() => addItem('sermon')}>+ Sermon</button>
      </div>

      {items.map((item, idx) => (
        <div key={item.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '8px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <strong style={{ color: '#7C3AED' }}>{item.type.toUpperCase()}</strong>
            <button onClick={() => setItems(items.filter((_, i) => i !== idx))} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Remove</button>
          </div>

          {item.type === 'hymn' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <input style={{ width: '60px' }} placeholder="No." onChange={e => updateItem(idx, 'number', e.target.value)} />
              <input style={{ flex: 1 }} placeholder="Hymn Title" onChange={e => updateItem(idx, 'title', e.target.value)} />
            </div>
          )}

          {item.type === 'prayer' && (
            <textarea placeholder="Prayer Text" onChange={e => updateItem(idx, 'text', e.target.value)} style={{ width: '100%', minHeight: '60px' }} />
          )}

          {item.type === 'reading' && (
            <div style={{ display: 'grid', gap: '5px' }}>
              <input placeholder="Bible Reference (e.g. John 3:16)" onChange={e => updateItem(idx, 'reference', e.target.value)} />
              <input placeholder="Reader Name" onChange={e => updateItem(idx, 'reader', e.target.value)} />
            </div>
          )}

          {item.type === 'sermon' && (
            <div style={{ display: 'grid', gap: '5px' }}>
              <input placeholder="Sermon Title" onChange={e => updateItem(idx, 'title', e.target.value)} />
              <input placeholder="Preacher" onChange={e => updateItem(idx, 'preacher', e.target.value)} />
            </div>
          )}
        </div>
      ))}

      <button 
        onClick={saveService} 
        style={{ 
          background: config?.theme?.colors?.primary || '#7C3AED', 
          color: 'white', 
          padding: '12px 20px', 
          width: '100%', 
          border: 'none', 
          borderRadius: '8px', 
          fontWeight: 'bold',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Publish Service Order
      </button>
    </div>
  );
};

export default ServiceBuilder;
