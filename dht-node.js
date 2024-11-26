const DHT = require('hyperdht');
const readline = require('node:readline');

const bootstrapServer = process.env.BOOTSTRAP_SERVER || "127.0.0.1:8080";

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

const mainFunction = async ()=>{
    const node = new DHT({ bootstrap : [bootstrapServer] });
    
    const keyPair = DHT.keyPair();
    
    const server = node.createServer();
    await server.listen(keyPair);

    const address = server.address();
    const publicKey = address.publicKey.toString('hex');

    server.on("connection", (socket)=>{
        let peerPublicKey = socket.remotePublicKey.toString('hex');
        console.log(`===> New connection from ${peerPublicKey}`);

        socket.on("message", (message)=>{
            console.log(`===> New message "${message}" from ${peerPublicKey}`);
        })
    })

    // server.on("listening", ()=>{
        console.log(`===> Listening with public key ${publicKey} on ${address.host}:${address.port}`);

        setTimeout(async ()=>{
            const peerKey = await lineReader("What is the peer id? ");
        
            const peerSocket = node.connect(peerKey);
            
            setTimeout(()=>{
                const sendMessage = async ()=>{
                    const message = await lineReader("Enter message: ");
    
                    await peerSocket.send(Buffer.from(message));
    
                    sendMessage();
                }
    
                sendMessage();
            }, 2000)

            // peerSocket.on("connection", (anything)=>{
            //     console.log(anything);
            //     console.log(`==> Successfully connected to ${peerKey}`);
            // })

        }, 3000);
    // });

    server.on('close', ()=>{
        console.log(`===> Server closed.`)
    });
}

mainFunction();