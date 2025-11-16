/**
 * 🔔 Utilidades - Sistema de Notificaciones
 * 
 * Envía notificaciones por WhatsApp y Telegram cuando se encuentran oportunidades
 */

const fetch = require('node-fetch');

/**
 * Configuración de WhatsApp
 * Puedes usar:
 * 1. Twilio (recomendado) - https://www.twilio.com/whatsapp
 * 2. WhatsApp Business API
 * 3. CallMeBot (gratuito pero limitado) - https://www.callmebot.com/blog/free-api-whatsapp-messages/
 */

// OPCIÓN 1: Twilio (Recomendado)
const TWILIO_CONFIG = {
    accountSid: process.env.TWILIO_ACCOUNT_SID || 'TU_ACCOUNT_SID',
    authToken: process.env.TWILIO_AUTH_TOKEN || 'TU_AUTH_TOKEN',
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886', // Número de Twilio
    whatsappTo: process.env.TWILIO_WHATSAPP_TO || 'whatsapp:+5355555555', // Tu número
    enabled: process.env.NOTIFICACIONES_TWILIO === 'true'
};

// OPCIÓN 2: CallMeBot (Gratuito, más simple) - Soporte para múltiples números
const CALLMEBOT_CONFIG = {
    enabled: process.env.NOTIFICACIONES_CALLMEBOT === 'true' || true, // Habilitado por defecto
    numeros: [
        {
            phoneNumber: process.env.CALLMEBOT_PHONE_1 || '5356060886',
            apiKey: process.env.CALLMEBOT_API_KEY_1 || '5906773',
            nombre: 'Número 1'
        },
        {
            phoneNumber: process.env.CALLMEBOT_PHONE_2 || '5351546383',
            apiKey: process.env.CALLMEBOT_API_KEY_2 || '7501934',
            nombre: 'Número 2'
        }
    ]
};

// OPCIÓN 3: Telegram (Alternativa) - Soporte para múltiples chats
const TELEGRAM_CONFIG = {
    enabled: process.env.NOTIFICACIONES_TELEGRAM === 'true' || true, // Habilitado por defecto
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

/**
 * Enviar mensaje por Twilio WhatsApp
 */
async function enviarPorTwilio(mensaje) {
    if (!TWILIO_CONFIG.enabled) return false;
    
    try {
        const auth = Buffer.from(
            `${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`
        ).toString('base64');
        
        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Messages.json`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    From: TWILIO_CONFIG.whatsappFrom,
                    To: TWILIO_CONFIG.whatsappTo,
                    Body: mensaje
                })
            }
        );
        
        if (response.ok) {
            console.log('   ✅ Notificación enviada por Twilio WhatsApp');
            return true;
        } else {
            const error = await response.text();
            console.error('   ❌ Error Twilio:', error);
            return false;
        }
    } catch (error) {
        console.error('   ❌ Error al enviar por Twilio:', error.message);
        return false;
    }
}

/**
 * Enviar mensaje por CallMeBot a un número específico
 */
async function enviarPorCallMeBotNumero(mensaje, phoneNumber, apiKey, nombre) {
    try {
        const mensajeEncoded = encodeURIComponent(mensaje);
        const url = `https://api.callmebot.com/whatsapp.php?phone=${phoneNumber}&text=${mensajeEncoded}&apikey=${apiKey}`;
        
        const response = await fetch(url);
        const result = await response.text();
        
        if (response.ok) {
            console.log(`   ✅ Notificación enviada a ${nombre} (${phoneNumber})`);
            return true;
        } else {
            console.error(`   ❌ Error CallMeBot ${nombre}:`, result);
            return false;
        }
    } catch (error) {
        console.error(`   ❌ Error al enviar a ${nombre}:`, error.message);
        return false;
    }
}

/**
 * Enviar mensaje por CallMeBot a todos los números configurados
 */
async function enviarPorCallMeBot(mensaje) {
    if (!CALLMEBOT_CONFIG.enabled) return false;
    
    // Enviar a todos los números en paralelo
    const promesas = CALLMEBOT_CONFIG.numeros.map(numero => 
        enviarPorCallMeBotNumero(mensaje, numero.phoneNumber, numero.apiKey, numero.nombre)
    );
    
    const resultados = await Promise.all(promesas);
    
    // Retornar true si al menos uno se envió exitosamente
    const algunoEnviado = resultados.some(r => r === true);
    
    if (algunoEnviado) {
        const exitosos = resultados.filter(r => r === true).length;
        console.log(`   📊 Enviado a ${exitosos}/${CALLMEBOT_CONFIG.numeros.length} números`);
    }
    
    return algunoEnviado;
}

/**
 * Convertir mensaje de WhatsApp a formato HTML de Telegram
 */
function convertirMensajeATelegram(mensajeWhatsApp) {
    return mensajeWhatsApp
        .replace(/\*([^*]+)\*/g, '<b>$1</b>')  // *texto* -> <b>texto</b>
        .replace(/_([^_]+)_/g, '<i>$1</i>');    // _texto_ -> <i>texto</i>
}

/**
 * Enviar mensaje por Telegram a un chat específico
 */
async function enviarPorTelegramChat(mensaje, chatId, nombre) {
    try {
        // Convertir formato de WhatsApp a HTML de Telegram
        const mensajeHTML = convertirMensajeATelegram(mensaje);
        
        const response = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: mensajeHTML,
                    parse_mode: 'HTML',
                    disable_web_page_preview: false
                })
            }
        );
        
        if (response.ok) {
            console.log(`   ✅ Notificación enviada a ${nombre} (${chatId})`);
            return true;
        } else {
            const error = await response.json();
            console.error(`   ❌ Error Telegram ${nombre}:`, error.description);
            return false;
        }
    } catch (error) {
        console.error(`   ❌ Error al enviar a ${nombre}:`, error.message);
        return false;
    }
}

