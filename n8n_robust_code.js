// Robust N8N Code Node - Handles various field name variations

// Log input for debugging
console.log('Number of items:', items.length);
console.log('First item keys:', items.length > 0 ? Object.keys(items[0]) : 'No items');

const conversations = {};

for (const item of items) {
  // Handle various user_id field names
  const userId = item.user_id || item.userId || item.id;
  if (!userId) {
    console.log('Skipping item with no user_id:', JSON.stringify(item));
    continue;
  }
  
  // Handle various name field names
  const userName = item.user_name || item.sender || item.name || 'Unknown';
  
  // Handle various phone field names
  const phone = item.user_phone || item.phone || item.telephone || '';
  
  // Handle various timestamp field names
  const createdAt = item.created_at || item.createdAt || item.timestamp || item.date || new Date().toISOString();
  
  // Handle various message field names
  const messageText = item.message || item.text || item.msg || item.content || '';
  
  // Handle various sender type field names
  const senderType = item.sender_type || item.senderType || item.type || 'user';
  
  if (!conversations[userId]) {
    conversations[userId] = {
      user_id: userId,
      user_name: userName,
      phone: phone,
      last_message_time: createdAt,
      messages: []
    };
  }
  
  conversations[userId].messages.push({
    id: item.id || Math.random(),
    text: messageText,
    timestamp: createdAt,
    sender: senderType
  });
  
  // Update last_message_time if newer
  const msgTime = new Date(createdAt);
  const convTime = new Date(conversations[userId].last_message_time);
  if (msgTime > convTime) {
    conversations[userId].last_message_time = createdAt;
  }
}

const result = {
  conversations: Object.values(conversations)
};

console.log('Output conversations count:', result.conversations.length);
if (result.conversations.length > 0) {
  console.log('First conversation:', JSON.stringify(result.conversations[0], null, 2));
}

return result;
