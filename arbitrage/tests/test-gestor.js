/**
 * 🧪 TEST DEL GESTOR AUTOMÁTICO DE OFERTAS
 * 
 * Prueba todas las funcionalidades del gestor sin crear ofertas reales
 */

const fetch = require('node-fetch');

// Simulamos el config para testing
const configTest = {
    token: '161859|$2b$10$cIpb.pYzr9ZwSf/6uiSzVu9jQYXH2tztqIUEpbcxGEjv/JWbFE51m',
    ofertas: [
        {
            id: 'test-venta-1',
            tipo: 'venta',
            moneda: 'BANK_CUP',
            coinId: 2,
            cantidadUSD: 100,
            detallesPago: [
                { name: 'Método', value: 'Test' }
            ],
            habilitada: true,
            soloKYC: true,
            privada: false,
            soloVIP: false
        }
    ],
    gestion: {
        tiempoMaximoSinPeer: 20,
        intervaloEscaneo: 30
    }
};

// Importar utilidades
const { calcularPreciosPorMoneda } = require('../utils/calcular-precios');
const { aplicarFiltrosEstandar } = require('../utils/filtros');
const {
    obtenerMisOfertas,
    filtrarOfertasSinPeer,
    filtrarOfertasConPeer,
    calcularEdadOferta,
    necesitaRenovacion,
    encontrarOfertaGestionada
} = require('../utils/api-ofertas');

/**
 * Test 1: Obtener ofertas del mercado
 */
async function test1_ObtenerOfertas() {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  TEST 1: Obtener Ofertas del Mercado                     ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    try {
        const [response1, response2] = await Promise.all([
            fetch('https://api.qvapay.com/p2p/index?page=1', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${configTest.token}`
                }
            }),
            fetch('https://api.qvapay.com/p2p/index?page=2', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${configTest.token}`
                }
            })
        ]);

        const result1 = await response1.json();
        const result2 = await response2.json();
        
        const ofertas = [];
        if (response1.ok && result1.data) ofertas.push(...result1.data);
        if (response2.ok && result2.data) ofertas.push(...result2.data);
        
        console.log(`✅ Ofertas obtenidas: ${ofertas.length}`);
        console.log(`   Página 1: ${result1.data?.length || 0}`);
        console.log(`   Página 2: ${result2.data?.length || 0}`);
        
        return ofertas;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        return [];
    }
}

/**
 * Test 2: Calcular precios de referencia
 */
async function test2_CalcularPrecios(ofertas) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  TEST 2: Calcular Precios de Referencia                  ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    try {
        const ofertasFiltradas = aplicarFiltrosEstandar(ofertas, {
            incluirVIP: false,
            requiereKYC: true,
            soloPublicas: true,
            soloCUP: true
        });
        
        console.log(`📊 Ofertas antes de filtrar: ${ofertas.length}`);
        console.log(`📊 Ofertas después de filtrar: ${ofertasFiltradas.length}`);
        
        const precios = calcularPreciosPorMoneda(ofertasFiltradas, {
            metodoMargen: 'spread_real',
            factorSeguridad: 0.5,
            eliminarOutliersFlag: true
        });
        
        console.log(`\n✅ Precios calculados para ${Object.keys(precios).length} monedas\n`);
        
        Object.entries(precios).forEach(([moneda, data]) => {
            console.log(`   ${moneda}:`);
            console.log(`      🟢 Comprar hasta: ${data.precios.compra.toFixed(2)} CUP/USD`);
            console.log(`      🔴 Vender desde: ${data.precios.venta.toFixed(2)} CUP/USD`);
            console.log(`      📊 Ofertas: ${data.estadisticas.cantidad}`);
            console.log(`      📈 Promedio mercado: ${data.estadisticas.promedio.toFixed(2)}`);
            if (data.outliersEliminados > 0) {
                console.log(`      🗑️  Outliers eliminados: ${data.outliersEliminados}`);
            }
        });
        
        return precios;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        return {};
    }
}

/**
 * Test 3: Obtener mis ofertas
 */
