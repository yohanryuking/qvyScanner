/**
 * 🔍 ANÁLISIS: ¿Por qué no se puede cancelar?
 * 
 * Investiga el estado completo de las ofertas para entender
 * por qué la API dice que no están disponibles para cancelar
 */

const fetch = require('node-fetch');
const config = require('../config-gestor-ofertas');
const { obtenerMisOfertas } = require('../utils/api-ofertas');

async function analizarOfertas() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   🔍 ANÁLISIS: Estado de Ofertas                     ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
    
    try {
        console.log('📋 Obteniendo todas tus ofertas...\n');
        const ofertas = await obtenerMisOfertas(config.token);
        
        if (ofertas.length === 0) {
            console.log('⚠️  No tienes ofertas');
            return;
        }
        
        console.log(`✅ Encontradas ${ofertas.length} ofertas\n`);
        console.log('═══════════════════════════════════════════════════════\n');
        
        ofertas.forEach((oferta, index) => {
            const tipo = oferta.type === 'buy' ? '🟢 COMPRA' : '🔴 VENTA';
            const edad = calcularMinutos(oferta.created_at);
            
            console.log(`${index + 1}. ${tipo} - ${oferta.amount} USD`);
            console.log(`   UUID: ${oferta.uuid}`);
            console.log(`   Estado: ${oferta.status}`);
            console.log(`   Moneda: ${oferta.coin}`);
            console.log(`   Edad: ${edad} minutos`);
            console.log(`   Peer ID: ${oferta.peer_id || 'ninguno'}`);
            console.log(`   Owner ID: ${oferta.owner_id || 'N/A'}`);
            console.log(`   Private: ${oferta.private ? 'Sí' : 'No'}`);
            console.log(`   Only KYC: ${oferta.only_kyc ? 'Sí' : 'No'}`);
            console.log(`   Only VIP: ${oferta.only_vip ? 'Sí' : 'No'}`);
            
            // Mostrar objeto completo
            console.log(`\n   📋 Objeto completo:`);
            console.log('   ' + JSON.stringify(oferta, null, 2).split('\n').join('\n   '));
            
            console.log('\n───────────────────────────────────────────────────────\n');
        });
        
        // Análisis de cancelabilidad
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 ANÁLISIS DE CANCELABILIDAD');
        console.log('═══════════════════════════════════════════════════════\n');
        
        const ofertasAbiertas = ofertas.filter(o => o.status === 'open');
        const ofertasSinPeer = ofertas.filter(o => !o.peer_id);
        const ofertasCancelables = ofertas.filter(o => o.status === 'open' && !o.peer_id);
        
        console.log(`✅ Ofertas abiertas (status=open): ${ofertasAbiertas.length}`);
        console.log(`✅ Ofertas sin peer: ${ofertasSinPeer.length}`);
        console.log(`✅ Ofertas cancelables (open + sin peer): ${ofertasCancelables.length}`);
        console.log('');
        
        if (ofertasCancelables.length > 0) {
            console.log('💡 TEORÍA: Las ofertas parecen cancelables pero la API dice que no.');
            console.log('');
            console.log('Posibles causas:');
            console.log('   1. Las ofertas creadas por API no pueden cancelarse por API');
            console.log('   2. Se requiere cancelar desde la web de QvaPay');
            console.log('   3. Hay un campo adicional que indica cancelabilidad');
            console.log('   4. Las ofertas necesitan cierto tiempo antes de cancelarse');
            console.log('   5. El endpoint de cancelación está deshabilitado');
            console.log('');
            console.log('🧪 PRUEBA MANUAL:');
            console.log(`   1. Ve a: https://qvapay.com/p2p/${ofertasCancelables[0].uuid}`);
            console.log('   2. Intenta cancelar desde la web');
            console.log('   3. Si funciona: el problema es con la API');
            console.log('   4. Si no funciona: hay una restricción en la oferta');
        }
        
        console.log('');
        console.log('═══════════════════════════════════════════════════════\n');
        
        // Intentar obtener info de una oferta específica
        if (ofertas.length > 0) {
            console.log('🔍 Obteniendo detalles de la primera oferta desde la API...\n');
            const primeraOferta = ofertas[0];
            
            try {
                const response = await fetch(`https://api.qvapay.com/p2p/${primeraOferta.uuid}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${config.token}`
                    }
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    console.log('✅ Detalles obtenidos:');
                    console.log(JSON.stringify(data, null, 2));
                    
                    // Buscar campos que indiquen cancelabilidad
                    if (data.can_cancel !== undefined) {
                        console.log(`\n🔑 Campo can_cancel: ${data.can_cancel}`);
                    }
                    if (data.is_cancellable !== undefined) {
                        console.log(`🔑 Campo is_cancellable: ${data.is_cancellable}`);
                    }
                    if (data.cancellable !== undefined) {
                        console.log(`🔑 Campo cancellable: ${data.cancellable}`);
                    }
                } else {
                    console.log(`⚠️  Error ${response.status}: ${JSON.stringify(data)}`);
                }
            } catch (error) {
                console.log(`❌ Error al obtener detalles: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

function calcularMinutos(fechaCreacion) {
    const ahora = new Date();
    const creacion = new Date(fechaCreacion);
    const diff = ahora - creacion;
    return Math.floor(diff / (1000 * 60));
}

// Ejecutar
console.log('\n');
analizarOfertas()
    .then(() => {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('✅ Análisis completado');
        console.log('═══════════════════════════════════════════════════════\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Error fatal:', error);
        process.exit(1);
    });
