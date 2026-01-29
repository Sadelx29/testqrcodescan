import React, { useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Asumiendo que usas React Router
import SignatureCanvas from 'react-signature-canvas';
import { io } from 'socket.io-client';

const socket = io('http://10.0.0.5:3000');

socket.on('connect', () => {
  console.log('✅ [MOBILE] Socket conectado:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ [MOBILE] Socket desconectado');
});

socket.on('connect_error', (error) => {
  console.error('🔴 [MOBILE] Error de conexión:', error.message);
});

export const MobilePad = () => {
  console.log('📱 [MOBILE] Componente MobilePad montado');
  const { sessionId } = useParams(); // Obtenemos el ID de la URL
  console.log('🔑 [MOBILE] Session ID desde URL:', sessionId);
  const sigCanvas = useRef({});

  useEffect(() => {
    // Unirse a la misma sala que la PC
    console.log('📤 [MOBILE] Emitiendo join-room:', sessionId);
    socket.emit('join-room', sessionId);
  }, [sessionId]);

  const enviarFirma = () => {
    console.log('🖊️ [MOBILE] Botón enviar presionado');
    if (sigCanvas.current.isEmpty()) {
      console.log('⚠️ [MOBILE] Canvas vacío');
      alert("Por favor firma primero");
      return;
    }

    // Obtener imagen en base64
    const image = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    console.log('🖼️ [MOBILE] Imagen generada, tamaño:', image.length, 'caracteres');

    // Enviar al backend
    console.log('📤 [MOBILE] Emitiendo send-signature para room:', sessionId);
    socket.emit('send-signature', { roomId: sessionId, image });
    alert("Firma enviada!");
  };

  const limpiar = () => {
    console.log('🧹 [MOBILE] Canvas limpiado');
    sigCanvas.current.clear();
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3>Firma aquí</h3>
      <div style={{ border: '1px solid #000', width: '90%', height: '300px' }}>
        <SignatureCanvas 
          ref={sigCanvas}
          canvasProps={{ className: 'sigCanvas', style: { width: '100%', height: '100%' } }} 
        />
      </div>
      <div style={{ marginTop: '20px' }}>
        <button onClick={limpiar} style={{ marginRight: '10px', padding: '10px' }}>Borrar</button>
        <button onClick={enviarFirma} style={{ padding: '10px 20px', background: 'blue', color: 'white' }}>Enviar Firma</button>
      </div>
    </div>
  );
};