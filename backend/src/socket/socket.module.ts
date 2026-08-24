// src/socket/socket.module.ts
import { Global, Module } from '@nestjs/common';
import { SocketGateway } from '../socket/socket.gateway.js';

@Global() // Makes it globally available across all your other modules
@Module({
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}