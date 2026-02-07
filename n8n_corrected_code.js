// N8N Code Node - Transforms PostgreSQL data to Frontend format
// Output: {conversations: [{user_id, user_name, phone, last_message_time, messages: [{id, text, timestamp, sender}]}]}

const conversations = {};

for (const item of items) {
  // Get user_id from the item
  const userId = item.user_id;
  
  if (!userId) continue;
  
  // Create conversation object if it doesn't exist
  if (!conversations[userId]) {
    conversations[userId] = {
      user_id: userId,
      user_name: item.user_name || 'Unknown',
      phone: item.user_phone || '',
      last_message_time: item.created_at,
      messages: []
    };
  }
  
  // Add message to the conversation
  conversations[userId].messages.push({
    id: item.id,
    text: item.message || '',
    timestamp: item.created_at,
    sender: item.sender_type || 'user'
  });
  
  // Update last_message_time if this message is newer
  const msgTime = new Date(item.created_at);
  const convTime = new Date(conversations[userId].last_message_time);
  if (msgTime > convTime) {
    conversations[userId].last_message_time = item.created_at;
  }
}

// Convert to array and return
const result = {
  conversations: Object.values(conversations)
};

// Log for debugging
console.log('Output:', JSON.stringify(result, null, 2));

return result;
