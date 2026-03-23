const net = require('net');
const path = require('path');
// Always load env from server/.env, even when this script is executed from workspace root.
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ DATABASE_URL is not defined in .env');
  process.exit(1);
}

function parseConnectionString(connectionString) {
  if (connectionString.startsWith('sqlserver://')) {
    const match = connectionString.match(/^sqlserver:\/\/([^:;]+)(?::(\d+))?/i);

    return {
      host: match?.[1] || 'localhost',
      port: match?.[2] ? parseInt(match[2], 10) : 1433,
    };
  }

  // Fallback parser for non-standard SQL Server URL formats.
  const hostMatch = connectionString.match(/(?:@|\/\/)([^:;\/\s]+)(?::(\d+))?/);
  return {
    host: hostMatch?.[1] || 'localhost',
    port: hostMatch?.[2] ? parseInt(hostMatch[2], 10) : 1433,
  };
}

const { host, port } = parseConnectionString(dbUrl);

console.log(`Testing connection to ${host}:${port}...`);

const socket = new net.Socket();

socket.setTimeout(3000);

socket.on('connect', () => {
  console.log(`✅ Success! Port ${port} is open and accepting connections.`);
  socket.destroy();
  process.exit(0);
});

socket.on('timeout', () => {
  console.error(`❌ Timeout! Could not connect to ${host}:${port}. Is the database running?`);
  socket.destroy();
  process.exit(1);
});

socket.on('error', (err) => {
  console.error(`❌ Error! Could not connect to ${host}:${port}.`);
  console.error(`Root cause: ${err.message}`);
  socket.destroy();
  process.exit(1);
});

socket.connect(port, host);