/**
 * Enviar mensaje por Telegram a todos los chats configurados
 */
async function enviarPorTelegram(mensaje) {
    if (!TELEGRAM_CONFIG.enabled) return false;
    
    // Enviar a todos los chats en paralelo
    const promesas = TELEGRAM_CONFIG.chats.map(chat => 
        enviarPorTelegramChat(mensaje, chat.chatId, chat.nombre)
    );
    
    const resultados = await Promise.all(promesas);
    
    // Retornar true si al menos uno se envió exitosamente
    const algunoEnviado = resultados.some(r => r === true);
    
    if (algunoEnviado) {
        const exitosos = resultados.filter(r => r === true).length;
        console.log(`   📊 Enviado a ${exitosos}/${TELEGRAM_CONFIG.chats.length} chats de Telegram`);
    }
    
    return algunoEnviado;
}

/**
 * Formatear oportunidad para WhatsApp
 */
function formatearOportunidadWhatsApp(oportunidad) {
    const { tipo, moneda, tasa, precioObjetivo, diferencia, gananciaTotalCUP, oferta, enlace } = oportunidad;
    
    const emoji = tipo === 'compra' ? '🟢' : '🔴';
    const accion = tipo === 'compra' ? 'COMPRA' : 'VENTA';
    
    let mensaje = `${emoji} *OPORTUNIDAD DE ${accion}*\n\n`;
    mensaje += `💱 *Moneda:* ${moneda}\n`;
    mensaje += `📊 *Tasa:* ${tasa.toFixed(2)} CUP/USD\n`;
    mensaje += `🎯 *Objetivo:* ${precioObjetivo.toFixed(2)} CUP/USD\n`;
    mensaje += `💰 *Diferencia:* ${Math.abs(diferencia).toFixed(2)} CUP/USD\n`;
    
    // Mostrar ganancia total solo si está disponible
    if (gananciaTotalCUP !== undefined) {
        mensaje += `💎 *Ganancia total:* ${gananciaTotalCUP.toFixed(2)} CUP\n`;
    }
    mensaje += '\n';
    
    if (oferta.amount && oferta.receive) {
        mensaje += `💵 *Monto:* ${oferta.amount} USD → ${oferta.receive} CUP\n`;
    }
    
    if (oferta.User) {
        mensaje += `👤 *Usuario:* ${oferta.User.username || 'N/A'}`;
        if (oferta.User.rating_avg) {
            mensaje += ` (${parseFloat(oferta.User.rating_avg).toFixed(1)} ⭐)`;
        }
        mensaje += '\n';
    }
    
    mensaje += `✅ *KYC:* ${oferta.User?.kyc ? 'Sí' : 'No'}\n`;
    mensaje += `🔓 *Pública:* ${oferta.private ? 'No' : 'Sí'}\n\n`;
    mensaje += `🔗 *Link:* ${enlace}\n\n`;
    mensaje += `⏰ ${new Date().toLocaleTimeString('es-ES')}`;
    
    return mensaje;
}

/**
 * Formatear resumen de oportunidades
 */
function formatearResumenWhatsApp(oportunidades, precios) {
    let mensaje = '📊 *RESUMEN DE OPORTUNIDADES*\n\n';
    
    // Agrupar por tipo
    const compras = oportunidades.filter(o => o.tipo === 'compra');
    const ventas = oportunidades.filter(o => o.tipo === 'venta');
    
    mensaje += `🟢 *Compras:* ${compras.length}\n`;
    mensaje += `🔴 *Ventas:* ${ventas.length}\n`;
    mensaje += `📊 *Total:* ${oportunidades.length}\n\n`;
    
    // Precios de referencia
    if (precios && Object.keys(precios).length > 0) {
        mensaje += '💰 *PRECIOS DE REFERENCIA:*\n';
        Object.entries(precios).forEach(([moneda, data]) => {
            if (data.precios) {
                mensaje += `\n${moneda}:\n`;
                mensaje += `  🟢 Comprar: ${data.precios.compra.toFixed(2)}\n`;
                mensaje += `  🔴 Vender: ${data.precios.venta.toFixed(2)}\n`;
            }
        });
    }
    
    mensaje += `\n⏰ ${new Date().toLocaleString('es-ES')}`;
    
    return mensaje;
}

