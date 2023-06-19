import fs from 'fs';
import formidable from 'formidable';
import readline from 'readline';
import { Transform } from 'stream';

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
      //console.info('------ _transform', chunk.toString(), lines);
      for (let rec of records) {
          //console.info('---- line', rec);
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
      console.info('-- _transform cb', JSON.stringify(callback));
      callback();
  }

  _flush(callback) {
    console.info('------ _flush', this.data, this.references);
      let results = { hasErrors: this.hasErrors };
      for (let sensor in this.records) {
          const readings = this.records[sensor].readings;
          const sensorType = this.records[sensor].type;

          console.info('------ _flush', sensor, sensorType, readings);
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
      console.info('-- _flash cb', callback);
      callback();
  }
};

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

                // Transformation stream to process and classify the data
                // Use the transform stream to process a log file
                const reader = readline.createInterface({
                  input: fs.createReadStream(filePath),
                  output: new LogProcessor(),
                  console: false
                });

                reader.on('line', (line) => {
                  //console.info('------ on line', line);
                  reader.output.write(line + '\n');
                });

                reader.on('close', () => {
                  //console.info('------ on close');
                  reader.output.end();
                });

                reader.output.on('data', (data) => {
                  console.log('------ reader.output.on.data', data.toString());
                  res.status(200).json({ filePath, ...JSON.parse(data.toString()) });
                });

                //res.status(200).json({ message: 'File uploaded successfully' });
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
