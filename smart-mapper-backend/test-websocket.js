const { io } = require('socket.io-client');

const socket = io('http://localhost:3000');

console.log('Connecting to WebSocket server...\n');

// Connection events
socket.on('connect', () => {
  console.log('✅ Connected to server');
  console.log(`   Socket ID: ${socket.id}\n`);
});

socket.on('connected', (data) => {
  console.log('📡 Server welcome message:');
  console.log(`   Client ID: ${data.clientId}`);
  console.log(`   Status: ${data.status}`);
  console.log(`   Timestamp: ${new Date(data.timestamp).toLocaleString()}\n`);
});

// Robot status
socket.on('robotStatus', (data) => {
  console.log(`🤖 Robot Status: ${data.connected ? 'Connected' : 'Disconnected'}`);
});

// Sensor data
socket.on('sensor', (data) => {
  console.log('📊 Sensor Data:');
  console.log(`   Distance: ${data.ultrasonic.distance}cm`);
  console.log(`   Angle: ${data.ultrasonic.angle}°`);
  console.log(`   Position: (${data.position.x}, ${data.position.y})`);
});

// Map data
let mapCount = 0;
socket.on('map', (data) => {
  mapCount++;
  if (mapCount === 1 || mapCount % 25 === 0) {
    console.log(`🗺️  Map update #${mapCount} received`);
  }
});

// Mapping events
socket.on('mappingStarted', (data) => {
  console.log(`✅ Mapping started - Session ID: ${data.sessionId}`);
});

socket.on('mappingStopped', (data) => {
  console.log(`⏹️  Mapping stopped - Map ID: ${data.mapId}`);
});

// Error handling
socket.on('error', (data) => {
  console.log(`❌ Error: ${data.message}`);
});

socket.on('connect_error', (error) => {
  console.log(`❌ Connection error: ${error.message}`);
});

socket.on('disconnect', (reason) => {
  console.log(`\n🔌 Disconnected: ${reason}`);
});

// Interactive commands
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n--- Commands ---');
console.log('1: Start mapping');
console.log('2: Stop mapping');
console.log('3: Send control (forward)');
console.log('4: Send control (stop/brake)');
console.log('5: Request stream');
console.log('6: Calibrate');
console.log('q: Quit\n');

rl.on('line', (input) => {
  switch (input.trim()) {
    case '1':
      socket.emit('startMapping');
      console.log('→ Sent: startMapping');
      break;
    case '2':
      socket.emit('stopMapping');
      console.log('→ Sent: stopMapping');
      break;
    case '3':
      socket.emit('control', { steering: 0, throttle: 50, brake: false });
      console.log('→ Sent: control (forward, 50% throttle)');
      break;
    case '4':
      socket.emit('control', { steering: 0, throttle: 0, brake: true });
      console.log('→ Sent: control (brake)');
      break;
    case '5':
      socket.emit('requestStream');
      console.log('→ Sent: requestStream');
      break;
    case '6':
      socket.emit('calibrate');
      console.log('→ Sent: calibrate');
      break;
    case 'q':
      console.log('Closing connection...');
      socket.close();
      process.exit(0);
      break;
    default:
      console.log('Unknown command');
  }
});
