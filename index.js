const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

// Load environment variables from a .env file (if you have one)
require("dotenv").config();
const port = process.env.PORT;
// Initialize the Express app
const app = express();

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, {
  polling: true
});

// Define a map to store user states (for multi-step conversations)
const userStates = new Map();

async function getCryptoPrice(cryptoSymbol) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoSymbol}&vs_currencies=usd`
    );
    const data = await response.json();

    // Use optional chaining to access 'usd' property safely
    return data?. [cryptoSymbol]?.usd ?? null;
  } catch (err) {
    console.log(`Error fetching crypto price: ${err}`);
    return null;
  }
}

// Define a function to initiate the conversation
function startCryptoPriceConversation(chatId) {
  userStates.set(chatId, {
    step: 1,
    cryptoSymbol: null,
  });
  bot.sendMessage(
    chatId,
    "Please enter the cryptocurrency symbol you want to check the price of:"
  );
}

// Define the bot's message handler
bot.onText(/\/checkPrice/, (msg) => {
  const chatId = msg.chat.id;
  startCryptoPriceConversation(chatId);
});

// Listen for text messages
bot.on("text", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const state = userStates.get(chatId) || {};

  switch (state.step) {
    case 1:
      // Expecting cryptocurrency symbol, fetch and display price
      const cryptoSymbol = text.toLowerCase();
      const price = await getCryptoPrice(cryptoSymbol);
      const message =
        price !== null ?
        `The current price of ${cryptoSymbol.toUpperCase()} is $${price}` :
        `Sorry, there was an error fetching the price of ${cryptoSymbol.toUpperCase()}.`;
      bot.sendMessage(chatId, message);
      // End the conversation
      userStates.delete(chatId);
      break;
  }
});

// Function to calculate position size
function calculatePositionSize(riskAmount, stopLossDistance) {
  const positionSize = riskAmount / (stopLossDistance / 100);
  return positionSize;
}

// Define a keyboard with leverage options
const leverageKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{
        text: "10x",
        callback_data: "10x"
      }],
      [{
        text: "20x",
        callback_data: "20x"
      }],
      [{
        text: "30x",
        callback_data: "30x"
      }],
      [{
        text: "40x",
        callback_data: "40x"
      }],
      [{
        text: "50x",
        callback_data: "50x"
      }],
    ],
  },
};

// Listen for the /calculate command to initiate the prompt
bot.onText(/\/calculate/, (msg) => {
  const chatId = msg.chat.id;

  // Set the user's state to 'waiting_for_account_size'
  userStates.set(chatId, {
    step: "waiting_for_account_size"
  });

  // Ask for the account size
  bot.sendMessage(chatId, "Please enter your account size: 💰");
});

// Listen for inline keyboard button clicks
bot.on("callback_query", (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const userState = userStates.get(chatId);
  const leverageSize = callbackQuery.data;

  if (!userState) {
    return;
  }

  if (userState.step === "waiting_for_leverage") {
    // User has selected leverage size, calculate and send the result
    const positionSize = userState.positionSize;
    const accountSize = userState.accountSize;
    const riskAmount = userState.riskAmount; // Access the account size from the user's state
    const riskRatio = ((riskAmount / accountSize) * 100).toFixed(2);

    let result;

    // Perform calculations based on the selected leverage size, position size, and account size
    switch (leverageSize) {
      case "10x":
        const margin10x = (positionSize / 10).toFixed(2);
        if (parseFloat(margin10x) > parseFloat(accountSize)) {
          result = `<b><u>Trade Analysis📊📉</u></b>\nMargin: $${margin10x}\nLeverage: 10x\nRisk Ratio: ${riskRatio}%\n<b>Warning❌❌❌: Margin is greater than account size!</b>\n<b>Use Higher Leverage 20x, 30x, 40x, 50x Or Fund Your Account</b>`;
        } else {
          result = `<b><u>Trade Analysis📊📉</u></b>\nMargin: $${margin10x}\nLeverage: 10x\nRisk Ratio: ${riskRatio}%\n✅✅✅ Take Trade📉.`;
        }
        break;
      case "20x":
        const margin20x = (positionSize / 20).toFixed(2);
        if (parseFloat(margin20x) > parseFloat(accountSize)) {
          result = `<b><u>Trade Analysis📊📉</u></b>\nMargin: $${margin20x}\nLeverage: 20x\nRisk Ratio: ${riskRatio}%\n<b>Warning❌❌❌: Margin is greater than account size!</b>\n<b>Use Higher Leverage 30x, 40x, 50x \n Or Fund Your Account</b>`;
        } else {
          result = `<b><u>Trade Analysis📊📉</u></b>\nMargin: $${margin20x}\nLeverage: 20x\nRisk Ratio: ${riskRatio}%\n✅✅✅ Take Trade📉.`;
        }
        break;
      case "30x":
        const margin30x = (positionSize / 30).toFixed(2);
        if (parseFloat(margin30x) > parseFloat(accountSize)) {
          result = `<b><u>Trade Analysis📊📉</u></b>\nMargin: $${margin30x}\nLeverage: 30x\nRisk Ratio: ${riskRatio}%\n<b>Warning❌❌❌: Margin is greater than account size!</b>\n<b>Use Higher Leverage 40x, 50x \n Or Fund Your Account</b>`;
        } else {
          result = `<b><u>Trade Analysis📊📉</u></b>\nMargin: $${margin30x}\nLeverage: 30x\nRisk Ratio: ${riskRatio}%\n✅✅✅ Take Trade📉.`;
        }
        break;
        case "40x":
        const margin40x = (positionSize / 40).toFixed(2);
        if (parseFloat(margin40x) > parseFloat(accountSize)) {
          result = `<b><u>Trade Analysis📊📉</u></b>\nMargin: $${margin40x}\nLeverage: 40x\nRisk Ratio: ${riskRatio}%\n<b>Warning❌❌❌: Margin is greater than account size!</b>\n<b>Use Higher Leverage 50x \n Or Fund Your Account</b>`;
        } else {
          result = `<b><u>Trade Analysis📊📉</u></b>\nMargin: $${margin40x}\nLeverage: 40x\nRisk Ratio: ${riskRatio}%\n✅✅✅ Take Trade📉.`;
        }
        break;
        case "50x":
        const margin50x = (positionSize / 50).toFixed(2);
        if (parseFloat(margin50x) > parseFloat(accountSize)) {
          result = `<b><u>Trade Analysis📊📉</u></b>\nMargin: $${margin50x}\nLeverage: 50x\nRisk Ratio: ${riskRatio}%\n<b>Warning❌❌❌: Margin is greater than account size!</b>\n<b>Use Higher Leverage 60x \n Or Fund Your Account</b>`;
        } else {
          result = `<b><u>Trade Analysis📊📉</u></b>\nMargin: $${margin50x}\nLeverage: 50x\nRisk Ratio: ${riskRatio}%\n✅✅✅ Take Trade📉.`;
        }
        break;
      default:
        result = "Invalid selection.";
    }

    // Send the calculation result back to the user
    bot.sendMessage(chatId, result, {parse_mode: "HTML"});

    // Remove the user's state
    userStates.delete(chatId);
  }
});

// Listen for text messages
bot.on("text", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const userState = userStates.get(chatId);

  if (userState) {
    switch (userState.step) {
      case "waiting_for_account_size":
        // User entered account size, store it in user state
        userState.accountSize = parseFloat(text);

        // Ask for risk amount
        bot.sendMessage(chatId, "Please enter your risk amount: 📊");

        // Update the user's state to 'waiting_for_risk_amount'
        userState.step = "waiting_for_risk_amount";
        break;

      case "waiting_for_risk_amount":
        // User entered risk amount, store it in user state
        userState.riskAmount = parseFloat(text);

        // Ask for stop loss distance
        bot.sendMessage(chatId, "Please enter your stop loss distance: 🛑:");

        // Update the user's state to 'waiting_for_stop_loss_distance'
        userState.step = "waiting_for_stop_loss_distance";
        break;

      case "waiting_for_stop_loss_distance":
        // User entered stop loss distance, store it in user state
        userState.stopLossDistance = parseFloat(text);

        // Calculate the position size based on riskAmount and stopLossDistance
        const riskAmount = userState.riskAmount;
        const stopLossDistance = userState.stopLossDistance;
        //const accountSize = userState.accountSize;
        userState.positionSize = calculatePositionSize(
          riskAmount,
          stopLossDistance
        );
        const positionSizes = calculatePositionSize(
          riskAmount,
          stopLossDistance
        );
        const positionSize = positionSizes.toFixed(2);

        // Ask for leverage size
        bot.sendMessage(
          chatId,
          `Calculated Position Size: $${positionSize} \nPlease enter your leverage size: 📋`,
          leverageKeyboard
        );

        // Update the user's state to 'waiting_for_leverage'
        userState.step = "waiting_for_leverage";
        break;
        case "waiting_for_leverage":
          break;

      default:
        // Handle any other steps or invalid input
        bot.sendMessage(chatId, "Invalid input or step.");
        break;
    }
  } else {
    bot.sendMessage(chatId, "Sorry, I don't understand that input. Please start a valid command or conversation.");
  }
});

// Listen for the /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
  Welcome to Dee Trade Calculator Bot! Here are the available commands:
  
  /checkPrice - Check the price of a cryptocurrency.
  /calculate - Calculate position size and leverage.
  /help - Show this help message.
  `;
  bot.sendMessage(chatId, helpMessage);
});

// Listen for the /start command (you can customize the welcome message)
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = "Welcome to the Dee Trade Calculator Bot! Type /help to see available commands.";
  bot.sendMessage(chatId, welcomeMessage);
});

// Listen for text messages (catch-all handler)
bot.on("text", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Check if the message text doesn't match any specific commands
  if (!text.match(/^\/(help|calculate|checkPrice)/)) {
    // Respond with a default message for unrecognized commands
    const defaultMessage = "Sorry, I don't understand that command. Type /help to see available commands.";
    bot.sendMessage(chatId, defaultMessage);
  }
});


// Handle errors
bot.on("polling_error", (error) => {
  console.error("Polling error:", error);
});

// Start your bot
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});