import fs from 'fs';
import readline from 'readline';
import { Transform } from 'stream';
//import axios from 'axios';

const sample_log = `
reference 70.0 45.0 6
thermometer temp-1
2007-04-05T22:00 72.4
2007-04-05T22:01 76.0
2007-04-05T22:02 79.1
2007-04-05T22:11 67.5
thermometer temp-2
2007-04-05T22:01 69.5
2007-04-05T22:05 69.8
humidity hum-1
2007-04-05T22:04 45.2
2007-04-05T22:06 45.1
humidity hum-2
2007-04-05T22:04 44.4
2007-04-05T22:06 44.9
2007-04-05T22:07 43.8
monoxide mon-1
2007-04-05T22:05 7
2007-04-05T22:06 9
monoxide mon-2
2007-04-05T22:04 2
2007-04-05T22:05 4
2007-04-05T22:08 6`;

class LogFileReader extends Transform {
  constructor(options) {
      super(options);
      this.logExcerpt = [];
      this.maxLines = options.maxLines || 100;
  }

  _transform(chunk, encoding, callback) {
      const lines = chunk.toString().toLowerCase().split('\n').filter(line => line !== '');
      const { length } = this.logExcerpt;
      if ( length < this.maxLines) {
          this.logExcerpt = [...this.logExcerpt, ...lines];
      }
      callback();
  }

  _flush(callback) {
    this.push(JSON.stringify(this.logExcerpt.join('.\n')));
    callback();
  }
};

export default async function handler(req, res) {
  const { method, body } = req;
  const { filePath } = body;
  
  if (method === 'POST') {
    if (!filePath) {
      res.status(400).json({ error: 'No filePath provided' });
      return;
    }

    try {
      const reader = readline.createInterface({
        input: fs.createReadStream(filePath),
        output: new LogFileReader({ maxLines: 50 }),
        console: false
      });

      reader.on('line', (line) => {
        reader.output.write(line + '\n');
      });

      reader.on('close', () => {
        reader.output.end();
      });

      reader.output.on('data', async (data) => {
        console.log('------ reader.output.on.data', data.toString());
        //res.status(200).json({ filePath, ...JSON.parse(data.toString()) });
      
/*
        const apiHost = process.env.API_HOST ?? 'https://api.openai.com'
        const apiKey = process.env.OPENAI_KEY
        const apiUrl = `${apiHost}/v1/chat/completions`;
        console.info('--!!!!!!!!!--',role, prompt)
        const response = await axios.post(apiUrl, {
          model:'gpt-3.5-turbo',
            messages: [
                {
                  role,
                  content: prompt,
                },
              ],
              temperature: 0.2
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                }
            },
        );
        const { data: { choices } } = response;
        console.info(response);
        */
        res.status(200).json({file: data.toString(), sample: sample_log});
      });
      
    } catch (error) {
      console.info('ERRRROR')
      console.error('Error fetching chat response!!!!!!', error);
      res.status(500).json({ error: 'Failed to chat' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};
