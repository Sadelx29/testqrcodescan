import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

  const socket = io('http://10.0.0.5:3000');

  socket.on('connect', () => {
    console.log('✅ [APP] Socket conectado:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ [APP] Socket desconectado');
  });

  socket.on('connect_error', (error) => {
    console.error('🔴 [APP] Error de conexión:', error.message);
  });


function App() {

  const [sessionId, setSessionId] = useState('');
  const [signatureImage, setSignatureImage] = useState(null);

  useEffect(() => {
    // 1. Generar ID único al cargar
    const newSessionId = uuidv4();
    console.log('🔑 [APP] Session ID generado:', newSessionId);
    setSessionId(newSessionId);

    // 2. Unirse a la sala en el backend
    console.log('📤 [APP] Emitiendo join-room:', newSessionId);
    socket.emit('join-room', newSessionId);

    // 3. Escuchar si llega una firma
    socket.on('receive-signature', (image) => {
      console.log('📥 [APP] Firma recibida!');
      setSignatureImage(image);
      // Aquí podrías cerrar el modal o guardar la imagen
    });

    return () => {
      socket.off('receive-signature');
    };
  }, []);

  // La URL que abrirá el celular (debe ser tu IP local o dominio, NO localhost)
  const mobileUrl = `http://10.0.0.5:3000/mobile-sign/${sessionId}`;
  console.log('🔗 [APP] URL del QR:', mobileUrl);


return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      {!signatureImage ? (
        <>
          <h2>Escanea para firmar</h2>
          <div style={{ background: 'white', padding: '16px', display: 'inline-block' }}>
            <QRCodeSVG value={mobileUrl} size={256} />
          </div>
          <p>Esperando firma...</p>
        </>
      ) : (
        <>
          <h2>¡Firma Recibida!</h2>
          <img src={signatureImage} alt="Firma usuario" style={{ border: '1px solid #ccc' }} />
        </>
      )}
    </div>
  );
}

export default App;
