import formidable from 'formidable';
import fs from 'fs';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        const form = formidable({ multiples: false });
        form.parse(req, (error, fields, files) => {
          if (error) {
            console.error(error);
            res.status(500).json({ message: 'Error uploading file' });
          } else {
            const { originalFilename, filepath: path } = files.file;
            const filePath = `/tmp/${originalFilename}`;

            fs.rename(path, filePath, (error) => {
              if (error) {
                console.error(error);
                res.status(500).json({ message: 'Error uploading file' });
              } else {
                console.log(`File saved to ${filePath}`);
                res.status(200).json({ message: 'File uploaded successfully' });
              }
            });
          }
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading file' });
      }
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
