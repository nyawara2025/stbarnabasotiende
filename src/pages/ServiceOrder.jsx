import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ConfigContext } from '../App';
import { apiRequest } from '../utils/apiClient';

const ServiceOrder = () => {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const config = useContext(ConfigContext);
  const primaryColor = config?.theme?.colors?.primary || '#7C3AED';
  
  const [serviceOrder, setServiceOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);

  // Sample service order data - in production this comes from API
  const sampleServiceOrder = {
    id: serviceId || 'english',
    serviceName: 'English Service',
    date: new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    time: '10:00 AM - 12:00 PM',
    theme: 'Walking in Faith',
    presider: 'Rev. Canon James Mwangi',
    preacher: 'Rev. Sarah Njeri',
    
    sections: [
      {
        id: 'preparation',
        title: '🕯️ Preparation',
        items: [
          { type: 'instruction', text: 'Please stand as the procession enters' },
          { type: 'hymn', number: '1', title: 'Holy, Holy, Holy', verses: '1, 2, 4' },
        ]
      },
      {
        id: 'greeting',
        title: '✝️ The Greeting',
        items: [
          { type: 'versicle', leader: 'In the name of the Father, and of the Son, and of the Holy Spirit.', response: 'Amen.' },
          { type: 'versicle', leader: 'The Lord be with you.', response: 'And also with you.' },
          { type: 'prayer', title: 'Collect for Purity', text: 'Almighty God, to you all hearts are open, all desires known, and from you no secrets are hid: Cleanse the thoughts of our hearts by the inspiration of your Holy Spirit, that we may perfectly love you, and worthily magnify your holy Name; through Christ our Lord.' },
        ]
      },
      {
        id: 'penitence',
        title: '🙏 Prayers of Penitence',
        items: [
          { type: 'instruction', text: 'Please kneel or sit' },
          { type: 'text', text: 'Let us confess our sins in penitence and faith, firmly resolved to keep God\'s commandments and to live in love and peace with all.' },
          { type: 'confession', text: 'Almighty God, our heavenly Father,\nwe have sinned against you\nand against our neighbour\nin thought and word and deed,\nthrough negligence, through weakness,\nthrough our own deliberate fault.\nWe are truly sorry\nand repent of all our sins.\nFor the sake of your Son Jesus Christ,\nwho died for us,\nforgive us all that is past\nand grant that we may serve you in newness of life\nto the glory of your name. Amen.' },
          { type: 'absolution', text: 'Almighty God, who forgives all who truly repent, have mercy upon you, pardon and deliver you from all your sins, confirm and strengthen you in all goodness, and keep you in life eternal; through Jesus Christ our Lord. Amen.' },
        ]
      },
      {
        id: 'gloria',
        title: '🎵 Gloria in Excelsis',
        items: [
          { type: 'instruction', text: 'Please stand' },
          { type: 'canticle', text: 'Glory to God in the highest,\nand peace to his people on earth.\nLord God, heavenly King,\nalmighty God and Father,\nwe worship you, we give you thanks,\nwe praise you for your glory.\n\nLord Jesus Christ, only Son of the Father,\nLord God, Lamb of God,\nyou take away the sin of the world:\nhave mercy on us;\nyou are seated at the right hand of the Father:\nreceive our prayer.\n\nFor you alone are the Holy One,\nyou alone are the Lord,\nyou alone are the Most High, Jesus Christ,\nwith the Holy Spirit,\nin the glory of God the Father. Amen.' },
        ]
      },
      {
        id: 'collect',
        title: '📖 The Collect of the Day',
        items: [
          { type: 'prayer', title: 'Collect', text: 'Almighty God, you have given your only Son to be for us both a sacrifice for sin and an example of godly life: Give us grace to receive thankfully the fruits of his redeeming work, and to follow daily in the blessed steps of his most holy life; through Jesus Christ your Son our Lord, who lives and reigns with you and the Holy Spirit, one God, now and for ever. Amen.' },
        ]
      },
      {
        id: 'readings',
        title: '📜 The Liturgy of the Word',
        items: [
          { type: 'instruction', text: 'Please sit' },
          { type: 'reading', label: 'First Reading', reference: 'Isaiah 55:1-11', reader: 'Wanjiku Kamau (Mt. Olive Zone)', text: '"Come, everyone who thirsts, come to the waters; and he who has no money, come, buy and eat! Come, buy wine and milk without money and without price. Why do you spend your money for that which is not bread, and your labor for that which does not satisfy? Listen diligently to me, and eat what is good, and delight yourselves in rich food..."' },
          { type: 'versicle', leader: 'This is the Word of the Lord.', response: 'Thanks be to God.' },
          
          { type: 'psalm', reference: 'Psalm 23', text: 'The Lord is my shepherd; I shall not want.\nHe makes me lie down in green pastures.\nHe leads me beside still waters.\nHe restores my soul.\nHe leads me in paths of righteousness for his name\'s sake.\n\nEven though I walk through the valley of the shadow of death,\nI will fear no evil, for you are with me;\nyour rod and your staff, they comfort me.\n\nYou prepare a table before me in the presence of my enemies;\nyou anoint my head with oil; my cup overflows.\nSurely goodness and mercy shall follow me all the days of my life,\nand I shall dwell in the house of the Lord forever.' },
          
          { type: 'reading', label: 'Second Reading', reference: '1 Corinthians 13:1-13', reader: 'Peter Ochieng (Jerusalem Zone)', text: 'If I speak in the tongues of men and of angels, but have not love, I am a noisy gong or a clanging cymbal. And if I have prophetic powers, and understand all mysteries and all knowledge, and if I have all faith, so as to remove mountains, but have not love, I am nothing...' },
          { type: 'versicle', leader: 'This is the Word of the Lord.', response: 'Thanks be to God.' },
          
          { type: 'instruction', text: 'Please stand for the Gospel' },
          { type: 'hymn', number: '264', title: 'Alleluia, Alleluia, Give Thanks', verses: '1, 2' },
          
          { type: 'gospel', reference: 'John 15:1-17', text: '"I am the true vine, and my Father is the vinedresser. Every branch in me that does not bear fruit he takes away, and every branch that does bear fruit he prunes, that it may bear more fruit..."' },
          { type: 'versicle', leader: 'The Gospel of the Lord.', response: 'Praise to you, Lord Christ.' },
        ]
      },
      {
        id: 'sermon',
        title: '🎤 The Sermon',
        items: [
          { type: 'instruction', text: 'Please sit' },
          { type: 'sermon', preacher: 'Rev. Sarah Njeri', title: 'Abiding in the Vine', duration: '25 mins' },
        ]
      },
      {
        id: 'creed',
        title: '✝️ The Nicene Creed',
        items: [
          { type: 'instruction', text: 'Please stand' },
          { type: 'creed', text: 'We believe in one God,\nthe Father, the Almighty,\nmaker of heaven and earth,\nof all that is, seen and unseen.\n\nWe believe in one Lord, Jesus Christ,\nthe only Son of God,\neternally begotten of the Father,\nGod from God, Light from Light,\ntrue God from true God,\nbegotten, not made,\nof one Being with the Father;\nthrough him all things were made.\nFor us and for our salvation\nhe came down from heaven,\nwas incarnate from the Holy Spirit and the Virgin Mary\nand was made man.\nFor our sake he was crucified under Pontius Pilate;\nhe suffered death and was buried.\nOn the third day he rose again\nin accordance with the Scriptures;\nhe ascended into heaven\nand is seated at the right hand of the Father.\nHe will come again in glory to judge the living and the dead,\nand his kingdom will have no end.\n\nWe believe in the Holy Spirit,\nthe Lord, the giver of life,\nwho proceeds from the Father and the Son,\nwho with the Father and the Son is worshipped and glorified,\nwho has spoken through the prophets.\nWe believe in one holy catholic and apostolic Church.\nWe acknowledge one baptism for the forgiveness of sins.\nWe look for the resurrection of the dead,\nand the life of the world to come. Amen.' },
        ]
      },
      {
        id: 'intercession',
        title: '🙏 Prayers of Intercession',
        items: [
          { type: 'instruction', text: 'Please kneel or sit' },
          { type: 'text', text: 'Led by: Mary Akinyi (Bethlehem Zone)' },
          { type: 'response', cue: 'Lord, in your mercy', response: 'Hear our prayer.' },
        ]
      },
      {
        id: 'peace',
        title: '🕊️ The Peace',
        items: [
          { type: 'instruction', text: 'Please stand' },
          { type: 'versicle', leader: 'The peace of the Lord be always with you.', response: 'And also with you.' },
          { type: 'instruction', text: 'Let us offer one another a sign of peace.' },
        ]
      },
      {
        id: 'offertory',
        title: '💰 The Offertory',
        items: [
          { type: 'hymn', number: '375', title: 'Take My Life and Let It Be', verses: '1, 2, 3, 4' },
          { type: 'announcements', text: 'Announcements will be made during the offertory.' },
        ]
      },
      {
        id: 'eucharist',
        title: '🍷 The Eucharistic Prayer',
        items: [
          { type: 'versicle', leader: 'The Lord be with you.', response: 'And also with you.' },
          { type: 'versicle', leader: 'Lift up your hearts.', response: 'We lift them to the Lord.' },
          { type: 'versicle', leader: 'Let us give thanks to the Lord our God.', response: 'It is right to give thanks and praise.' },
          { type: 'sanctus', text: 'Holy, holy, holy Lord,\nGod of power and might,\nheaven and earth are full of your glory.\nHosanna in the highest.\nBlessed is he who comes in the name of the Lord.\nHosanna in the highest.' },
        ]
      },
      {
        id: 'lords-prayer',
        title: '🙏 The Lord\'s Prayer',
        items: [
          { type: 'prayer', title: '', text: 'Our Father in heaven,\nhallowed be your name,\nyour kingdom come,\nyour will be done,\non earth as in heaven.\nGive us today our daily bread.\nForgive us our sins\nas we forgive those who sin against us.\nLead us not into temptation\nbut deliver us from evil.\nFor the kingdom, the power,\nand the glory are yours\nnow and for ever. Amen.' },
        ]
      },
      {
        id: 'communion',
        title: '🍞 The Communion',
        items: [
          { type: 'instruction', text: 'Please come forward row by row to receive communion.' },
          { type: 'hymn', number: '321', title: 'Here Is Love Vast as the Ocean', verses: 'All' },
          { type: 'hymn', number: '456', title: 'What a Friend We Have in Jesus', verses: 'All' },
        ]
      },
      {
        id: 'post-communion',
        title: '✨ Post-Communion Prayer',
        items: [
          { type: 'prayer', title: '', text: 'Almighty God, we thank you for feeding us with the body and blood of your Son Jesus Christ. Through him we offer you our souls and bodies to be a living sacrifice. Send us out in the power of your Spirit to live and work to your praise and glory. Amen.' },
        ]
      },
      {
        id: 'blessing',
        title: '🙌 The Blessing & Dismissal',
        items: [
          { type: 'instruction', text: 'Please stand' },
          { type: 'blessing', text: 'The peace of God, which passes all understanding, keep your hearts and minds in the knowledge and love of God, and of his Son Jesus Christ our Lord; and the blessing of God almighty, the Father, the Son, and the Holy Spirit, be among you and remain with you always. Amen.' },
          { type: 'versicle', leader: 'Go in peace to love and serve the Lord.', response: 'In the name of Christ. Amen.' },
          { type: 'hymn', number: '512', title: 'Guide Me, O Thou Great Jehovah', verses: '1, 2, 3' },
        ]
      },
    ]
  };

  useEffect(() => {
    // In production, fetch from API
    setTimeout(() => {
      setServiceOrder(sampleServiceOrder);
      setLoading(false);
    }, 500);
  }, [serviceId]);

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
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#6B7280' }}>Verses: {item.verses}</p>
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
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', fontStyle: 'italic', lineHeight: 1.6 }}>
              {item.text}
            </p>
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
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
              {item.text}
            </p>
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
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Duration: ~{item.duration}</p>
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
              ⛪ {serviceOrder?.serviceName}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', opacity: 0.9 }}>
              {serviceOrder?.date}
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
          <p style={{ margin: 0 }}><strong>Theme:</strong> {serviceOrder?.theme}</p>
          <p style={{ margin: '2px 0 0' }}><strong>Presider:</strong> {serviceOrder?.presider}</p>
          <p style={{ margin: '2px 0 0' }}><strong>Preacher:</strong> {serviceOrder?.preacher}</p>
        </div>
      </div>

      {/* Quick Navigation */}
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
        {serviceOrder?.sections.map((section) => (
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

      {/* Service Order Content */}
      <div style={{ padding: '16px', paddingBottom: '100px' }}>
        {serviceOrder?.sections.map((section) => (
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
            {section.items.map((item, idx) => renderItem(item, idx))}
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
