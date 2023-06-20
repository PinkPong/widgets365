const fs = require('fs');
const formidable = require('formidable');
const readline = require('readline');
const { Transform } = require('stream');
const axios = require('axios');

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
    this.push(JSON.stringify(this.logExcerpt.join('\n')));
    callback();
  }
};


// Helper function to calculate mean
const calculateMean = (array) => {
  return array.reduce((acc, val) => acc + val, 0) / array.length;
}

// Helper function to calculate standard deviation
const calculateSD = (array) => {
  let mean = calculateMean(array);
  let squareDiffs = array.map(val => (val - mean) ** 2);
  let meanSquareDiff = calculateMean(squareDiffs);
  return Math.sqrt(meanSquareDiff);
}

// Helper function to check if a string is a valid date
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}


class LogProcessor extends Transform {
  constructor(options) {
      super(options);
      this.references = null;
      this.sensorValueTypes = {
        'thermometer': 'decimal',
        'humidity': 'decimal',
        'monoxide': 'integer'
      };
      this.records = {};
      this.hasErrors = false;
      this.currentSensor = null;
  }

  _transform(chunk, encoding, callback) {
      let records = chunk.toString().toLowerCase().split('\n');
      for (let rec of records) {
          if (rec !== '') {            
            const parts = rec.split(' ');
            // we are looking for the reference values only once
            if (!this.references && parts[0] === 'reference') {
              if (parts.length < 4) {
                this.hasErrors = true;
              }
              // Set reference values
              this.references = { 
                thermometer: parseFloat(parts[1] || 0),
                humidity: parseFloat(parts[2] || 0),
                monoxide: parseInt(parts[3] || 0) 
              };
            } else {
              if (parts.length < 2) {
                this.hasErrors = true;
              }
              // if valid sensor type
              if (this.sensorValueTypes[parts[0]]) {
                // Set current sensor
                this.currentSensor = { 
                  type: parts[0], 
                  name: parts[1] || 'unknown' 
                };
                this.records[this.currentSensor.name] = this.records[this.currentSensor.name] || { readings: [], type: this.currentSensor.type };
              } else {
                if (parts[1] && isValidDate(parts[0])) {
                  // Push sensor reading to data array
                  const value = this.sensorValueTypes[this.currentSensor.type] === 'integer' ? parseInt(parts[1]) : parseFloat(parts[1]);
                  if (isNaN(value)) {
                    this.hasErrors = true;
                    this.records[this.currentSensor.name].readings.push(0);
                  } else {
                    this.records[this.currentSensor.name].readings.push(value);                  
                  }
                }
              }
            }
          }
      }
      callback();
  }

  _flush(callback) {
      let results = { hasErrors: this.hasErrors };
      for (let sensor in this.records) {
          const readings = this.records[sensor].readings;
          const sensorType = this.records[sensor].type;

          switch (sensorType) {
              case 'thermometer':
                  const mean = calculateMean(readings);
                  const sd = calculateSD(readings);
                  if (Math.abs(mean - this.references.thermometer) <= 0.5 && sd < 3) {
                      results[sensor] = 'ultra precise';
                  } else if (Math.abs(mean - this.references.thermometer) <= 0.5 && sd < 5) {
                      results[sensor] = 'very precise';
                  } else {
                      results[sensor] = 'precise';
                  }
                  break;
              case 'humidity':
                  if (readings.every(reading => Math.abs(reading - this.references.humidity) <= 1)) {
                      results[sensor] = 'keep';
                  } else {
                      results[sensor] = 'discard';
                  }
                  break;
              case 'monoxide':
                  if (readings.every(reading => Math.abs(reading - this.references.monoxide) <= 3)) {
                      results[sensor] = 'keep';
                  } else {
                      results[sensor] = 'discard';
                  }
                  break;
          }
      }
      this.push(JSON.stringify(results));
      callback();
  }
};

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'POST') {
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

                // Transformation stream to process and classify the data
                // Use the transform stream to process a log file
                const reader = readline.createInterface({
                  input: fs.createReadStream(filePath),
                  output: new LogProcessor(),
                  console: false
                });

                reader.on('line', (line) => {
                  reader.output.write(line + '\n');
                });

                reader.on('close', () => {
                  reader.output.end();
                });

                reader.output.on('data', (data) => {
                  const { hasErrors } = JSON.parse(data.toString());
                  if (hasErrors) { 
                    try {
                      const logReader = readline.createInterface({
                        input: fs.createReadStream(filePath),
                        output: new LogFileReader({ maxLines: 50 }),
                        console: false
                      });
                
                      logReader.on('line', (line) => {
                        logReader.output.write(line + '\n');
                      });
                
                      logReader.on('close', () => {
                        logReader.output.end();
                      });
                
                      logReader.output.on('data', async (sampleData) => {
                        const apiHost = process.env.API_HOST ?? 'https://api.openai.com'
                        const apiKey = process.env.OPENAI_KEY
                        const apiUrl = `${apiHost}/v1/chat/completions`;

                        const response = await axios.post(apiUrl, {
                          model:'gpt-3.5-turbo',
                            messages: [
                                {
                                  role: 'system',
                                  content: `you are responsible for incoming logs valiadation. valid log should look like this: ${sample_log}`
                                },
                                {
                                  role: 'user',
                                  content: `if my data is very different respond with "YOU UPLOADED WRONG FILE", otherwise find and list anomalies with my data: ${sampleData.toString()}`
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
                        const detailedResults = choices?.[0]?.message?.content;
                        res.status(200).json({ ...JSON.parse(data.toString()), detailedResults});
                      });
                    }  catch (error) {
                      console.error(error);
                      res.status(500).json({ message: 'Error uploading file' });
                    }
                  }  else {
                    res.status(200).json({ ...JSON.parse(data.toString()) });
                  }
                });
              }
            });
          }
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading file' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
}