/**
 * Enviar notificación de oportunidad
 */
async function notificarOportunidad(oportunidad) {
    console.log('\n📲 Enviando notificación...');
    
    const mensaje = formatearOportunidadWhatsApp(oportunidad);
    
    // Intentar enviar por todos los métodos habilitados
    const resultados = await Promise.all([
        enviarPorTwilio(mensaje),
        enviarPorCallMeBot(mensaje),
        enviarPorTelegram(mensaje)
    ]);
    
    const enviado = resultados.some(r => r === true);
    
    if (!enviado) {
        console.log('   ⚠️  Notificaciones deshabilitadas o falló el envío');
        console.log('   💡 Configura las variables de entorno para habilitar notificaciones');
    }
    
    return enviado;
}

/**
 * Enviar resumen de múltiples oportunidades
 */
async function notificarResumen(oportunidades, precios) {
    console.log('\n📲 Enviando resumen de oportunidades...');
    
    const mensaje = formatearResumenWhatsApp(oportunidades, precios);
    
    // Intentar enviar por todos los métodos habilitados
    const resultados = await Promise.all([
        enviarPorTwilio(mensaje),
        enviarPorCallMeBot(mensaje),
        enviarPorTelegram(mensaje)
    ]);
    
    const enviado = resultados.some(r => r === true);
    
    if (!enviado) {
        console.log('   ⚠️  Notificaciones deshabilitadas o falló el envío');
    }
    
    return enviado;
}

/**
 * Verificar configuración de notificaciones
 */
function verificarConfiguracion() {
    const metodos = [];
    
    if (TWILIO_CONFIG.enabled) {
        metodos.push('Twilio WhatsApp');
    }
    
    if (CALLMEBOT_CONFIG.enabled) {
        metodos.push('CallMeBot WhatsApp');
    }
    
    if (TELEGRAM_CONFIG.enabled) {
        metodos.push('Telegram');
    }
    
    return {
        habilitado: metodos.length > 0,
        metodos,
        config: {
            twilio: TWILIO_CONFIG.enabled,
            callmebot: CALLMEBOT_CONFIG.enabled,
            telegram: TELEGRAM_CONFIG.enabled
        }
    };
}

/**
 * Mostrar instrucciones de configuración
 */
function mostrarInstrucciones() {
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║         📲 CONFIGURAR NOTIFICACIONES                 ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
    
    console.log('🔔 OPCIÓN 1: Twilio WhatsApp (Recomendado)\n');
    console.log('   1. Crear cuenta en: https://www.twilio.com/');
    console.log('   2. Activar WhatsApp Sandbox');
    console.log('   3. Configurar variables de entorno:\n');
    console.log('      export NOTIFICACIONES_TWILIO=true');
    console.log('      export TWILIO_ACCOUNT_SID="tu_account_sid"');
    console.log('      export TWILIO_AUTH_TOKEN="tu_auth_token"');
    console.log('      export TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"');
    console.log('      export TWILIO_WHATSAPP_TO="whatsapp:+53tu_numero"\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🔔 OPCIÓN 2: CallMeBot (Gratuito y Simple)\n');
    console.log('   1. Agregar el número +34 644 44 71 67 a tus contactos');
    console.log('   2. Enviar "I allow callmebot to send me messages"');
    console.log('   3. Recibirás tu API Key');
    console.log('   4. Configurar variables de entorno:\n');
    console.log('      export NOTIFICACIONES_CALLMEBOT=true');
    console.log('      export CALLMEBOT_PHONE="53tu_numero_sin_mas"');
    console.log('      export CALLMEBOT_API_KEY="tu_api_key"\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🔔 OPCIÓN 3: Telegram (Alternativa)\n');
    console.log('   1. Hablar con @BotFather en Telegram');
    console.log('   2. Crear bot con /newbot');
    console.log('   3. Obtener chat_id hablando con @userinfobot');
    console.log('   4. Configurar variables de entorno:\n');
    console.log('      export NOTIFICACIONES_TELEGRAM=true');
    console.log('      export TELEGRAM_BOT_TOKEN="tu_bot_token"');
    console.log('      export TELEGRAM_CHAT_ID="tu_chat_id"\n');
    
    console.log('═══════════════════════════════════════════════════════\n');
}

module.exports = {
    notificarOportunidad,
    notificarResumen,
    verificarConfiguracion,
    mostrarInstrucciones,
    formatearOportunidadWhatsApp,
    formatearResumenWhatsApp,
    // Exportar métodos individuales para testing
    enviarPorTwilio,
    enviarPorCallMeBot,
    enviarPorTelegram,
    convertirMensajeATelegram
};
