/**

 json-server/index.js - Copyright 2023 Harshad Joshi and Bufferstack.IO Analytics Technology LLP, Pune

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

const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
    const numCPUs = os.cpus().length;
    console.log(`Master process ${process.pid} is running`);
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died. Starting a new worker...`);
        cluster.fork();
    });
} else {
    const express = require('express');
    const app = express();
    app.use(express.json({ limit: '50mb' }));

    app.post('/', async (req, res) => {
        // Parse the incoming JSON data.
        const data = req.body;

        // Log the data to the console.
        console.log(JSON.stringify(data, null, 2) + "\n");

        res.status(200).send('Data received successfully');
    });

    app.listen(8484, () => {
        console.log(`Server is running on port 8484 and worker ${process.pid} is listening...`);
    });
}

