require('dotenv').config();
const axios = require('axios');
const botToken = process.env.TELEGRAM_BOT_TOKEN; // Replace with your bot's token

// This function sends a message to your bot and logs the chat_id to the console
async function getChatId() {
  try {
    const response = await axios.post(`https://api.telegram.org/bot${botToken}/getUpdates`);
    const chatId = response?.data?.result[0]?.message?.chat?.id;
    console.log(`Your chat_id is: ${chatId}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getChatId();
