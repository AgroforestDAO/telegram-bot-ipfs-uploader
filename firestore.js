// firestore.js
const { Firestore } = require("@google-cloud/firestore");
const { Storage } = require("@google-cloud/storage");
const storage = new Storage();
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const KEYPATH = process.env.KEY_PATH;

// Inicialize o Firestore
const firestore = new Firestore({
  projectId: PROJECT_ID, // Substitua pelo seu ID de projeto
  keyFilename: KEYPATH,
});

async function uploadImageToFirestore(ctx, photo) {
  const bucketName = "agroforestdao";
  const fileName = `proof-of-sucession/${photo.name}`;
  const options = {
    destination: fileName,
    public: true,
    metadata: {
      contentType: photo.mimetype,
    },
  };

  // Certifique-se de que o bucket existe e está configurado corretamente
  const bucket = storage.bucket(bucketName);
  const [file] = await bucket.upload(photo.path, options);
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
  return publicUrl;
}

async function saveProofToFirestore(ctx, title, description, publicUrl, safId, telegramId, safName, mentorName, safType, local, createdByName, createdByEmail) {
  // Extrai o nome de usuário do Telegram
  const username = ctx.from.username;

  // Cria um novo documento na coleção 'proof-of-sucessions' com o título, descrição, URL da imagem e nome de usuário
  const docRef = firestore.collection("proof-of-sucessions").doc();
  await docRef.set({
    title: title,
    description: description,
    imgURL: `https://cloudflare-ipfs.com/ipfs/${publicUrl}`,
    telegramUsername: username,
    telegramUserId: telegramId,
    safName:safName,
    mentorName: mentorName,
    safType: safType,
    local: local,
    createdByName: createdByName,
    createdByEmail: createdByEmail,
    safId: safId,
    createdAt: new Date(),
  });
}

// Função para buscar documentos na coleção 'safs' onde 'guardianTelegram' é igual ao telegramUsername do usuário
async function getSaf(telegramUsername) {
  try {
    const snapshot = await firestore
      .collection("safs")
      .where("guardianTelegram", "==", telegramUsername)
      .get();
    const safs = [];
    snapshot.forEach((doc) => {
      // Adiciona cada documento à lista de safs
      safs.push({ id: doc.id, ...doc.data() });
    });
    //console.log(`Documentos encontrados na coleção "safs" para o usuário ${telegramUsername}:`, safs);
    return safs;
  } catch (error) {
    console.error('Erro ao buscar documentos na coleção "safs":', error);
    return null;
  }
}

async function getAllSafs() {
  try {
    const snapshot = await firestore.collection("safs").get();
    const safs = [];
    snapshot.forEach((doc) => {
      // Adiciona cada documento à lista de safs
      safs.push({ id: doc.id, safName: doc.data.safName, ...doc.data() });
    });
    return safs;
  } catch (error) {
    console.error(
      'Erro ao buscar todos os documentos na coleção "safs":',
      error
    );
    return null;
  }
}

module.exports = { saveProofToFirestore, uploadImageToFirestore, getSaf, getAllSafs };
