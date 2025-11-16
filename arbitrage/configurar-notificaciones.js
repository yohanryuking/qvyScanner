#!/usr/bin/env node
/**
 * 🔧 Asistente de Configuración de Notificaciones
 */

const { mostrarInstrucciones } = require('./utils/notificaciones');

console.log('\n╔═══════════════════════════════════════════════════════╗');
console.log('║    🔧 ASISTENTE DE CONFIGURACIÓN - NOTIFICACIONES    ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

// Mostrar instrucciones detalladas
mostrarInstrucciones();

console.log('💡 MÉTODO RECOMENDADO: CallMeBot (Gratuito)\n');
console.log('   Es el más simple y no requiere tarjeta de crédito.\n');

console.log('📝 PASOS RÁPIDOS:\n');
console.log('   1. Agrega +34 644 44 71 67 a tus contactos de WhatsApp');
console.log('   2. Envíale: "I allow callmebot to send me messages"');
console.log('   3. Te responderá con tu API Key');
console.log('   4. Ejecuta estos comandos:\n');
console.log('      export NOTIFICACIONES_CALLMEBOT=true');
console.log('      export CALLMEBOT_PHONE="53tu_numero"  # Sin + ni espacios');
console.log('      export CALLMEBOT_API_KEY="123456"      # El que te dieron\n');
console.log('   5. Ejecuta el monitor: node arbitrage/monitor.js\n');

console.log('═══════════════════════════════════════════════════════\n');
console.log('💾 TIP: Guarda las variables en tu ~/.bashrc para que persistan:\n');
console.log('   echo "export NOTIFICACIONES_CALLMEBOT=true" >> ~/.bashrc');
console.log('   echo "export CALLMEBOT_PHONE=\'53tu_numero\'" >> ~/.bashrc');
console.log('   echo "export CALLMEBOT_API_KEY=\'tu_key\'" >> ~/.bashrc');
console.log('   source ~/.bashrc\n');

console.log('═══════════════════════════════════════════════════════\n');
console.log('📖 Más información: https://www.callmebot.com/blog/free-api-whatsapp-messages/\n');
