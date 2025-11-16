const { enviarPorTelegram } = require('../utils/notificaciones');

console.log('\n═══════════════════════════════════════════════════════');
console.log('🧪 PRUEBA DE NOTIFICACIÓN POR TELEGRAM');
console.log('═══════════════════════════════════════════════════════\n');

// Crear una oportunidad de prueba
const oportunidadPrueba = {
  tipo: 'VENTA',
  moneda: 'BANK_CUP',
  tasa: 510.00,
  precioCalculado: 503.00,
  gananciaExtra: 7.00,
  porcentajeGanancia: 1.39,
  cantidad: 100,
  totalCUP: 51000,
  usuario: 'usuario_prueba',
  rating: 5.0,
  reviews: 42,
  kyc: true,
  fecha: new Date().toLocaleString('es-ES'),
  enlace: 'https://qvapay.com/p2p/test-uuid-123'
};

// Probar envío por Telegram
async function probarTelegram() {
  try {
    console.log('📱 Preparando mensaje de prueba...\n');
    
    const mensaje = `🔴 *OPORTUNIDAD DETECTADA - PRUEBA*

*Tipo:* ${oportunidadPrueba.tipo} ${oportunidadPrueba.moneda}

💸 *PUEDES VENDER USD más caro*
   Tasa oferta: ${oportunidadPrueba.tasa} CUP/USD
   Tu precio mínimo: ${oportunidadPrueba.precioCalculado} CUP/USD
   💵 *Ganas extra:* ${oportunidadPrueba.gananciaExtra} CUP por USD (${oportunidadPrueba.porcentajeGanancia}%)
   
📦 *Cantidad:* ${oportunidadPrueba.cantidad} USD → ${oportunidadPrueba.totalCUP.toLocaleString('es-ES')} CUP

👤 *Usuario:* ${oportunidadPrueba.usuario}
⭐ *Rating:* ${oportunidadPrueba.rating} (${oportunidadPrueba.reviews} reviews)
✅ *KYC:* ${oportunidadPrueba.kyc ? 'Verificado' : 'No verificado'}
📅 *Creada:* ${oportunidadPrueba.fecha}

🔗 *Ver oferta:* ${oportunidadPrueba.enlace}

_Este es un mensaje de prueba del sistema de monitoreo_`;

    console.log('📤 Enviando mensaje por Telegram a todos los chats...\n');
    const resultado = await enviarPorTelegram(mensaje);
    
    console.log('\n✅ ¡Prueba completada!');
    console.log(`   Resultado: ${resultado ? 'Enviado exitosamente' : 'Error al enviar'}`);
    console.log('   Verifica tu Telegram para confirmar que llegó el mensaje.\n');
    console.log('💡 Si no llegó el mensaje:');
    console.log('   1. Verifica que iniciaste conversación con el bot (/start)');
    console.log('   2. Revisa el token y chat_id en .env');
    console.log('   3. Confirma que el bot está activo en @BotFather\n');
    
  } catch (error) {
    console.error('\n❌ Error al probar Telegram:', error.message);
    
    if (error.message.includes('403')) {
      console.log('\n⚠️  ERROR 403: El bot no puede enviarte mensajes');
      console.log('   Solución: Abre Telegram y envía /start a tu bot');
      console.log('   Busca tu bot por su username o usa este link:');
      console.log('   https://t.me/YOUR_BOT_USERNAME\n');
    } else if (error.message.includes('404')) {
      console.log('\n⚠️  ERROR 404: Bot no encontrado o token inválido');
      console.log('   Verifica el token en .env\n');
    } else if (error.message.includes('400')) {
      console.log('\n⚠️  ERROR 400: Chat ID inválido');
      console.log('   Verifica el chat_id en .env\n');
    }
  }
}

console.log('═══════════════════════════════════════════════════════\n');
probarTelegram();
