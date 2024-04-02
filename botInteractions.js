// botInteractions.js
const { getUserState, setUserState, resetUserState } = require("./userStateManager");
const { getSafState, setSafState } = require("./safStateManager");
const processPhoto = require("./photoProcessor");
const { saveProofToFirestore, getAllSafs } = require("./firestore");
const Markup = require('telegraf/markup')

async function handleStart(ctx) {
  try {
    ctx.reply('Bem-vindo! Vamos começar selecionando o SAF.'); 
        
    const safs = await getAllSafs(); // Busca todos os SAFs
    //console.log("Safs: ", safs); 
    
    const userState = {
      stage: 'welcome',
      username: ctx.from.username, 
      telegramId: ctx.from.id,
    }; 
    setUserState(ctx.from.id, userState);
    await selectSafs(safs, ctx);
    
    } catch (error) {
    console.error('Erro na inicialização:', error);
  }
}

// Função para buscar todos os SAFs e criar uma enquete
async function selectSafs(safs, ctx) {
   try {
      const options = safs.map(saf => saf.safName);
      setSafState(options);
      const question = "Para qual SAF você vai enviar a Prova de Sucessão?"; 
      
      ctx.reply(question, Markup
        .keyboard(options)
        .oneTime()
      )      
   } catch (error) {
      console.error('Erro ao buscar SAFs ou criar enquete:', error);
      ctx.reply('Desculpe, ocorreu um erro ao buscar os SAFs.');
   }
}

// Funções para lidar com cada estágio
async function handleWelcome(ctx, userState, safs) {
  const selectedSaf = safs.find(saf => saf.safName === ctx.message.text);
  if (selectedSaf) {
      userState.safId = selectedSaf.id;
      //console.log(`O usuário selecionou o SAF com ID: ${userState.safId}`);
  }  
  userState.stage = 'title';
  setUserState(ctx.from.id, userState);
  ctx.reply(`Ótimo! ${userState.username} Escreva o TÍTULO para essa prova de sucessão.`);
}

async function handleTitle(ctx, userState) {
  if(userState.stage === 'title'){
    userState.title = ctx.message.text;
    ctx.reply(`Ótimo! ${userState.username} Agora, escreva a descrição para essa prova de sucessão.`);
    userState.stage = 'description';
    setUserState(ctx.from.id, userState);
  }
}

async function handleDescription(ctx, userState) {
    userState.description = ctx.message.text;
    userState.stage = 'photo';
    setUserState(ctx.from.id, userState);
    ctx.reply('Perfeito! Agora, envie a foto.');
}

// Função handleText refatorada
async function handleText(ctx) {
    const userState = getUserState(ctx.from.id);
    const safs = await getAllSafs(); // Busca todos os SAFs
    if (userState.stage === 'welcome') {
        await handleWelcome(ctx, userState, safs);
    } else if (userState.stage === 'title') {
        await handleTitle(ctx, userState);
    } else if (userState.stage === 'description') {
        await handleDescription(ctx, userState);
    }
}

async function handlePhoto(ctx) {
 const userState = getUserState(ctx.from.id);
 if (userState.stage === 'photo') {
    ctx.reply('Aguarde enquanto salvamos a sua prova de sucessão...');
    const safId = userState.safId;
    const telegramId = userState.telegramId;
    const title = userState.title;
    const description = userState.description;
    const publicURL = await processPhoto(ctx, ctx.message.photo[ctx.message.photo.length - 1]);
    await saveProofToFirestore(ctx, title, description, publicURL, safId, telegramId,);

    ctx.reply('Prova de sucessão salva com sucesso!');
    resetUserState(ctx.from.id);
 }
 
} 

module.exports = { handleStart, handleText, handlePhoto };