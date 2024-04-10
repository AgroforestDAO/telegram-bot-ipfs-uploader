// ipfsUploader.js
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function uploadToIPFS(filePath, apiKey, secretApiKey) {
    // Criar um objeto FormData e adicionar o arquivo
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    // Configurar os headers para a solicitação
    const headers = formData.getHeaders();
    headers['pinata_api_key'] = apiKey;
    headers['pinata_secret_api_key'] = secretApiKey;

    try {
        // Fazer uma solicitação POST para a API do Pinata
        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            headers: headers
        });

        // Verificar se a solicitação foi bem-sucedida
        if (response.status === 200) {
            console.log('IPFS Upload concluído! - IPFS CID:', response.data.IpfsHash);
            return response.data.IpfsHash;
        } else {
            console.error('Falha no upload:', response.data);
            throw new Error('Falha no upload para o IPFS');
        }
    } catch (error) {
        console.error('Erro na solicitação:', error.message);
        throw error;
    }
}

module.exports = uploadToIPFS;