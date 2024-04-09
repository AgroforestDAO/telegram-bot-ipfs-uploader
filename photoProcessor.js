// photoProcessor.js
//const { uploadImageToFirestore } = require("./firestore");

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const uploadToIPFS = require('./ipfsUploader');

const apiKey = process.env.PINATA_API_KEY;
const secretApiKey = process.env.PINATA_SECRET_API_KEY;


async function processPhoto(ctx, photo) {
 const fileLink = await ctx.telegram.getFileLink(photo.file_id);
 const response = await axios.get(fileLink, { responseType: 'stream' });
 const filePath = path.join(__dirname, `img${Date.now()}.jpg`);
 const writer = fs.createWriteStream(filePath);


 return new Promise((resolve, reject) => {
    response.data.pipe(writer);

    writer.on('finish', async () => {
      await uploadToIPFS(filePath, apiKey, secretApiKey)
      .then(hash => {         
          resolve({ ipfsHash: hash });
      })
      .catch(error => {
          console.error('Erro ao fazer upload para o IPFS:', error.message);
      });

      // const firestoreURL = await uploadImageToFirestore(ctx, {
      //   name: path.basename(filePath),
      //   path: filePath,
      //   mimetype: 'image/jpeg',
      // });
      // console.log('URL da imagem no Firestore:', firestoreURL);
      
      fs.unlink(filePath, (err) => {
        if (err) console.error('Erro ao excluir o arquivo temporário:', err);
        else console.log('Arquivo temporário excluído com sucesso.');
      });
      // resolve({ ipfsHash,
      //    //firestoreURL
      //    });
    });

    writer.on('error', reject);
 });
}

module.exports = processPhoto;
