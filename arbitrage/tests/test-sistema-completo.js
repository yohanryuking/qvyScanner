const { notificarOportunidad } = require('../utils/notificaciones');

console.log('\n╔═══════════════════════════════════════════════════════╗');
console.log('║   🧪 PRUEBA COMPLETA DEL SISTEMA DE NOTIFICACIONES   ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

// Crear una oportunidad de prueba realista
const oportunidadPrueba = {
    tipo: 'venta',
    moneda: 'BANK_CUP',
    tasa: 510.00,
    precioObjetivo: 503.00,
    diferencia: 7.00,
    oferta: {
        uuid: 'test-' + Date.now(),
        amount: '150',
        receive: '76500',
        private: false,
        User: {
            username: 'usuario_prueba',
            rating_avg: '4.95',
            kyc: true
        }
    },
    enlace: 'https://qvapay.com/p2p/test-uuid-' + Date.now()
};

console.log('📋 Oportunidad de prueba:');
console.log(`   Tipo: ${oportunidadPrueba.tipo.toUpperCase()}`);
console.log(`   Moneda: ${oportunidadPrueba.moneda}`);
console.log(`   Tasa: ${oportunidadPrueba.tasa} CUP/USD`);
console.log(`   Objetivo: ${oportunidadPrueba.precioObjetivo} CUP/USD`);
console.log(`   Diferencia: ${Math.abs(oportunidadPrueba.diferencia)} CUP/USD`);
console.log(`   Usuario: ${oportunidadPrueba.oferta.User.username}\n`);

console.log('═══════════════════════════════════════════════════════\n');
console.log('🚀 Enviando notificación a TODOS los canales...\n');
console.log('   📱 WhatsApp: 2 números');
console.log('   💬 Telegram: 2 chats\n');
console.log('═══════════════════════════════════════════════════════');

async function probarSistemaCompleto() {
    try {
        const resultado = await notificarOportunidad(oportunidadPrueba);
        
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('📊 RESULTADO DE LA PRUEBA');
        console.log('═══════════════════════════════════════════════════════\n');
        
        if (resultado) {
            console.log('✅ ¡Prueba exitosa!');
            console.log('   Las notificaciones fueron enviadas correctamente.\n');
            console.log('📱 Verifica tus dispositivos:');
            console.log('   • WhatsApp (2 números)');
            console.log('   • Telegram (2 chats)\n');
            console.log('💡 Deberías recibir 4 mensajes en total.\n');
        } else {
            console.log('⚠️  Advertencia: No se pudo enviar a ningún canal');
            console.log('   Verifica la configuración en .env\n');
        }
        
        console.log('═══════════════════════════════════════════════════════\n');
        
    } catch (error) {
        console.error('\n❌ Error en la prueba:', error.message);
        console.error('   Revisa la configuración y vuelve a intentar.\n');
    }
}

probarSistemaCompleto();
