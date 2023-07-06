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

