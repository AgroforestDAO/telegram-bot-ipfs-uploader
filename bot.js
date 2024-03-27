const { Telegraf } = require("telegraf");
const { uploadImageToFirestore, saveProofToFirestore, getSaf } = require("./firestore");
const BOT_TOKEN = process.env.BOT_TOKEN;
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const bot = new Telegraf(BOT_TOKEN);

const userStates = {};

bot.start(async (ctx) => {
  ctx.reply('Bem-vindo! Vamos começar com o título dessa prova de sucessão.');
  // Busca o ID do SAF antes de salvar a prova de sucessão
  const safId = await getSaf(ctx.from.username);
  //console.log("SAF ID: ", safId);
  // Armazena o username no objeto do usuário
  userStates[ctx.from.id] = { 
     stage: 'title',
     username: ctx.from.username,
     safId: safId
  };

  
 });
 
 bot.on('text', async (ctx) => {
  const username = ctx.from.username;
  const userId = ctx.from.id;
  let userState = userStates[userId];
 
  // Verifica se userState existe, caso contrário, inicializa com um estado padrão
  if (!userState) {
     userState = {
       stage: 'start', // Estado inicial para usuários não iniciados
       username: username,
     };
     userStates[userId] = userState;
  }
 
  if (userState.stage === 'title') {
     userState.title = ctx.message.text;
     ctx.reply(`Ótimo! ${username} Agora, escreva a descrição para essa prova de sucessão.`);
     userState.stage = 'description';
  } else if (userState.stage === 'description') {
     userState.description = ctx.message.text;
     ctx.reply('Perfeito! Agora, envie a foto.');
     userState.stage = 'photo';
  }
 });
  
 bot.on('photo', async (ctx) => {
 const userId = ctx.from.id;
 const userState = userStates[userId]; 
    
 if (userState.stage === 'photo') {     
     
      // Aqui, você deve usar userState.safId em vez de safId
      //console.log("Saf ID:", userState.safId);
      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      ctx.reply('Aguarde enquanto salvamos a sua prova de sucessão...');
      const imgURL = await processPhoto(ctx, photo);
      await saveProofToFirestore(ctx, userState.title, userState.description, imgURL, userState.safId[0].id);
      ctx.reply('Prova de sucessão salva com sucesso!');
      delete userStates[userId]; // Limpa o estado do usuário após o processamento
 }
});

  async function processPhoto(ctx, photo) {
   const fileLink = await ctx.telegram.getFileLink(photo.file_id);
   const response = await axios.get(fileLink, { responseType: 'stream' });
   const filePath = path.join(__dirname, `temp_${Date.now()}.jpg`);
   const writer = fs.createWriteStream(filePath);
  
   response.data.pipe(writer);
  
   return new Promise((resolve, reject) => {
      writer.on('finish', async () => {
        const imgURL = await uploadImageToFirestore(ctx, {
          name: path.basename(filePath),
          path: filePath,
          mimetype: 'image/jpeg', // Ajuste o tipo MIME conforme necessário
        });
        // Após o upload bem-sucedido, exclua o arquivo temporário
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Erro ao excluir o arquivo temporário:', err);
          } else {
            console.log('Arquivo temporário excluído com sucesso.');
          }
        });
        resolve(imgURL);
      });
  
      writer.on('error', reject);
   });
  }

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
