const stun = require('node-stun');
const client = stun.createClient();

client.start(19302, 'stun.l.google.com', () => {
    console.log('STUN client started');
});

client.on('bindingResponse', (res) => {
    const xorMappedAddress = res.getXorMappedAddress();
    if (xorMappedAddress) {
        console.log('Public Address:', xorMappedAddress.address);
        console.log('Public Port:', xorMappedAddress.port);
    } else {
        console.log('Failed to retrieve NAT type');
    }
    client.close();
});
