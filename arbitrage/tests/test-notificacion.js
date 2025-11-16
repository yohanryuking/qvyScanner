/**
 * 🧪 Test de Notificaciones WhatsApp
 * 
 * Script para probar que las notificaciones por WhatsApp funcionan correctamente
 */

const { 
    notificarOportunidad,
    verificarConfiguracion,
    formatearOportunidadWhatsApp
} = require('../utils/notificaciones');

async function testearNotificacion() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║     🧪 TEST DE NOTIFICACIONES WHATSAPP              ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
    
    // Verificar configuración
    console.log('🔍 Verificando configuración...\n');
    const config = verificarConfiguracion();
    
    if (config.habilitado) {
        console.log('✅ Notificaciones habilitadas');
        console.log('📱 Métodos configurados:', config.metodos.join(', '));
    } else {
        console.log('❌ Notificaciones NO habilitadas');
        console.log('💡 Configura las variables de entorno en .env\n');
        return;
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Crear oportunidad de prueba
    const oportunidadPrueba = {
        tipo: 'compra',
        moneda: 'BANK_CUP',
        tasa: 485.50,
        precioObjetivo: 496.04,
        diferencia: 10.54,
        oferta: {
            uuid: 'test-abc123',
            amount: '50',
            receive: '24275',
            User: {
                username: 'test_usuario',
                rating_avg: '4.8',
                kyc: true
            },
            private: false
        },
        enlace: 'https://qvapay.com/p2p/offer/test-abc123'
    };
    
    console.log('📝 Oportunidad de prueba:\n');
    console.log(`   ${oportunidadPrueba.tipo === 'compra' ? '🟢' : '🔴'} Tipo: ${oportunidadPrueba.tipo.toUpperCase()}`);
    console.log(`   💱 Moneda: ${oportunidadPrueba.moneda}`);
    console.log(`   📊 Tasa: ${oportunidadPrueba.tasa} CUP/USD`);
    console.log(`   🎯 Objetivo: ${oportunidadPrueba.precioObjetivo} CUP/USD`);
    console.log(`   💰 Ahorro: ${oportunidadPrueba.diferencia} CUP/USD\n`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📲 Enviando mensaje de prueba por WhatsApp...\n');
    
    try {
        const enviado = await notificarOportunidad(oportunidadPrueba);
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        if (enviado) {
            console.log('✅ ¡NOTIFICACIÓN ENVIADA EXITOSAMENTE!');
            console.log('📱 Revisa tu WhatsApp en los próximos segundos\n');
            console.log('💡 Nota: CallMeBot puede tardar 5-10 segundos en entregar el mensaje');
        } else {
            console.log('❌ No se pudo enviar la notificación');
            console.log('⚠️  Verifica tu configuración en .env');
            console.log('\n📋 Configuración actual:');
            console.log('   NOTIFICACIONES_CALLMEBOT=true');
            console.log('   CALLMEBOT_PHONE=5356060886');
            console.log('   CALLMEBOT_API_KEY=5906773');
        }
        
    } catch (error) {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('❌ ERROR AL ENVIAR NOTIFICACIÓN:');
        console.log('   ', error.message);
    }
    
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║                  📋 INFORMACIÓN                      ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
    
    console.log('🔧 PASOS PARA CONFIGURAR CALLMEBOT:\n');
    console.log('   1. Agregar +34 644 44 71 67 a tus contactos');
    console.log('   2. Enviarle: "I allow callmebot to send me messages"');
    console.log('   3. Te responderá con tu API Key');
    console.log('   4. Ya está configurado en tu .env\n');
    
    console.log('📱 Números configurados:');
    console.log('   Número 1: +53 5356060886 (API Key: 5906773)');
    console.log('   Número 2: +53 5351546383 (API Key: 7501934)\n');
    console.log('💡 Las notificaciones se envían a ambos números simultáneamente\n');
    
    console.log('═══════════════════════════════════════════════════════\n');
}

// Ejecutar test
testearNotificacion()
    .then(() => {
        console.log('✅ Test completado\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error en test:', error.message);
        process.exit(1);
    });
