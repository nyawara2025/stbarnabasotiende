// Build the final response
const result = {
  success: true,
  data: []
};

// Group messages by user_id
const conversations = {};

for (const item of items) {
  const convItem = item.json;
  
  if (!conversations[convItem.user_id]) {
    conversations[convItem.user_id] = {
      user_id: convItem.user_id,
      user_name: convItem.user_name,
      phone: convItem.user_phone,
      last_message_time: convItem.created_at,
      messages: []
    };
  }
  
  conversations[convItem.user_id].messages.push({
    id: convItem.id,
    text: convItem.message,
    timestamp: convItem.created_at,
    sender: convItem.sender
  });
  
  // Update last_message_time if newer
  const msgTime = new Date(convItem.created_at);
  const convTime = new Date(conversations[convItem.user_id].last_message_time);
  if (msgTime > convTime) {
    conversations[convItem.user_id].last_message_time = convItem.created_at;
  }
}

result.data = Object.values(conversations);

// Return single item with the result
return [result];
