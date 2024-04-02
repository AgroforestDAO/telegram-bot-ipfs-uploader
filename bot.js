require('dotenv').config();
const { Telegraf } = require("telegraf");
const { handleStart, handleText, handlePhoto } = require("./botInteractions");
const { setSafState, getSafState } = require('./safStateManager');
const BOT_TOKEN = process.env.BOT_TOKEN; // Acessando o BOT_TOKEN diretamente do ambiente
const bot = new Telegraf(BOT_TOKEN);

bot.start(handleStart);
bot.on("text", handleText);
bot.on("photo", handlePhoto);

// bot.on("poll_answer", async (ctx) => {
//   const answerText = pollOptions[ctx.update.poll_answer.option_ids[0]];  
//   console.log("================AGROFOREST_DAO====================");
//   console.log("Pergunta: ", question);
//   console.log("Resposta:", answerText);
//   console.log("Telegram username: ", ctx.update.poll_answer.user.username);
//   console.log("Telegram Chat ID:", CHAT_ID);
//   console.log("User ID: ", ctx.update.poll_answer.user.id);
//   console.log("================TELEGRAM BOT=================");
// });

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
