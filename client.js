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

let remainingPeerRequest = 500;

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
        
        await pingMiddleman();

        // peerId = await lineReader("What is the peer id? ");

        // while(pinged && !peerIp){
        //     setTimeout(()=>{
        //         socket.send(JSON.stringify({ event_type : eventTypes.peer, peer : peerId }));
        //     }, 2000);
        // }

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
        socket.send(JSON.stringify({ event_type : "ping", id : myId }), middlemanPort, middlemanIp);
        let timeout = setTimeout(async ()=>{
            if(!pinged){
                console.log("==> Ping middleman again...");
                return await pingMiddleman();
            }

            clearTimeout(timeout);
            resolve(true);
        }, 5000);
    })
}

main();