const DHT = require('hyperdht');

const PORT = process.env.BOOTSTRAP_PORT || 8080;
const HOST = process.env.BOOTSTRAP_HOST || "127.0.0.1";

const mainFunction = async ()=>{
    DHT.bootstrapper(PORT, HOST);

    console.log(`Bootstraper running on ${HOST}:${PORT}`)
}

mainFunction();
