const dgram = require('node:dgram');
const server = dgram.createSocket('udp4');

const liveClients = {

}

const eventTypes = {
    ping : "ping",
    peer : "peer"
}

const saveNewConnection = (data)=>{
    let id = data?.id;
    if(id){
        liveClients[id] = {
            ip : data.address,
            port : data.port
        }
        server.send(JSON.stringify(
            { ok : true, message : "Connection saved" },
        ), data.port, data.address);
    }

    console.log(liveClients);
}

const eventHandler = (data)=>{
    switch(data.event_type){
        case eventTypes.ping:
            saveNewConnection(data);
        case eventTypes.peer:
            console.log(data);
            let searchPeer = liveClients[data.peer];

            if(searchPeer){
                server.send(JSON.stringify(
                    { ok : true, message : "Peer Details", body : { id : data.peer, ...searchPeer } }
                ), data.port, data.ip);
            }
        default:
            return;
    }
}

server.on('error', (err) => {
    console.error(`server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    msg = msg.toString();
    try {
        msg = JSON.parse(msg);
    } catch (error) {
        console.log(error);
    }
    eventHandler({...msg, ...rinfo});
});

server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(41234);
// Prints: server listening 0.0.0.0:41234