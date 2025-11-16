/**
 * 🧪 TEST - ANÁLISIS COMPLETO: TENDENCIA + PRECIOS
 * 
 * Combina el análisis de sentimiento del mercado con los precios calculados
 */

const {
    analizarMercadoRapido,
    obtenerResumenCompacto
} = require('../utils/detector-tendencia');
const { calcularPreciosPorMoneda } = require('../utils/calcular-precios');
const { aplicarFiltrosEstandar } = require('../utils/filtros');
const credenciales = require('../credenciales');
const fetch = require('node-fetch');

/**
 * Obtener ofertas del mercado
 */
async function obtenerOfertas() {
    try {
        const [response1, response2] = await Promise.all([
            fetch('https://api.qvapay.com/p2p/index?page=1', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${credenciales.token}`
                }
            }),
            fetch('https://api.qvapay.com/p2p/index?page=2', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${credenciales.token}`
                }
            })
        ]);

        const result1 = await response1.json();
        const result2 = await response2.json();
        
        const ofertas = [];
        
        if (response1.ok && result1.data) ofertas.push(...result1.data);
        if (response2.ok && result2.data) ofertas.push(...result2.data);
        
        return ofertas;
        
    } catch (error) {
        console.error('❌ Error al obtener ofertas:', error.message);
        return [];
    }
}

/**
 * Análisis completo del mercado
 */
