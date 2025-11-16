const fetch = require('node-fetch');

console.log('\n═══════════════════════════════════════════════════════');
console.log('🔍 DEBUG - CONFIGURACIÓN DE TELEGRAM');
console.log('═══════════════════════════════════════════════════════\n');

console.log('📋 Variables de entorno:');
console.log('   NOTIFICACIONES_TELEGRAM:', process.env.NOTIFICACIONES_TELEGRAM);
console.log('   TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? '✅ Configurado' : '❌ No configurado');
console.log('   TELEGRAM_CHAT_ID_1:', process.env.TELEGRAM_CHAT_ID_1 || '❌ No configurado');
console.log('   TELEGRAM_CHAT_ID_2:', process.env.TELEGRAM_CHAT_ID_2 || '❌ No configurado');

const TELEGRAM_CONFIG = {
    enabled: process.env.NOTIFICACIONES_TELEGRAM === 'true' || true,
    botToken: process.env.TELEGRAM_BOT_TOKEN || '8280199546:AAEn0AECY2BvjbTRtBO0i76PyQqnYh1Bj6c',
    chats: [
        {
            chatId: process.env.TELEGRAM_CHAT_ID_1 || '1732171145',
            nombre: 'Chat 1'
        },
        {
            chatId: process.env.TELEGRAM_CHAT_ID_2 || '7357759140',
            nombre: 'Chat 2'
        }
    ]
};

console.log('\n🤖 Configuración cargada:');
console.log('   Habilitado:', TELEGRAM_CONFIG.enabled);
console.log('   Bot Token:', TELEGRAM_CONFIG.botToken.substring(0, 20) + '...');
console.log('   Chats configurados:', TELEGRAM_CONFIG.chats.length);
TELEGRAM_CONFIG.chats.forEach((chat, index) => {
    console.log(`   ${index + 1}. ${chat.nombre}: ${chat.chatId}`);
});

async function probarEnvioChat(chatId, nombre) {
    console.log(`\n📤 Probando envío a ${nombre} (${chatId})...`);
    
    try {
        const mensaje = `<b>🧪 MENSAJE DE PRUEBA</b>\n\nSi ves este mensaje, el bot de Telegram está funcionando correctamente para ${nombre}.\n\n<i>Hora: ${new Date().toLocaleString('es-ES')}</i>`;
        
        const response = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: mensaje,
                    parse_mode: 'HTML',
                    disable_web_page_preview: false
                })
            }
        );
        
        const result = await response.json();
        
        if (response.ok) {
            console.log(`   ✅ Mensaje enviado exitosamente a ${nombre}`);
            console.log(`   📊 Message ID: ${result.result.message_id}`);
            return true;
        } else {
            console.log(`   ❌ Error al enviar a ${nombre}`);
            console.log(`   📋 Código: ${result.error_code}`);
            console.log(`   💬 Descripción: ${result.description}`);
            
            if (result.error_code === 403) {
                console.log(`\n   ⚠️  SOLUCIÓN: El usuario debe iniciar conversación con el bot`);
                console.log(`   1. Abrir Telegram`);
                console.log(`   2. Buscar el bot (obtén el username en @BotFather)`);
                console.log(`   3. Enviar /start al bot`);
            }
            
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Error de conexión: ${error.message}`);
        return false;
    }
}

async function ejecutarPruebas() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🚀 INICIANDO PRUEBAS DE ENVÍO');
    console.log('═══════════════════════════════════════════════════════');
    
    const resultados = [];
    
    for (const chat of TELEGRAM_CONFIG.chats) {
        const resultado = await probarEnvioChat(chat.chatId, chat.nombre);
        resultados.push({ chat: chat.nombre, exito: resultado });
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RESUMEN DE PRUEBAS');
    console.log('═══════════════════════════════════════════════════════\n');
    
    resultados.forEach(r => {
        console.log(`   ${r.exito ? '✅' : '❌'} ${r.chat}`);
    });
    
    const exitosos = resultados.filter(r => r.exito).length;
    console.log(`\n   Total: ${exitosos}/${resultados.length} chats funcionando`);
    
    console.log('\n═══════════════════════════════════════════════════════\n');
}

ejecutarPruebas();
