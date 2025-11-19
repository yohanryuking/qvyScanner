/**
 * 🧪 TEST: CANCELAR OFERTA - Según Documentación API
 * 
 * Prueba cancelar una oferta siguiendo exactamente la documentación:
 * POST /p2p/{uuid}/cancel
 * No retorna body en la respuesta
 */

const config = require('../config-gestor-ofertas');
const { obtenerMisOfertas, cancelarOferta } = require('../utils/api-ofertas');

async function testCancelar() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   🧪 TEST: CANCELAR OFERTA                           ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
    
    try {
        // 1. Obtener ofertas
        console.log('📋 Obteniendo tus ofertas activas...\n');
        const ofertas = await obtenerMisOfertas(config.token);
        
        if (ofertas.length === 0) {
            console.log('⚠️  No tienes ofertas activas');
            console.log('\n💡 Crea una oferta de prueba primero:');
            console.log('   node arbitrage/tests/test-crear-oferta.js\n');
            return;
        }
        
        // Filtrar ofertas abiertas sin peer
        const ofertasAbiertas = ofertas.filter(o => 
            o.status === 'open' && !o.peer_id
        );
        
        if (ofertasAbiertas.length === 0) {
            console.log('⚠️  No tienes ofertas abiertas sin peer para cancelar\n');
            console.log('📊 Tus ofertas actuales:');
            ofertas.forEach((o, i) => {
                const tipo = o.type === 'buy' ? 'COMPRA' : 'VENTA';
                const peer = o.peer_id ? '(con peer)' : '(sin peer)';
                console.log(`   ${i + 1}. ${tipo} ${o.amount} USD - ${o.status} ${peer}`);
            });
            return;
        }
        
        // Mostrar ofertas disponibles
        console.log(`✅ Encontradas ${ofertasAbiertas.length} ofertas cancelables:\n`);
        ofertasAbiertas.forEach((o, i) => {
            const tipo = o.type === 'buy' ? '🟢 COMPRA' : '🔴 VENTA';
            const edad = calcularMinutos(o.created_at);
            console.log(`${i + 1}. ${tipo} ${o.amount} USD → ${o.receive} CUP`);
            console.log(`   UUID: ${o.uuid}`);
            console.log(`   Edad: ${edad} minutos`);
            console.log(`   Link: https://qvapay.com/p2p/${o.uuid}`);
            console.log('');
        });
        
        // Cancelar la primera (más antigua)
        const oferta = ofertasAbiertas[0];
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('🎯 CANCELANDO OFERTA');
        console.log('═══════════════════════════════════════════════════════\n');
        console.log(`UUID: ${oferta.uuid}`);
        console.log(`Tipo: ${oferta.type === 'buy' ? 'COMPRA' : 'VENTA'}`);
        console.log(`Monto: ${oferta.amount} USD → ${oferta.receive} CUP`);
        console.log('');
        
        // Intentar cancelar
        console.log('⏳ Enviando solicitud de cancelación...\n');
        
        const resultado = await cancelarOferta(config.token, oferta.uuid);
        
        if (resultado.exito) {
            console.log('✅ ¡ÉXITO! Oferta cancelada correctamente\n');
            console.log(`   Status HTTP: ${resultado.status}`);
            console.log(`   UUID: ${oferta.uuid.substring(0, 8)}...`);
            
            // Verificar que ya no existe
            console.log('\n⏳ Verificando que la oferta fue eliminada...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const ofertasActualizadas = await obtenerMisOfertas(config.token);
            const existe = ofertasActualizadas.find(o => o.uuid === oferta.uuid);
            
            if (existe) {
                console.log(`\n⚠️  La oferta aún aparece con estado: ${existe.status}`);
                if (existe.status === 'cancelled') {
                    console.log('   ✅ Pero está marcada como cancelada (correcto)');
                }
            } else {
                console.log('\n✅ La oferta fue eliminada completamente del sistema');
            }
            
        } else {
            console.log('❌ ERROR al cancelar la oferta\n');
            console.log(`   Status HTTP: ${resultado.status || 'N/A'}`);
            console.log(`   Error: ${resultado.error}`);
            
            console.log('\n💡 Posibles causas:');
            console.log('   • La oferta ya tiene un peer asignado');
            console.log('   • La oferta ya está en otro estado (cancelled, completed)');
            console.log('   • El token no tiene permisos');
            console.log('   • La oferta no te pertenece');
        }
        
    } catch (error) {
        console.error('\n❌ Error en el test:', error.message);
        console.error('Stack:', error.stack);
    }
}

/**
 * Calcular minutos desde creación
 */
function calcularMinutos(fechaCreacion) {
    const ahora = new Date();
    const creacion = new Date(fechaCreacion);
    const diff = ahora - creacion;
    return Math.floor(diff / (1000 * 60));
}

// Ejecutar
console.log('\n');
testCancelar()
    .then(() => {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('✅ Test completado');
        console.log('═══════════════════════════════════════════════════════\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Error fatal:', error);
        process.exit(1);
    });
