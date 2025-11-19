/**
 * 🔍 DEBUG: Cancelar Oferta - Análisis detallado
 * 
 * Muestra todos los detalles de la respuesta de la API
 */

const fetch = require('node-fetch');
const config = require('../config-gestor-ofertas');
const { obtenerMisOfertas } = require('../utils/api-ofertas');

async function debugCancelar() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   🔍 DEBUG: CANCELAR OFERTA                          ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
    
    try {
        // Obtener ofertas
        console.log('📋 Obteniendo ofertas...\n');
        const ofertas = await obtenerMisOfertas(config.token);
        
        const ofertasAbiertas = ofertas.filter(o => 
            o.status === 'open' && !o.peer_id
        );
        
        if (ofertasAbiertas.length === 0) {
            console.log('⚠️  No hay ofertas para cancelar');
            console.log('\n📊 Todas tus ofertas:');
            ofertas.forEach(o => {
                console.log(`   - ${o.type} ${o.amount} USD - ${o.status}`);
                console.log(`     UUID: ${o.uuid}`);
                console.log(`     Peer: ${o.peer_id || 'ninguno'}`);
                console.log('');
            });
            return;
        }
        
        const oferta = ofertasAbiertas[0];
        const uuid = oferta.uuid;
        
        console.log('🎯 Oferta seleccionada:');
        console.log(`   UUID: ${uuid}`);
        console.log(`   Tipo: ${oferta.type}`);
        console.log(`   Monto: ${oferta.amount} USD`);
        console.log(`   Estado: ${oferta.status}`);
        console.log(`   Peer: ${oferta.peer_id || 'ninguno'}`);
        console.log('');
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('📡 ENVIANDO REQUEST');
        console.log('═══════════════════════════════════════════════════════\n');
        
        const url = `https://api.qvapay.com/p2p/${uuid}/cancel`;
        
        console.log('📍 URL:', url);
        console.log('🔧 Método: POST');
        console.log('🔑 Token:', config.token.substring(0, 20) + '...');
        console.log('');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${config.token}`
            }
        });
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('📥 RESPUESTA RECIBIDA');
        console.log('═══════════════════════════════════════════════════════\n');
        
        console.log('📊 Status Code:', response.status);
        console.log('📊 Status Text:', response.statusText);
        console.log('📊 OK:', response.ok);
        console.log('');
        
        console.log('📋 Headers:');
        response.headers.forEach((value, key) => {
            console.log(`   ${key}: ${value}`);
        });
        console.log('');
        
        // Intentar leer el body
        console.log('📦 Body:');
        const text = await response.text();
        
        if (text) {
            console.log('   Length:', text.length, 'caracteres');
            console.log('   Contenido:', text);
            
            // Intentar parsear como JSON
            try {
                const json = JSON.parse(text);
                console.log('\n   📋 Parseado como JSON:');
                console.log(JSON.stringify(json, null, 2));
            } catch {
                console.log('   (No es JSON válido)');
            }
        } else {
            console.log('   (vacío - sin body)');
        }
        
        console.log('');
        console.log('═══════════════════════════════════════════════════════');
        
        if (response.ok) {
            console.log('✅ RESULTADO: Cancelación exitosa (status 2xx)');
        } else if (response.status === 401) {
            console.log('❌ RESULTADO: Error de autenticación (401)');
            console.log('   💡 El token puede estar expirado o inválido');
        } else if (response.status === 403) {
            console.log('❌ RESULTADO: Prohibido (403)');
            console.log('   💡 No tienes permiso para cancelar esta oferta');
        } else if (response.status === 404) {
            console.log('❌ RESULTADO: No encontrado (404)');
            console.log('   💡 La oferta no existe o el endpoint es incorrecto');
        } else if (response.status === 422) {
            console.log('❌ RESULTADO: Error de validación (422)');
            console.log('   💡 La oferta no puede ser cancelada (ej: ya tiene peer)');
        } else {
            console.log(`❌ RESULTADO: Error ${response.status}`);
        }
        
        console.log('═══════════════════════════════════════════════════════\n');
        
        // Verificar estado después
        console.log('🔍 Verificando estado de la oferta...\n');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const ofertasActualizadas = await obtenerMisOfertas(config.token);
        const ofertaActualizada = ofertasActualizadas.find(o => o.uuid === uuid);
        
        if (ofertaActualizada) {
            console.log('📋 Oferta aún existe:');
            console.log(`   Estado: ${ofertaActualizada.status}`);
            console.log(`   Peer: ${ofertaActualizada.peer_id || 'ninguno'}`);
            
            if (ofertaActualizada.status === 'cancelled') {
                console.log('   ✅ Está marcada como cancelada');
            } else if (ofertaActualizada.status === 'open') {
                console.log('   ⚠️  Sigue abierta (no se canceló)');
            }
        } else {
            console.log('✅ Oferta eliminada del sistema');
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Ejecutar
console.log('\n');
debugCancelar()
    .then(() => {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('✅ Debug completado');
        console.log('═══════════════════════════════════════════════════════\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Error fatal:', error);
        process.exit(1);
    });
