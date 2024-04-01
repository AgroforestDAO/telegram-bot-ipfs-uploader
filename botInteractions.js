// botInteractions.js


const { getUserState, setUserState, resetUserState } = require("./userStateManager");
//const processPhoto = require("./photoProcessor");
//const { uploadImageToFirestore, saveProofToFirestore, getSaf } = require("./firestore");

async function handleStart(ctx) {
 ctx.reply('Bem-vindo! Vamos começar com o título dessa prova de sucessão.');
 //const safId = await getSaf(ctx.from.username);
 const userState = {
    stage: 'title',
    username: ctx.from.username,
    telegramId: ctx.from.id
    // safId: safId
 };
 setUserState(ctx.from.id, userState);
 console.log(userState);
}

async function handleText(ctx) {
 const userState = getUserState(ctx.from.id);
 if (userState.stage === 'title') {
    userState.title = ctx.message.text;
    ctx.reply(`Ótimo! ${userState.username} Agora, escreva a descrição para essa prova de sucessão.`);
    userState.stage = 'description';
    setUserState(ctx.from.id, userState);
 } else if (userState.stage === 'description') {
    userState.description = ctx.message.text;
    ctx.reply('Perfeito! Agora, envie a foto.');
    userState.stage = 'photo';
    setUserState(ctx.from.id, userState);
 }
}

async function handlePhoto(ctx) {
 const userState = getUserState(ctx.from.id);
 if (userState.stage === 'photo') {
    ctx.reply('Aguarde enquanto salvamos a sua prova de sucessão...');
    //const imgURL = await processPhoto(ctx, ctx.message.photo[ctx.message.photo.length - 1]);
    //await saveProofToFirestore(ctx, userState.telegramId, userState.title, userState.description, imgURL, userState.safId[0].id);
    ctx.reply('Prova de sucessão salva com sucesso!');
    resetUserState(ctx.from.id);
 }
 
}

// Função para buscar todos os SAFs e criar uma enquete
async function handleSafPoll(ctx) {
  try {
     const safs = await getAllSafs(); // Busca todos os SAFs
     const options = safs.map(saf => saf.name); // Cria uma lista de opções com os nomes dos SAFs
 
     // Cria uma enquete com os nomes dos SAFs
     await ctx.replyWithPoll({
       question: 'Escolha um SAF:',
       options: options,
       is_anonymous: false, // Opcional: define se a enquete é anônima
     });
  } catch (error) {
     console.error('Erro ao buscar SAFs ou criar enquete:', error);
     ctx.reply('Desculpe, ocorreu um erro ao buscar os SAFs.');
  }
 }
 
 

module.exports = { handleStart, handleText, handlePhoto };
