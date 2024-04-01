// photoProcessor.js

const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function processPhoto(ctx, photo) {
 const fileLink = await ctx.telegram.getFileLink(photo.file_id);
 const response = await axios.get(fileLink, { responseType: 'stream' });
 const filePath = path.join(__dirname, `temp_${Date.now()}.jpg`);
 const writer = fs.createWriteStream(filePath);

 return new Promise((resolve, reject) => {
    response.data.pipe(writer);

    writer.on('finish', async () => {
      const imgURL = await uploadImageToFirestore(ctx, {
        name: path.basename(filePath),
        path: filePath,
        mimetype: 'image/jpeg',
      });
      fs.unlink(filePath, (err) => {
        if (err) console.error('Erro ao excluir o arquivo temporário:', err);
        else console.log('Arquivo temporário excluído com sucesso.');
      });
      resolve(imgURL);
    });

    writer.on('error', reject);
 });
}

module.exports = processPhoto;
