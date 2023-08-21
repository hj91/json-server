/**
 * json-server/sensor-data-logger.js - Copyright 2023 Harshad Joshi and Bufferstack.IO Analytics Technology LLP, Pune
 *
 * Licensed under the GNU General Public License, Version 3.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/


const express = require('express');
const Influx = require('influx');

const app = express();
app.use(express.json({ limit: '50mb' }));

// Set up InfluxDB client
const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'sensor_data',
    schema: [
        {
            measurement: 'sensor_data',
            fields: {
                x: Influx.FieldType.FLOAT,
                y: Influx.FieldType.FLOAT,
                z: Influx.FieldType.FLOAT,
                qx: Influx.FieldType.FLOAT,
                qy: Influx.FieldType.FLOAT,
                qz: Influx.FieldType.FLOAT,
                sensor: Influx.FieldType.STRING
            },
            tags: ['host']
        }
    ]
});

// Ensure the database exists
influx.getDatabaseNames()
    .then(names => {
        if (!names.includes('sensor_data')) {
            return influx.createDatabase('sensor_data');
        }
    })
    .catch(err => {
        console.error(`Error creating InfluxDB database: ${err.stack}`);
    });

app.post('/', async (req, res) => {
    // Parse the incoming JSON data.
    const data = req.body;

    // Check if "payload" key exists in the data and it is an array
    if ('payload' in data && Array.isArray(data.payload)) {
        // Reference the first element of "payload" array
        let payload = data.payload[0];

        // Check if "name" and "values" keys exist in the payload
        if ('name' in payload && 'values' in payload) {
            // Extract "x", "y", "z", "qx", "qy", "qz" keys from "values" object
            let { x, y, z, qx, qy, qz } = payload.values;

            // Check if incoming json has fields like x,y,z,name
            if (x !== undefined && y !== undefined && z !== undefined) {
                // Log data in InfluxDB
                influx.writePoints([
                    {
                        measurement: payload.name,
                        tags: { host: os.hostname() },
                        fields: {
                            x, y, z,
                            sensor: payload.name
                        }
                    }
                ]).catch(err => {
                    console.error(`Error saving data to InfluxDB! ${err.stack}`);
                });
            }

            // Check if incoming json has fields like qx,qy,qz,name
            if (qx !== undefined && qy !== undefined && qz !== undefined) {
                // Log data in InfluxDB
                influx.writePoints([
                    {
                        measurement: payload.name,
                        tags: { host: os.hostname() },
                        fields: {
                            qx, qy, qz,
                            sensor: payload.name
                        }
                    }
                ]).catch(err => {
                    console.error(`Error saving data to InfluxDB! ${err.stack}`);
                });
            }
        }
    }

    res.status(200).send('Data received successfully');
});

app.listen(8484, () => {
    console.log(`Test Server is running on port 8484 is listening...`);
});

// sensor-data-logger.js end
