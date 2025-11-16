/**
 * 💰 CALCULADORA DE PRECIOS DE ARBITRAJE - QvaPay
 * 
 * Calcula precios óptimos de compra/venta basándose en las primeras 100 ofertas del mercado.
 * Análisis rápido y preciso con margen adaptable.
 */

const fetch = require('node-fetch');
const { calcularPreciosPorMoneda, formatearResultado } = require('./utils/calcular-precios');
const { aplicarFiltrosEstandar, estadisticasFiltrado } = require('./utils/filtros');
const { obtenerConfiguracionEstrategia, mostrarEstrategia } = require('./config-estrategia');
const credenciales = require('./credenciales');

const TOKEN = credenciales.token;

async function obtenerOfertas() {
    try {
        // Obtener páginas 1 y 2 en paralelo para mayor velocidad
        const [response1, response2] = await Promise.all([
            fetch('https://api.qvapay.com/p2p/index?page=1', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${TOKEN}`
                }
            }),
            fetch('https://api.qvapay.com/p2p/index?page=2', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${TOKEN}`
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

async function calcularPrecios() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║     💰 CALCULADORA DE PRECIOS - ARBITRAJE P2P       ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
    
    const tiempoInicio = Date.now();
    
    // 1. Obtener ofertas
    console.log('📥 Obteniendo ofertas del mercado...');
    const ofertasOriginales = await obtenerOfertas();
    
    if (ofertasOriginales.length === 0) {
        console.log('❌ No se pudieron obtener ofertas\n');
        return;
    }
    
    console.log(`   ✅ ${ofertasOriginales.length} ofertas obtenidas\n`);
    
    // 2. Aplicar filtros
    console.log('🔍 Filtrando ofertas...');
    const ofertas = aplicarFiltrosEstandar(ofertasOriginales, {
        incluirVIP: false,
        requiereKYC: true,
        soloPublicas: true,
        soloCUP: true
    });
    
    const stats = estadisticasFiltrado(ofertasOriginales.length, ofertas.length);
    console.log(`   ✅ ${stats.filtrada} ofertas válidas (eliminadas ${stats.eliminadas})\n`);
    
    // 3. Calcular precios
    console.log('💰 Calculando precios óptimos...\n');
    mostrarEstrategia();
    console.log('');
    
    const configEstrategia = obtenerConfiguracionEstrategia();
    const precios = calcularPreciosPorMoneda(ofertas, configEstrategia);
    
    // 4. Mostrar resultados
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║              📊 PRECIOS RECOMENDADOS                 ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    
    const monedasOrdenadas = Object.entries(precios)
        .sort((a, b) => b[1].estadisticas.cantidad - a[1].estadisticas.cantidad);
    
    monedasOrdenadas.forEach(([moneda, resultado]) => {
        if (resultado.estadisticas && resultado.estadisticas.cantidad >= 3) {
            console.log(formatearResultado(resultado, moneda));
            console.log('───────────────────────────────────────────────────────');
        }
    });
    
    // 5. Resumen ejecutivo
    const tiempoTotal = ((Date.now() - tiempoInicio) / 1000).toFixed(2);
    
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║                    📋 RESUMEN                        ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
    
    const monedasAnalizadas = monedasOrdenadas.filter(([, r]) => 
        r.estadisticas && r.estadisticas.cantidad >= 3
    );
    
    console.log(`⏱️  Tiempo de análisis: ${tiempoTotal}s`);
    console.log(`📊 Ofertas analizadas: ${ofertas.length}`);
    console.log(`💱 Monedas: ${monedasAnalizadas.length}\n`);
    
    // Tabla resumida de precios
    if (monedasAnalizadas.length > 0) {
        console.log('┌──────────────┬────────────┬────────────┬──────────────┐');
        console.log('│   MONEDA     │  COMPRA    │   VENTA    │   GANANCIA   │');
        console.log('├──────────────┼────────────┼────────────┼──────────────┤');
        
        monedasAnalizadas.forEach(([moneda, resultado]) => {
            const compra = resultado.precios.compra.toFixed(2).padStart(9);
            const venta = resultado.precios.venta.toFixed(2).padStart(9);
            const ganancia = `${resultado.precios.gananciaPotencial.toFixed(2)} CUP`;
            
            console.log(`│ ${moneda.padEnd(12)} │ ${compra} │ ${venta} │ ${ganancia.padEnd(12)} │`);
        });
        
        console.log('└──────────────┴────────────┴────────────┴──────────────┘\n');
    }
    
    // Advertencias
    console.log('⚠️  IMPORTANTE:');
    console.log('   • Precios basados en las primeras 100 ofertas del mercado');
    console.log('   • El margen se adapta automáticamente al spread real');
    console.log('   • Considera las comisiones de QvaPay en tus cálculos');
    console.log('   • Recomendación: Ejecutar cada 30-60 minutos para precios actualizados\n');
    
    console.log('═══════════════════════════════════════════════════════\n');
    
    return precios;
}

// Ejecutar
if (require.main === module) {
    calcularPrecios()
        .then(() => {
            console.log('✅ Análisis completado exitosamente\n');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Error en análisis:', error.message);
            process.exit(1);
        });
}

module.exports = { calcularPrecios, obtenerOfertas };
