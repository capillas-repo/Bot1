require('dotenv').config({ path: `${__dirname}/../.env` });
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

if (process.env.DATABASE === 'dialogflow') {



  const KEYFILEPATH = path.join(`${__dirname}/../chatbot-account.json`);
  const SCOPES = ['https://www.googleapis.com/auth/drive'];

  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });

  const drive = google.drive({
    version: 'v3',
    auth,
  });

  const uploadSingleFile = async (fileName, filePath) => {
    const folderId = process.env.GDRIVE_FOLDER_ID;
    const { data: { id, name } = {} } = await drive.files.create({
      resource: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType: 'image/jpg',
        body: fs.createReadStream(filePath),
      },
      fields: 'id,name',
    });
    generatePublicUrl(id).then(() => {
      console.log(`Se generó enlace https://drive.google.com/open?id=${id} para el archivo ${name}`);
    });
    return `https://drive.google.com/open?id=${id}`
  };

  const scanFolderForFiles = async (folderPath) => {
    const folder = await fs.promises.opendir(folderPath);
    for await (const dirent of folder) {
      if (dirent.isFile() && dirent.name.endsWith('.jpeg')) {
        await uploadSingleFile(dirent.name, path.join(folderPath, dirent.name));
        await fs.promises.rm(filePath);
      }
    }
  };

  async function generatePublicUrl(id) {
    try {
      const fileId = id;
      await drive.permissions.create({
        fileId: fileId,
        supportsAllDrives: true,
        requestBody: {
          role: 'reader',
          type: 'domain', 
          domain: 'gserviceaccount.com', 
          allowFileDiscovery: false,
        },
      });

    
      const result = await drive.files.get({
        fileId: fileId,
        fields: 'webViewLink, webContentLink',
      });
      console.log(result.data);
    } catch (error) {
   
      console.error = () => { }; 
    }
  }

  module.exports = { uploadSingleFile, scanFolderForFiles }

} else {
  console.log(``);
}
