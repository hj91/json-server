/**

 json-server/consumer.js - Copyright 2023 Harshad Joshi and Bufferstack.IO Analytics Technology LLP, Pune

 Licensed under the GNU General Public License, Version 3.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 https://www.gnu.org/licenses/gpl-3.0.html

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 **/


const amqp = require('amqplib/callback_api');

const RABBITMQ_SERVER = 'amqp://localhost';
const QUEUE_NAME = 'json_data_queue';

// Connect to RabbitMQ server
amqp.connect(RABBITMQ_SERVER, function(error0, connection) {
    if (error0) throw error0;

    // Create a channel
    connection.createChannel(function(error1, channel) {
        if (error1) throw error1;

        // Assert the queue
        channel.assertQueue(QUEUE_NAME, { durable: false });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", QUEUE_NAME);

        // Consume messages from the queue
        channel.consume(QUEUE_NAME, function(msg) {
            // Parse the JSON string into an object
            let data = JSON.parse(msg.content.toString());

            // Check if "payload" key exists in the data and it is an array
            if ('payload' in data && Array.isArray(data.payload)) {
                // Reference the first element of "payload" array
                let payload = data.payload[0];

                // Check if "name" and "values" keys exist in the payload
                if ('name' in payload && 'values' in payload) {
                    // Extract "x", "y", "z", "qx", "qy", "qz" keys from "values" object
                    let { x, y, z, qx, qy, qz } = payload.values;

                    // Prepare the new JSON object based on presence of x,y,z or qx,qy,qz
                    let output = {
                        name: payload.name,
                        values: x !== undefined && y !== undefined && z !== undefined ? { x, y, z } : { qx, qy, qz }
                    }

                    console.log(JSON.stringify(output, null, 2));
                }
            }
        }, { noAck: true });
    });
});

// Todo - add more elaborate error handling and influxdb data logging here itself
