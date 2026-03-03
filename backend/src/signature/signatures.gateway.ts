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

  // Map para rastrear dispositivos por sesión: roomId -> [clients]
  private sessionDevices: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    console.log(`✅ [BACKEND] Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ [BACKEND] Cliente desconectado: ${client.id}`);
    // Limpiar referencias al desconectar
    this.sessionDevices.forEach((devices, roomId) => {
      devices.delete(client.id);
      if (devices.size === 0) {
        this.sessionDevices.delete(roomId);
      }
    });
  }

  // 1. PC y Celular se unen a la misma "sala" usando el ID de sesión
  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    // Validar que no haya más de 1 dispositivo en la sesión
    if (!this.sessionDevices.has(roomId)) {
      this.sessionDevices.set(roomId, new Set());
    }

    const devices = this.sessionDevices.get(roomId);
    
    if (!devices || devices.size >= 1) {
      // Rechazar la conexión
      client.emit('error', {
        code: 'DEVICE_LIMIT_EXCEEDED',
        message: 'Ya hay un dispositivo conectado en esta sesión. Solo se permite 1 dispositivo por sesión.',
      });
      console.log(`❌ [BACKEND] Intento de conexión rechazado para ${client.id} en sesión ${roomId}. Ya hay ${devices?.size ?? 0} dispositivo(s).`);
      return;
    }

    // Agregar dispositivo
    devices.add(client.id);
    client.join(roomId);
    client.emit('success', {
      message: 'Conectado a la sesión correctamente',
    });
    console.log(`🚪 [BACKEND] Cliente ${client.id} se unió a la sala: ${roomId} (Total: ${devices.size} dispositivo)`);
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