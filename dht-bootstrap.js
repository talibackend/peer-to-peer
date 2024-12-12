// const DHT = require('hyperdht');
const DHT = require('dht-rpc');

const PORT = process.env.BOOTSTRAP_PORT || 8080;
const HOST = process.env.BOOTSTRAP_HOST || "127.0.0.1";

const mainFunction = async ()=>{
    const node = DHT.bootstrapper(PORT, HOST);
    // console.log(node.host)
    // console.log(node.port)
    console.log(`Bootstraper running on ${HOST}:${PORT}`)

    node.on("request", (req)=>{
        console.log("===>New Request<===");
        console.log("Target: " + Buffer.from(req.target).toString("hex"));
        console.log("Command: " + req.command);
        console.log("Value: " + req.value);
        console.log("Token: " + req.token);
        console.log("From: " + JSON.stringify(req.from));
        console.log("===>End of Request<===");
    })
}

mainFunction();
