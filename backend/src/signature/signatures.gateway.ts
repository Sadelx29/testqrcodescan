import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// Habilitamos CORS para que tu React pueda conectarse
@WebSocketGateway({ cors: true })
export class SignaturesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`✅ [BACKEND] Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ [BACKEND] Cliente desconectado: ${client.id}`);
  }

  // 1. PC y Celular se unen a la misma "sala" usando el ID de sesión
  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomId);
    console.log(`🚪 [BACKEND] Cliente ${client.id} se unió a la sala: ${roomId}`);
  }

  // 2. El celular envía la firma
  @SubscribeMessage('send-signature')
  handleSignature(
    @MessageBody() payload: { roomId: string; image: string },
  ) {
    console.log(`📤 [BACKEND] Firma recibida para sala: ${payload.roomId}, tamaño: ${payload.image.length} caracteres`);
    // 3. El servidor reenvía la firma A TODOS en esa sala (incluyendo la PC)
    this.server.to(payload.roomId).emit('receive-signature', payload.image);
    console.log(`📨 [BACKEND] Firma reenviada a la sala: ${payload.roomId}`);
  }
}