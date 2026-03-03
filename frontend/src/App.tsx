import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { v4 as uuidv4 } from 'uuid';
import { MobilePad } from './MobilePad';
import { HomeScreen } from './HomeScreen';
import { generateSignedPDF } from './utils/pdfGenerator';
import './App.css';

const socket = io('http://10.0.0.8:3000');

socket.on('connect', () => {
  console.log('✅ [APP] Socket conectado:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ [APP] Socket desconectado');
});

socket.on('connect_error', (error) => {
  console.error('🔴 [APP] Error de conexión:', error.message);
});

function QRScanner() {
  const [sessionId, setSessionId] = useState('');
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    // 1. Generar ID único al cargar
    const newSessionId = uuidv4();
    console.log('🔑 [APP] Session ID generado:', newSessionId);
    setSessionId(newSessionId);

    // 2. Unirse a la sala en el backend
    console.log('📤 [APP] Emitiendo join-room:', newSessionId);
    socket.emit('join-room', newSessionId);

    // 3. Escuchar si llega una firma
    const handleSignature = (image: string) => {
      console.log('📥 [APP] Firma recibida!');
      setSignatureImage(image);
    };

    socket.on('receive-signature', handleSignature);

    return () => {
      socket.off('receive-signature', handleSignature);
    };
  }, []);

  const handleComplete = async () => {
    if (!signatureImage) {
      alert('No hay firma para completar');
      return;
    }

    try {
      setIsGeneratingPDF(true);
      console.log('📄 [APP] Generando PDF con firma...');
      
      await generateSignedPDF(signatureImage, {
        name: 'Usuario Firmante',
        document: 'DNI/Pasaporte',
        date: new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });

      console.log('✅ [APP] PDF generado exitosamente');
      setIsComplete(true);

      // Regresar al inicio después de 3 segundos
      setTimeout(() => {
        setSignatureImage(null);
        setIsComplete(false);
        window.location.href = '/';
      }, 3000);
    } catch (error) {
      console.error('❌ [APP] Error al generar PDF:', error);
      alert('Error al generar el PDF. Intenta de nuevo.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // La URL que abrirá el celular (debe ser tu IP local o dominio, NO localhost)
  const mobileUrl = `http://10.0.0.8:3001/mobile-sign/${sessionId}`;
  console.log('🔗 [APP] URL del QR:', mobileUrl);

  return (
    <div style={{ textAlign: 'center', padding: '50px', minHeight: '100vh', background: '#f5f5f5' }}>
      {isComplete ? (
        <div style={{ padding: '40px', background: 'white', borderRadius: '10px', maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ color: '#4CAF50' }}>✅ ¡Firma Completada!</h2>
          <p>Redirigiendo...</p>
        </div>
      ) : !signatureImage ? (
        <div style={{ padding: '40px', background: 'white', borderRadius: '10px', maxWidth: '600px', margin: '0 auto', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>Escanea para firmar</h2>
          <div style={{ background: '#f9f9f9', padding: '20px', display: 'inline-block', borderRadius: '8px', marginBottom: '20px' }}>
            <QRCodeSVG value={mobileUrl} size={300} level="H" includeMargin={true} />
          </div>
          <p style={{ color: '#666', fontSize: '1.1em' }}>Escanea este código QR con tu celular para firmar</p>
        </div>
      ) : (
        <div style={{ padding: '40px', background: 'white', borderRadius: '10px', maxWidth: '600px', margin: '0 auto', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#333' }}>¡Firma Recibida!</h2>
          <img 
            src={signatureImage} 
            alt="Firma usuario" 
            style={{ border: '1px solid #ddd', borderRadius: '8px', marginTop: '20px', maxWidth: '100%', height: 'auto' }} 
          />
          <button
            onClick={handleComplete}
            disabled={isGeneratingPDF}
            style={{
              marginTop: '30px',
              padding: '12px 30px',
              backgroundColor: isGeneratingPDF ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1em',
              cursor: isGeneratingPDF ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'background-color 0.3s'
            }}
          >
            {isGeneratingPDF ? 'Generando PDF...' : 'Completar Proceso'}
          </button>
          {isGeneratingPDF && (
            <p style={{ marginTop: '15px', color: '#666' }}>Generando documento PDF con tu firma...</p>
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/sign" element={<QRScanner />} />
      <Route path="/mobile-sign/:sessionId" element={<MobilePad />} />
    </Routes>
  );
}

export default App;
