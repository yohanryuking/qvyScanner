/**
 * 🧪 TEST: CANCELAR OFERTAS
 * 
 * Prueba la funcionalidad de cancelar ofertas P2P
 * - Lista tus ofertas activas
 * - Permite seleccionar una para cancelar
 * - Muestra el resultado de la cancelación
 */

const config = require('../config-gestor-ofertas');
const { obtenerMisOfertas, cancelarOferta } = require('../utils/api-ofertas');

async function testCancelarOferta() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   🧪 TEST: CANCELAR OFERTAS P2P                      ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
    
    try {
        // 1. Obtener mis ofertas actuales
        console.log('📋 Obteniendo tus ofertas activas...\n');
        const ofertas = await obtenerMisOfertas(config.token);
        
        if (ofertas.length === 0) {
            console.log('⚠️  No tienes ofertas activas para cancelar');
            return;
        }
        
        // Filtrar solo ofertas abiertas sin peer
        const ofertasAbiertas = ofertas.filter(o => 
            o.status === 'open' && !o.peer_id
        );
        
        if (ofertasAbiertas.length === 0) {
            console.log('⚠️  No tienes ofertas abiertas sin peer');
            console.log('\n📊 Tus ofertas actuales:');
            ofertas.forEach((o, i) => {
                const tipo = o.type === 'buy' ? 'COMPRA' : 'VENTA';
                const estado = o.status;
                const peer = o.peer_id ? '(con peer)' : '(sin peer)';
                console.log(`   ${i + 1}. [${tipo}] ${o.amount} USD - ${estado} ${peer}`);
            });
            return;
        }
        
        // Mostrar ofertas disponibles para cancelar
        console.log('✅ Ofertas disponibles para cancelar:\n');
        ofertasAbiertas.forEach((oferta, index) => {
            const tipo = oferta.type === 'buy' ? '🟢 COMPRA' : '🔴 VENTA';
            const amount = parseFloat(oferta.amount);
            const receive = parseFloat(oferta.receive);
            const tasa = (receive / amount).toFixed(2);
            const fecha = new Date(oferta.created_at).toLocaleString('es-ES');
            
            console.log(`${index + 1}. ${tipo}`);
            console.log(`   🆔 UUID: ${oferta.uuid}`);
            console.log(`   💰 Monto: ${amount} USD → ${receive} CUP`);
            console.log(`   📊 Tasa: ${tasa} CUP/USD`);
            console.log(`   💱 Moneda: ${oferta.coin}`);
            console.log(`   📅 Creada: ${fecha}`);
            console.log(`   🔗 Link: https://qvapay.com/p2p/${oferta.uuid}`);
            console.log('');
        });
        
        // Para este test, cancelamos la primera oferta (la más antigua)
        const ofertaACancelar = ofertasAbiertas[0];
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('🎯 CANCELANDO PRIMERA OFERTA (la más antigua)...\n');
        console.log(`UUID: ${ofertaACancelar.uuid}`);
        console.log(`Tipo: ${ofertaACancelar.type === 'buy' ? 'COMPRA' : 'VENTA'}`);
        console.log(`Monto: ${ofertaACancelar.amount} USD`);
        console.log('═══════════════════════════════════════════════════════\n');
        
        // Intentar cancelar
        const resultado = await cancelarOferta(config.token, ofertaACancelar.uuid);
        
        if (resultado.exito) {
            console.log('✅ ÉXITO: Oferta cancelada correctamente\n');
            console.log('📋 Respuesta de la API:');
            console.log(JSON.stringify(resultado.datos, null, 2));
        } else {
            console.log('❌ ERROR: No se pudo cancelar la oferta\n');
            console.log('📋 Error:');
            console.log(resultado.error);
            
            if (resultado.datos) {
                console.log('\n📋 Respuesta completa de la API:');
                console.log(JSON.stringify(resultado.datos, null, 2));
            }
        }
        
        // Verificar estado después de cancelar
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('🔍 Verificando estado después de cancelar...\n');
        
        await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2s
        
        const ofertasActualizadas = await obtenerMisOfertas(config.token);
        const ofertaVerificada = ofertasActualizadas.find(o => o.uuid === ofertaACancelar.uuid);
        
        if (ofertaVerificada) {
            console.log(`⚠️  La oferta aún existe en el sistema`);
            console.log(`   Estado: ${ofertaVerificada.status}`);
            console.log(`   ¿Tiene peer?: ${ofertaVerificada.peer_id ? 'Sí' : 'No'}`);
        } else {
            console.log('✅ La oferta ya no aparece en tu lista (cancelada correctamente)');
        }
        
    } catch (error) {
        console.error('\n❌ Error en el test:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Ejecutar test
console.log('\n');
testCancelarOferta()
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
