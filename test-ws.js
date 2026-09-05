import { io } from 'socket.io-client';

const socket = io('http://localhost:8000', {
  withCredentials: true,
});

socket.on('connect', () => {
  console.log('Connected to server with ID:', socket.id);

  socket.emit('events', { data: 'Hello from Node test client' }, (response) => {
    console.log('Received ack from server:', response);
    process.exit(0);
  });
});

socket.on('connect_error', (err) => {
  console.error('Connection failed:', err.message);
});