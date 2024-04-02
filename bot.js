require('dotenv').config();
const { Telegraf } = require("telegraf");
const { handleStart, handleText, handlePhoto } = require("./botInteractions");
const BOT_TOKEN = process.env.BOT_TOKEN; // Acessando o BOT_TOKEN diretamente do ambiente
const bot = new Telegraf(BOT_TOKEN);

bot.start(handleStart);
bot.on("text", handleText);
bot.on("photo", handlePhoto);

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