async function analisisCompleto() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║     📊 ANÁLISIS COMPLETO DEL MERCADO P2P                ║');
    console.log('║        (TENDENCIA + PRECIOS DE ARBITRAJE)               ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    const ahora = new Date().toLocaleString('es-ES', {
        dateStyle: 'full',
        timeStyle: 'medium'
    });
    console.log(`🕐 ${ahora}\n`);
    
    // ============================================================
    // PARTE 1: ANÁLISIS DE TENDENCIA/SENTIMIENTO DEL MERCADO
    // ============================================================
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   PARTE 1: 📈 SENTIMIENTO DEL MERCADO');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const analisisTendencia = await analizarMercadoRapido(credenciales.token, {
        moneda: ['BANK_CUP', 'BOLSATM'],
        soloKYC: true,
        excluirVIP: true,
        soloPublicas: true
    });
    
    if (!analisisTendencia) {
        console.error('❌ No se pudo obtener análisis de tendencia');
        return;
    }
    
    const resumen = obtenerResumenCompacto(analisisTendencia);
    
    // Mostrar sentimiento
    console.log(`${resumen.icono} SENTIMIENTO: ${resumen.sentimiento} (${resumen.intensidad})`);
    console.log(`   ${resumen.descripcion}\n`);
    
    console.log('📊 PROPORCIÓN DEL MERCADO:');
    console.log(`   🟢 Ofertas de COMPRA: ${analisisTendencia.cantidadCompras} (${resumen.proporcionCompras}%)`);
    console.log(`   🔴 Ofertas de VENTA: ${analisisTendencia.cantidadVentas} (${resumen.proporcionVentas}%)`);
    console.log(`   📊 Diferencia: ${resumen.diferencia}%\n`);
    
    // Barra visual
    const anchoTotal = 50;
    const comprasBarras = Math.round((parseFloat(resumen.proporcionCompras) / 100) * anchoTotal);
    const ventasBarras = anchoTotal - comprasBarras;
    
    console.log('📊 VISUALIZACIÓN:');
    console.log(`   🟢 COMPRA [${'█'.repeat(comprasBarras)}${' '.repeat(ventasBarras)}] ${resumen.proporcionCompras}%`);
    console.log(`   🔴 VENTA  [${'█'.repeat(ventasBarras)}${' '.repeat(comprasBarras)}] ${resumen.proporcionVentas}%\n`);
    
    console.log('💡 INTERPRETACIÓN:');
    if (analisisTendencia.sentimiento === 'ALCISTA') {
        console.log('   ✅ Presión al ALZA en el precio del USD');
        console.log('   💡 Estrategia: Prioriza VENDER USD (mayor demanda)');
        console.log('   ⚠️  Comprar USD puede ser más difícil y caro\n');
    } else if (analisisTendencia.sentimiento === 'BAJISTA') {
        console.log('   ✅ Presión a la BAJA en el precio del USD');
        console.log('   💡 Estrategia: Prioriza COMPRAR USD (mayor oferta)');
        console.log('   ✅ Abundancia de ofertas para adquirir USD barato\n');
    } else {
        console.log('   ⚖️  Mercado equilibrado, sin presión clara');
        console.log('   💡 Estrategia: Arbitraje normal con ambos lados\n');
    }
    
    // ============================================================
    // PARTE 2: CÁLCULO DE PRECIOS DE ARBITRAJE
    // ============================================================
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   PARTE 2: 💰 PRECIOS DE ARBITRAJE');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const ofertasOriginales = await obtenerOfertas();
    
    if (ofertasOriginales.length === 0) {
        console.error('❌ No se pudieron obtener ofertas');
        return;
    }
    
    const ofertasFiltradas = aplicarFiltrosEstandar(ofertasOriginales, {
        incluirVIP: false,
        requiereKYC: true,
        soloPublicas: true,
        soloCUP: true
    });
    
    const precios = calcularPreciosPorMoneda(ofertasFiltradas, {
        metodoMargen: 'spread_real',
        factorSeguridad: 0.5,
        eliminarOutliersFlag: true
    });
    
    if (!precios || Object.keys(precios).length === 0) {
        console.error('❌ No se pudieron calcular precios');
        return;
    }
    
    // Mostrar precios calculados
    Object.entries(precios).forEach(([moneda, datos]) => {
        console.log(`💱 ${moneda}`);
        console.log(`   📊 Ofertas analizadas: ${datos.estadisticas.cantidad}`);
        console.log(`   📈 Tasa promedio del mercado: ${datos.estadisticas.promedio.toFixed(2)} CUP/USD`);
        
        if (datos.margen) {
            console.log(`   🎯 Margen calculado: ${datos.margen.margen} CUP (método: ${datos.margen.metodo})`);
        }
        
        console.log(`\n   💰 PRECIOS RECOMENDADOS:`);
        console.log(`   🟢 COMPRA: ${datos.precios.compra.toFixed(2)} CUP/USD`);
        console.log(`   🔴 VENTA:  ${datos.precios.venta.toFixed(2)} CUP/USD`);
        console.log(`   📊 Spread: ${datos.precios.spread.toFixed(2)} CUP`);
        console.log(`   💵 Ganancia: ${datos.precios.gananciaPotencial.toFixed(2)} CUP por USD (${datos.precios.porcentajeGanancia.toFixed(2)}%)\n`);
    });
    
    // ============================================================
    // PARTE 3: ESTRATEGIA RECOMENDADA
    // ============================================================
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   PARTE 3: 🎯 ESTRATEGIA RECOMENDADA');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const bankCupPrecios = precios['BANK_CUP'];
    
    if (bankCupPrecios) {
        const precioCompra = bankCupPrecios.precios.compra;
        const precioVenta = bankCupPrecios.precios.venta;
        const tasaPromedioCompras = parseFloat(analisisTendencia.tasaPromedioCompras);
        const tasaPromedioVentas = parseFloat(analisisTendencia.tasaPromedioVentas);
        
        console.log('📊 ANÁLISIS COMBINADO:\n');
        
        // Análisis de compra
        console.log('🟢 COMPRAR USD (crear oferta type="sell"):');
        console.log(`   • Tu precio máximo: ${precioCompra.toFixed(2)} CUP/USD`);
        console.log(`   • Tasa promedio actual de ventas: ${tasaPromedioVentas.toFixed(2)} CUP/USD`);
        
        if (tasaPromedioVentas <= precioCompra) {
            const ahorro = precioCompra - tasaPromedioVentas;
            console.log(`   ✅ Buena oportunidad: El mercado está ${ahorro.toFixed(2)} CUP por debajo de tu máximo`);
        } else {
            const sobreprecio = tasaPromedioVentas - precioCompra;
            console.log(`   ⚠️  Mercado caro: Está ${sobreprecio.toFixed(2)} CUP por encima de tu máximo`);
        }
        
        if (analisisTendencia.sentimiento === 'BAJISTA') {
            console.log(`   ${resumen.icono} Sentimiento favorable: Mucha gente vendiendo USD`);
            console.log(`   💡 Estrategia: ACTIVA - Compra agresivamente`);
        } else if (analisisTendencia.sentimiento === 'ALCISTA') {
            console.log(`   ${resumen.icono} Sentimiento desfavorable: Poca gente vendiendo USD`);
            console.log(`   💡 Estrategia: DEFENSIVA - Espera mejores precios`);
        } else {
            console.log(`   ${resumen.icono} Sentimiento neutral`);
            console.log(`   💡 Estrategia: NORMAL - Compra según tu precio calculado`);
        }
        
        console.log('');
        
        // Análisis de venta
        console.log('🔴 VENDER USD (crear oferta type="buy"):');
        console.log(`   • Tu precio mínimo: ${precioVenta.toFixed(2)} CUP/USD`);
        console.log(`   • Tasa promedio actual de compras: ${tasaPromedioCompras.toFixed(2)} CUP/USD`);
        
        if (tasaPromedioCompras >= precioVenta) {
            const gananciaExtra = tasaPromedioCompras - precioVenta;
            console.log(`   ✅ Buena oportunidad: El mercado está ${gananciaExtra.toFixed(2)} CUP por encima de tu mínimo`);
        } else {
            const deficit = precioVenta - tasaPromedioCompras;
            console.log(`   ⚠️  Mercado bajo: Está ${deficit.toFixed(2)} CUP por debajo de tu mínimo`);
        }
        
        if (analisisTendencia.sentimiento === 'ALCISTA') {
            console.log(`   ${resumen.icono} Sentimiento favorable: Mucha gente comprando USD`);
            console.log(`   💡 Estrategia: ACTIVA - Vende agresivamente`);
        } else if (analisisTendencia.sentimiento === 'BAJISTA') {
            console.log(`   ${resumen.icono} Sentimiento desfavorable: Poca gente comprando USD`);
            console.log(`   💡 Estrategia: DEFENSIVA - Puede que tardes en vender`);
        } else {
            console.log(`   ${resumen.icono} Sentimiento neutral`);
            console.log(`   💡 Estrategia: NORMAL - Vende según tu precio calculado`);
        }
        
        console.log('\n');
        
        // Recomendación final
        console.log('🎯 RECOMENDACIÓN FINAL:\n');
        
        if (analisisTendencia.sentimiento === 'BAJISTA') {
            console.log('   📍 ENFOQUE: Acumular USD (COMPRAR)');
            console.log(`   • Hay ${analisisTendencia.cantidadVentas} ofertas de venta disponibles`);
            console.log('   • Aprovecha la abundancia de oferta para comprar barato');
            console.log(`   • Compra hasta: ${precioCompra.toFixed(2)} CUP/USD`);
            console.log('   • Objetivo: Acumular USD para vender cuando el mercado esté alcista');
        } else if (analisisTendencia.sentimiento === 'ALCISTA') {
            console.log('   📍 ENFOQUE: Liquidar USD (VENDER)');
            console.log(`   • Hay ${analisisTendencia.cantidadCompras} ofertas de compra esperando`);
            console.log('   • Aprovecha la demanda alta para vender caro');
            console.log(`   • Vende desde: ${precioVenta.toFixed(2)} CUP/USD`);
            console.log('   • Objetivo: Maximizar ganancia mientras hay demanda');
        } else {
            console.log('   📍 ENFOQUE: Arbitraje balanceado (COMPRA Y VENTA)');
            console.log('   • Mercado equilibrado, opera en ambos sentidos');
            console.log(`   • Compra hasta: ${precioCompra.toFixed(2)} CUP/USD`);
            console.log(`   • Vende desde: ${precioVenta.toFixed(2)} CUP/USD`);
            console.log(`   • Ganancia por ciclo: ${bankCupPrecios.precios.gananciaPotencial.toFixed(2)} CUP por USD`);
        }
    }
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   ✅ ANÁLISIS COMPLETADO');
    console.log('═══════════════════════════════════════════════════════════\n');
}

// Ejecutar
analisisCompleto().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
});