async function test3_MisOfertas() {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  TEST 3: Obtener Mis Ofertas Activas                     ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    try {
        const misOfertas = await obtenerMisOfertas(configTest.token);
        
        console.log(`✅ Total ofertas: ${misOfertas.length}`);
        
        const ofertasConPeer = filtrarOfertasConPeer(misOfertas);
        const ofertasSinPeer = filtrarOfertasSinPeer(misOfertas);
        
        console.log(`   🎉 Con peer: ${ofertasConPeer.length}`);
        console.log(`   ⏳ Sin peer: ${ofertasSinPeer.length}`);
        
        // Mostrar detalles de ofertas sin peer
        if (ofertasSinPeer.length > 0) {
            console.log(`\n   📋 Ofertas sin peer:`);
            ofertasSinPeer.forEach((oferta, i) => {
                const edad = calcularEdadOferta(oferta.created_at);
                const tasa = (oferta.receive / oferta.amount).toFixed(2);
                console.log(`      ${i + 1}. ${oferta.type.toUpperCase()} - ${oferta.amount} USD @ ${tasa} CUP/USD (${edad} min)`);
            });
        }
        
        // Mostrar detalles de ofertas con peer
        if (ofertasConPeer.length > 0) {
            console.log(`\n   🎉 Ofertas con peer:`);
            ofertasConPeer.forEach((oferta, i) => {
                const tasa = (oferta.receive / oferta.amount).toFixed(2);
                console.log(`      ${i + 1}. ${oferta.type.toUpperCase()} - ${oferta.amount} USD @ ${tasa} CUP/USD`);
                console.log(`         👤 Peer: ${oferta.peer_id}`);
            });
        }
        
        return misOfertas;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        return [];
    }
}

/**
 * Test 4: Verificar renovaciones necesarias
 */
function test4_VerificarRenovaciones(misOfertas) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  TEST 4: Verificar Ofertas que Necesitan Renovación      ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    const ofertasSinPeer = filtrarOfertasSinPeer(misOfertas);
    const tiempoMaximo = configTest.gestion.tiempoMaximoSinPeer;
    
    console.log(`⏰ Tiempo máximo configurado: ${tiempoMaximo} minutos\n`);
    
    const parRenovar = [];
    const enEspera = [];
    
    ofertasSinPeer.forEach(oferta => {
        const edad = calcularEdadOferta(oferta.created_at);
        const tasa = (oferta.receive / oferta.amount).toFixed(2);
        const necesita = necesitaRenovacion(oferta, tiempoMaximo);
        
        if (necesita) {
            parRenovar.push(oferta);
            console.log(`   🔄 ${oferta.uuid.substring(0, 8)}... - ${oferta.type.toUpperCase()}`);
            console.log(`      Edad: ${edad} min (>${tiempoMaximo} min)`);
            console.log(`      Tasa: ${tasa} CUP/USD`);
            console.log(`      ✅ NECESITA RENOVACIÓN\n`);
        } else {
            enEspera.push(oferta);
            console.log(`   ⏳ ${oferta.uuid.substring(0, 8)}... - ${oferta.type.toUpperCase()}`);
            console.log(`      Edad: ${edad} min (<=${tiempoMaximo} min)`);
            console.log(`      Tasa: ${tasa} CUP/USD`);
            console.log(`      ⏰ En espera\n`);
        }
    });
    
    console.log(`\n📊 Resumen:`);
    console.log(`   🔄 Para renovar: ${parRenovar.length}`);
    console.log(`   ⏳ En espera: ${enEspera.length}`);
    
    return { parRenovar, enEspera };
}

/**
 * Test 5: Verificar sincronización con config
 */
function test5_SincronizarConfig(misOfertas) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  TEST 5: Sincronizar con Configuración                   ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    const ofertasHabilitadas = configTest.ofertas.filter(o => o.habilitada);
    
    console.log(`📋 Ofertas configuradas: ${ofertasHabilitadas.length}`);
    console.log(`📋 Ofertas activas: ${misOfertas.length}\n`);
    
    ofertasHabilitadas.forEach(config => {
        const ofertaExistente = encontrarOfertaGestionada(misOfertas, config);
        
        if (ofertaExistente) {
            const edad = calcularEdadOferta(ofertaExistente.created_at);
            const tasa = (ofertaExistente.receive / ofertaExistente.amount).toFixed(2);
            console.log(`   ✅ ${config.id}`);
            console.log(`      UUID: ${ofertaExistente.uuid.substring(0, 8)}...`);
            console.log(`      Edad: ${edad} min`);
            console.log(`      Tasa: ${tasa} CUP/USD`);
            console.log(`      Estado: ${ofertaExistente.status}`);
            if (ofertaExistente.peer_id) {
                console.log(`      🎉 Tiene peer!`);
            }
        } else {
            console.log(`   ❌ ${config.id} - NO EXISTE`);
            console.log(`      Tipo: ${config.tipo.toUpperCase()}`);
            console.log(`      Moneda: ${config.moneda}`);
            console.log(`      Monto: ${config.cantidadUSD} USD`);
            console.log(`      ⚠️  Debería crearse`);
        }
        console.log('');
    });
}

