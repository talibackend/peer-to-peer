const dgram = require('dgram');
const server = dgram.createSocket('udp4');

const ROUTER_IP = '192.168.1.1'; // Router public IP
const DEVICE_IP = '192.168.1.160'; // Private IP of the target device
const PUBLIC_PORT = 8080;    // Public port on the router
const PRIVATE_PORT = 8080;   // Private port on your device
const PCP_LIFETIME = 3600;   // Port mapping lifetime in seconds (1 hour)

// Build the PCP request packet
function buildPCPRequest() {
  const buffer = Buffer.alloc(24);
  buffer.writeUInt8(2, 0); // PCP version 2
  buffer.writeUInt8(1, 1); // Opcode 1 for MAP request
  buffer.writeUInt32BE(PCP_LIFETIME, 4); // Lifetime in seconds

  // Map your public and private IP addresses
  const publicIpParts = ROUTER_IP.split('.').map(Number);
  const privateIpParts = DEVICE_IP.split('.').map(Number);

  // Fill in the source IP address (can be 0.0.0.0 or your internal IP)
  buffer.writeUInt8(0, 8);
  buffer.writeUInt8(0, 9);
  buffer.writeUInt8(0, 10);
  buffer.writeUInt8(0, 11);

  // Fill in the public IP address (router’s IP)
  buffer.writeUInt8(publicIpParts[0], 16);
  buffer.writeUInt8(publicIpParts[1], 17);
  buffer.writeUInt8(publicIpParts[2], 18);
  buffer.writeUInt8(publicIpParts[3], 19);

  // Fill in the public and private ports
  buffer.writeUInt16BE(PUBLIC_PORT, 20); // Public Port on router
  buffer.writeUInt16BE(PRIVATE_PORT, 22); // Private Port on your device

  return buffer;
}

// Send the PCP request
function sendPCPRequest() {
  const message = buildPCPRequest();
  server.send(message, 5351, ROUTER_IP, (err) => {
    if (err) {
      console.error('Failed to send PCP request:', err);
    } else {
      console.log(`PCP request sent to ${ROUTER_IP}:5351`);
    }
  });
}

// Listen for responses from the router
server.on('message', (msg, rinfo) => {
  console.log(`Router response from ${rinfo.address}:${rinfo.port}:`);
  console.log(msg);

  // Close the server after receiving the response
  server.close();
});

// Start the process
sendPCPRequest();

// Keep the server open to listen for the response
server.on('close', () => {
  console.log('PCP request process finished.');
});
