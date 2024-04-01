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

async function saveProofToFirestore(ctx, title, description, publicUrl) {
 // Extrai o nome de usuário do Telegram
 const username = ctx.from.username;

 // Cria um novo documento na coleção 'proof-of-sucessions' com o título, descrição, URL da imagem e nome de usuário
 const docRef = firestore.collection("proof-of-sucessions").doc();
 await docRef.set({
    title: title,
    description: description,
    imgURL: publicUrl,
    telegramUsername: username,
   //  telegramId: telegramId,
    createdAt: new Date()
 });
}

module.exports = { firestore, saveProofToFirestore, uploadImageToFirestore };
