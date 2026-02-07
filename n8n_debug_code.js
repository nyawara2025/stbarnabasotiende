// N8N Debug Code Node Script
// Use this to see exactly what fields are available in each item

// Log the first item to see its structure
if (items && items.length > 0) {
  console.log('First item keys:', Object.keys(items[0]));
  console.log('First item:', JSON.stringify(items[0], null, 2));
}

// Transform data
const conversations = {};

items.forEach((item, index) => {
  console.log(`Item ${index} keys:`, Object.keys(item));
  
  if (!conversations[item.user_id]) {
    conversations[item.user_id] = {
      user_id: item.user_id,
      user_name: item.user_name,
      phone: item.user_phone,
      last_message_time: item.created_at,
      messages: []
    };
  }
  
  conversations[item.user_id].messages.push({
    id: item.id,
    text: item.message || 'NO MESSAGE TEXT',
    timestamp: item.created_at,
    sender: item.sender_type || item.sender || 'user'
  });
  
  if (new Date(item.created_at) > new Date(conversations[item.user_id].last_message_time)) {
    conversations[item.user_id].last_message_time = item.created_at;
  }
});

console.log('Conversations:', JSON.stringify(Object.values(conversations), null, 2));

return { conversations: Object.values(conversations) };
