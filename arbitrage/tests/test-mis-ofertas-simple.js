/**
 * 🧪 Test - Verificar Mis Ofertas Creadas
 */

const credenciales = require('../credenciales');
const { obtenerMisOfertas } = require('../utils/api-ofertas');

async function testVerMisOfertas() {
    console.log('🧪 TEST: Ver mis ofertas\n');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    try {
        console.log('📋 Obteniendo mis ofertas...');
        const ofertas = await obtenerMisOfertas(credenciales.token);
        
        console.log(`\n✅ Total de ofertas: ${ofertas.length}\n`);
        
        if (ofertas.length === 0) {
            console.log('💡 No tienes ofertas activas\n');
            return;
        }
        
        // Mostrar resumen
        const ofertasAbiertas = ofertas.filter(o => o.status === 'open');
        const ofertasConPeer = ofertas.filter(o => o.peer_id);
        
        console.log('📊 RESUMEN:');
        console.log(`   🟢 Abiertas: ${ofertasAbiertas.length}`);
        console.log(`   🎉 Con peer: ${ofertasConPeer.length}`);
        console.log(`   📦 Otras: ${ofertas.length - ofertasAbiertas.length}\n`);
        
        // Mostrar últimas 5 ofertas
        console.log('📋 ÚLTIMAS 5 OFERTAS:\n');
        
        ofertas.slice(0, 5).forEach((oferta, index) => {
            const tipo = oferta.type === 'buy' ? '🟢 COMPRA' : '🔴 VENTA';
            const estado = oferta.status === 'open' ? '✅' : '❌';
            const peer = oferta.peer_id ? '👤 CON PEER' : '⏳ SIN PEER';
            const amount = parseFloat(oferta.amount);
            const receive = parseFloat(oferta.receive);
            const tasa = (receive / amount).toFixed(2);
            
            console.log(`${index + 1}. ${tipo} ${estado}`);
            console.log(`   UUID: ${oferta.uuid}`);
            console.log(`   💰 ${amount} USD → ${receive} CUP`);
            console.log(`   📊 Tasa: ${tasa} CUP/USD`);
            console.log(`   💱 Moneda: ${oferta.coin}`);
            console.log(`   📅 Creada: ${new Date(oferta.created_at).toLocaleString('es-ES')}`);
            console.log(`   ${peer}`);
            console.log(`   🔗 https://qvapay.com/p2p/${oferta.uuid}\n`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testVerMisOfertas();