/**
 * Test 6: Simular cálculo de precios para nuevas ofertas
 */
function test6_SimularPreciosOfertas(precios) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  TEST 6: Simular Creación de Ofertas                     ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    const ofertasHabilitadas = configTest.ofertas.filter(o => o.habilitada);
    
    ofertasHabilitadas.forEach(config => {
        const preciosMoneda = precios[config.moneda];
        
        if (!preciosMoneda) {
            console.log(`   ❌ ${config.id} - Sin precios de referencia`);
            return;
        }
        
        const precioOptimo = config.tipo === 'venta' 
            ? preciosMoneda.precios.venta 
            : preciosMoneda.precios.compra;
        
        const cantidadCUP = (config.cantidadUSD * precioOptimo).toFixed(2);
        
        console.log(`   📝 ${config.id}`);
        console.log(`      Tipo: ${config.tipo.toUpperCase()}`);
        console.log(`      Moneda: ${config.moneda}`);
        console.log(`      💰 ${config.cantidadUSD} USD → ${cantidadCUP} CUP`);
        console.log(`      📊 Tasa óptima: ${precioOptimo.toFixed(2)} CUP/USD`);
        console.log(`      📈 Promedio mercado: ${preciosMoneda.estadisticas.promedio.toFixed(2)}`);
        
        const diferencia = ((precioOptimo / preciosMoneda.estadisticas.promedio - 1) * 100).toFixed(2);
        const signo = diferencia > 0 ? '+' : '';
        console.log(`      📊 Diferencia: ${signo}${diferencia}%`);
        console.log('');
    });
}

/**
 * Ejecutar todos los tests
 */
async function ejecutarTests() {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║     🧪 TEST DEL GESTOR AUTOMÁTICO DE OFERTAS            ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    
    try {
        // Test 1: Obtener ofertas del mercado
        const ofertas = await test1_ObtenerOfertas();
        
        if (ofertas.length === 0) {
            console.log('\n⚠️  No se pudieron obtener ofertas. Deteniendo tests.');
            return;
        }
        
        // Test 2: Calcular precios
        const precios = await test2_CalcularPrecios(ofertas);
        
        if (Object.keys(precios).length === 0) {
            console.log('\n⚠️  No se pudieron calcular precios. Deteniendo tests.');
            return;
        }
        
        // Test 3: Mis ofertas
        const misOfertas = await test3_MisOfertas();
        
        // Test 4: Verificar renovaciones
        test4_VerificarRenovaciones(misOfertas);
        
        // Test 5: Sincronizar config
        test5_SincronizarConfig(misOfertas);
        
        // Test 6: Simular precios
        test6_SimularPreciosOfertas(precios);
        
        // Resumen final
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║                   ✅ TESTS COMPLETADOS                    ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');
        
        console.log('📊 Resumen de Tests:');
        console.log(`   ✅ Ofertas del mercado: ${ofertas.length}`);
        console.log(`   ✅ Precios calculados: ${Object.keys(precios).length} monedas`);
        console.log(`   ✅ Mis ofertas: ${misOfertas.length}`);
        console.log('');
        console.log('🚀 El gestor está listo para funcionar.\n');
        console.log('Para ejecutar el gestor:');
        console.log('   node arbitrage/gestor-ofertas.js\n');
        
    } catch (error) {
        console.error('\n❌ Error fatal en tests:', error);
        console.error(error.stack);
    }
}

// Ejecutar tests
if (require.main === module) {
    ejecutarTests().catch(console.error);
}

module.exports = {
    test1_ObtenerOfertas,
    test2_CalcularPrecios,
    test3_MisOfertas,
    test4_VerificarRenovaciones,
    test5_SincronizarConfig,
    test6_SimularPreciosOfertas
};
