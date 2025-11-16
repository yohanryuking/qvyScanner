/**
 * 📊 MÉTODO 1: Arbitraje basado en Primeras 100 Ofertas
 * 
 * Analiza las primeras 100 ofertas del mercado (páginas 1 y 2 de la API).
 * Rápido y con datos más recientes.
 */

const fetch = require('node-fetch');
const { calcularPreciosPorMoneda, formatearResultado } = require('./utils/calcular-precios');
const { aplicarFiltrosEstandar, estadisticasFiltrado } = require('./utils/filtros');
const credenciales = require('./credenciales');

const TOKEN = credenciales.token;

async function obtenerPrimeras100Ofertas() {
    console.log('📥 Obteniendo primeras 100 ofertas (páginas 1 y 2)...\n');
    
    try {
        // Obtener páginas 1 y 2 en paralelo
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
        
        if (response1.ok && result1.data) {
            ofertas.push(...result1.data);
            console.log(`✅ Página 1: ${result1.data.length} ofertas`);
        }
        
        if (response2.ok && result2.data) {
            ofertas.push(...result2.data);
            console.log(`✅ Página 2: ${result2.data.length} ofertas`);
        }
        
        console.log(`📊 Total: ${ofertas.length} ofertas`);
        if (result1.total) {
            console.log(`📊 Total en mercado: ${result1.total}\n`);
        }
        
        return ofertas;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        return [];
    }
}

async function analizarArbitraje() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 ANÁLISIS DE ARBITRAJE - MÉTODO 1 (PRIMERAS 100)');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('⚡ Velocidad: Muy Rápido (~0.5s)');
    console.log('📊 Muestra: 100 ofertas (páginas API 1-2)');
    console.log('🎯 Precisión: Alta (datos más recientes)');
    console.log('💾 Peticiones: 2 (paralelas)\n');
    
    // Obtener ofertas
    const ofertasOriginales = await obtenerPrimeras100Ofertas();
    
    if (ofertasOriginales.length === 0) {
        console.log('❌ No se obtuvieron ofertas');
        return;
    }
    
    // Aplicar filtros
    console.log('\n🔍 Aplicando filtros...');
    const ofertas = aplicarFiltrosEstandar(ofertasOriginales, {
        incluirVIP: false,
        requiereKYC: true,
        soloPublicas: true,
        ratingMinimo: 4.5
    });
    
    const stats = estadisticasFiltrado(ofertasOriginales.length, ofertas.length);
    console.log(`   Original: ${stats.original}`);
    console.log(`   Filtradas: ${stats.filtrada}`);
    console.log(`   Eliminadas: ${stats.eliminadas} (${stats.porcentajeEliminado}%)\n`);
    
    // Calcular precios por moneda
    console.log('💰 Calculando precios de arbitraje...\n');
    const precios = calcularPreciosPorMoneda(ofertas, {
        metodoMargen: 'spread_real',
        factorSeguridad: 0.5,
        eliminarOutliersFlag: true
    });
    
    // Ordenar monedas por cantidad de ofertas
    const monedasOrdenadas = Object.entries(precios)
        .sort((a, b) => b[1].estadisticas.cantidad - a[1].estadisticas.cantidad);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎯 RESULTADOS - PRECIOS RECOMENDADOS');
    console.log('═══════════════════════════════════════════════════════');
    
    // Mostrar resultados
    monedasOrdenadas.forEach(([moneda, resultado]) => {
        if (resultado.estadisticas && resultado.estadisticas.cantidad >= 3) {
            console.log(formatearResultado(resultado, moneda));
            console.log('───────────────────────────────────────────────────────');
        }
    });
    
    // Resumen
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RESUMEN');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const monedasAnalizadas = monedasOrdenadas.filter(([, r]) => 
        r.estadisticas && r.estadisticas.cantidad >= 3
    );
    
    console.log(`💱 Monedas analizadas: ${monedasAnalizadas.length}`);
    console.log(`📊 Ofertas totales procesadas: ${ofertas.length}\n`);
    
    // Top 3 oportunidades
    const topOportunidades = monedasOrdenadas
        .filter(([, r]) => r.precios && r.precios.porcentajeGanancia)
        .sort((a, b) => b[1].precios.porcentajeGanancia - a[1].precios.porcentajeGanancia)
        .slice(0, 3);
    
    if (topOportunidades.length > 0) {
        console.log('🏆 TOP 3 OPORTUNIDADES (mayor % de ganancia):');
        topOportunidades.forEach(([moneda, resultado], index) => {
            console.log(`   ${index + 1}. ${moneda}: ${resultado.precios.porcentajeGanancia.toFixed(2)}% (${resultado.precios.gananciaPotencial.toFixed(2)} por USD)`);
        });
        console.log('');
    }
    
    // Advertencia
    console.log('⚠️  IMPORTANTE:');
    console.log('   • Estos son precios SUGERIDOS basados en el mercado actual');
    console.log('   • El mercado cambia constantemente');
    console.log('   • Considera las comisiones de QvaPay');
    console.log('   • Empieza con montos pequeños para probar');
    console.log('   • Monitorea el mercado regularmente\n');
    
    console.log('═══════════════════════════════════════════════════════\n');
    
    return precios;
}

// Ejecutar
analizarArbitraje().then(() => {
    console.log('✅ Análisis completado\n');
}).catch(error => {
    console.error('❌ Error en análisis:', error.message);
});
