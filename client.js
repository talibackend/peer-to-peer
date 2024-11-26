const readline = require('node:readline');
const dgram = require('node:dgram');
const socket = dgram.createSocket('udp4');

const eventTypes = {
    ping : "ping",
    peer : "peer"
}

let pinged = false;

let bindPort;
let myId;
let middlemanIp;
let middlemanPort;

// Peer Information
let peerId;
let peerIp;
let peerPort;

let remainingPingRequest = 500;

const lineReader = async (question) =>{
    return await new Promise((resolve, reject)=>{
        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question(question, (answer)=>{
            resolve(answer);
            rl.close();
        });
    })
}

const main = async ()=>{
    try{

        socket.on('message', (msg, rinfo)=>{
            msg = msg.toString();
            console.log(`==> Received ${msg} from ${rinfo.address}:${rinfo.port}`);
            processMessage(msg, rinfo);
        })

        myId = await lineReader("What is your id? ");
        bindPort = await lineReader("What port should I bind this client to? ");
        middlemanIp = await lineReader("What is the middleman ip address? ");
        middlemanPort = await lineReader("What is the middleman port? ");
        console.log(`===> Connecting to middleman @${middlemanIp}:${middlemanPort}`);

        socket.bind(bindPort);
        
        let pingResponse = await pingMiddleman();
        console.log(pingResponse);

        peerId = await lineReader("What is the peer id? ");

        let peerResponse = await getPeerFromMiddleman();
        console.log(peerResponse);

        setInterval(async ()=>{
            await pingMiddleman();
            await getPeerFromMiddleman;
        }, 60 * 1000);

        await sendMessageToPeer();

    }catch(error){
        console.log(error);
    }
}

const processMessage = (msg, rinfo)=>{
    try{
        msg = JSON.parse(msg);
        let remoteIp = rinfo.address;
        let remotePort = rinfo.port;

        if(msg.event_type && msg.ok){
            switch (msg.event_type) {
                case eventTypes.ping:
                    pinged = true;
                    break;
                case eventTypes.peer:
                    peerIp = msg.body.ip;
                    peerPort = msg.body.port;
                    break;
                default:
                    break;
            }
        }

    }catch(error){
        console.log(error);
    }
}

const pingMiddleman = async ()=>{
    return await new Promise((resolve, reject)=>{
        if(remainingPingRequest < 0){
            reject("Failed to ping middleman server.");
        }
        socket.send(JSON.stringify({ event_type : "ping", id : myId }), middlemanPort, middlemanIp);
        let timeout = setTimeout(async ()=>{
            if(!pinged){
                console.log("==> Ping middleman again...");
                remainingPingRequest -= 1;
                return await pingMiddleman();
            }

            remainingPingRequest = 500;
            resolve(true);
            clearTimeout(timeout);
        }, 5000);
    })
}

const getPeerFromMiddleman = async ()=>{
    return await new Promise((resolve, reject)=>{
        socket.send(JSON.stringify({ event_type : "peer", peer : peerId }), middlemanPort, middlemanIp);
        
        let timeout = setTimeout(async ()=>{
            if(!peerPort || !peerIp){
                console.log("==> Trying to get peer details again...");
                return await getPeerFromMiddleman();
            }

            clearTimeout(timeout);

            for(let i = 0; i < 10; i++){
                socket.send(JSON.stringify({ event_type : "peer_message", peer : myId, message : "Let's talk" }), peerPort, peerIp);
            }

            resolve(true);
        }, 2000);
    })
}

const sendMessageToPeer = async ()=>{
    let message = await lineReader(`Enter message to send to user ${peerId}: `);
    socket.send(JSON.stringify({ event_type : "peer_message", peer : myId, message }), peerPort, peerIp);

    setTimeout(async ()=>{
        return await sendMessageToPeer();
    }, 1000);
}

main();

module.exports = {
    lineReader
}