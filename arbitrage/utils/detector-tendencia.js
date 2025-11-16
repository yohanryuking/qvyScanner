/**
 * 📊 DETECTOR DE TENDENCIA/SENTIMIENTO DEL MERCADO
 * 
 * Analiza las ofertas del P2P para determinar si el mercado
 * está en modo compra o venta, calculando proporciones y tendencias.
 */

const fetch = require('node-fetch');

/**
 * Obtener las primeras 100 ofertas del mercado (2 páginas)
 */
async function obtenerOfertasMercado(token) {
    try {
        const [response1, response2] = await Promise.all([
            fetch('https://api.qvapay.com/p2p/index?page=1', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }),
            fetch('https://api.qvapay.com/p2p/index?page=2', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
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
 * Analizar tendencia del mercado
 */
function analizarTendencia(ofertas, filtros = {}) {
    // Aplicar filtros opcionales
    let ofertasFiltradas = ofertas.filter(o => o.status === 'open');
    
    // Filtro por moneda (opcional)
    if (filtros.moneda) {
        const monedasBuscar = Array.isArray(filtros.moneda) 
            ? filtros.moneda.map(m => m.toUpperCase())
            : [filtros.moneda.toUpperCase()];
        
        ofertasFiltradas = ofertasFiltradas.filter(o => {
            const moneda = o.coin ? o.coin.toUpperCase() : '';
            return monedasBuscar.includes(moneda);
        });
    }
    
    // Filtro por KYC (opcional)
    if (filtros.soloKYC) {
        ofertasFiltradas = ofertasFiltradas.filter(o => 
            o.User && o.User.kyc === true
        );
    }
    
    // Filtro VIP (opcional)
    if (filtros.excluirVIP) {
        ofertasFiltradas = ofertasFiltradas.filter(o => !o.only_vip);
    }
    
    // Filtro públicas (opcional)
    if (filtros.soloPublicas) {
        ofertasFiltradas = ofertasFiltradas.filter(o => !o.private);
    }
    
    // Contar ofertas por tipo
    const compras = ofertasFiltradas.filter(o => o.type === 'buy');
    const ventas = ofertasFiltradas.filter(o => o.type === 'sell');
    
    const totalOfertas = ofertasFiltradas.length;
    const cantidadCompras = compras.length;
    const cantidadVentas = ventas.length;
    
    // Calcular proporciones
    const proporcionCompras = totalOfertas > 0 
        ? (cantidadCompras / totalOfertas) * 100 
        : 0;
    const proporcionVentas = totalOfertas > 0 
        ? (cantidadVentas / totalOfertas) * 100 
        : 0;
    
    // Determinar sentimiento del mercado
    let sentimiento = 'NEUTRAL';
    let intensidad = 'BAJA';
    let descripcion = '';
    let icono = '⚖️';
    let color = 'amarillo';
    
    const diferencia = Math.abs(proporcionCompras - proporcionVentas);
    
    if (diferencia < 10) {
        sentimiento = 'NEUTRAL';
        intensidad = 'EQUILIBRADO';
        descripcion = 'El mercado está equilibrado. Hay igual cantidad de compradores y vendedores.';
        icono = '⚖️';
        color = 'amarillo';
    } else if (proporcionCompras > proporcionVentas) {
        sentimiento = 'ALCISTA';
        icono = '📈';
        color = 'verde';
        
        if (diferencia >= 40) {
            intensidad = 'MUY ALTA';
            descripcion = 'Mercado extremadamente alcista. Demanda muy fuerte de USD.';
        } else if (diferencia >= 25) {
            intensidad = 'ALTA';
            descripcion = 'Mercado muy alcista. Gran demanda de USD en el mercado.';
        } else if (diferencia >= 15) {
            intensidad = 'MODERADA';
            descripcion = 'Mercado alcista moderado. Mayor demanda de USD.';
        } else {
            intensidad = 'LEVE';
            descripcion = 'Mercado ligeramente alcista. Hay más compradores que vendedores.';
        }
    } else {
        sentimiento = 'BAJISTA';
        icono = '📉';
        color = 'rojo';
        
        if (diferencia >= 40) {
            intensidad = 'MUY ALTA';
            descripcion = 'Mercado extremadamente bajista. Oferta muy fuerte de USD.';
        } else if (diferencia >= 25) {
            intensidad = 'ALTA';
            descripcion = 'Mercado muy bajista. Gran oferta de USD en el mercado.';
        } else if (diferencia >= 15) {
            intensidad = 'MODERADA';
            descripcion = 'Mercado bajista moderado. Mayor oferta de USD.';
        } else {
            intensidad = 'LEVE';
            descripcion = 'Mercado ligeramente bajista. Hay más vendedores que compradores.';
        }
    }
    
    // Calcular volúmenes (suma de amounts)
    const volumenCompras = compras.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);
    const volumenVentas = ventas.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);
    const volumenTotal = volumenCompras + volumenVentas;
    
    // Calcular tasas promedio
    const tasaPromedioCompras = compras.length > 0
        ? compras.reduce((sum, o) => sum + (parseFloat(o.receive) / parseFloat(o.amount)), 0) / compras.length
        : 0;
    
    const tasaPromedioVentas = ventas.length > 0
        ? ventas.reduce((sum, o) => sum + (parseFloat(o.receive) / parseFloat(o.amount)), 0) / ventas.length
        : 0;
    
    return {
        // Conteos
        totalOfertas,
        cantidadCompras,
        cantidadVentas,
        
        // Proporciones
        proporcionCompras: proporcionCompras.toFixed(2),
        proporcionVentas: proporcionVentas.toFixed(2),
        
        // Sentimiento
        sentimiento,
        intensidad,
        descripcion,
        icono,
        color,
        diferencia: diferencia.toFixed(2),
        
        // Volúmenes
        volumenCompras: volumenCompras.toFixed(2),
        volumenVentas: volumenVentas.toFixed(2),
        volumenTotal: volumenTotal.toFixed(2),
        
        // Tasas
        tasaPromedioCompras: tasaPromedioCompras.toFixed(2),
        tasaPromedioVentas: tasaPromedioVentas.toFixed(2),
        
        // Datos completos
        compras,
        ventas,
        filtrosAplicados: filtros
    };
}

/**
 * Generar barra visual de proporción
 */
function generarBarraProporcion(proporcionCompras, proporcionVentas) {
    const anchoTotal = 50;
    const comprasBarras = Math.round((proporcionCompras / 100) * anchoTotal);
    const ventasBarras = anchoTotal - comprasBarras;
    
    const barraCompras = '█'.repeat(comprasBarras);
    const barraVentas = '█'.repeat(ventasBarras);
    
    return {
        compras: barraCompras,
        ventas: barraVentas
    };
}

/**
 * Mostrar análisis completo en consola
 */
function mostrarAnalisis(analisis) {
    const barra = generarBarraProporcion(
        parseFloat(analisis.proporcionCompras),
        parseFloat(analisis.proporcionVentas)
    );
    
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║          📊 ANÁLISIS DE TENDENCIA DEL MERCADO            ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    // Sentimiento principal
    console.log(`${analisis.icono}  SENTIMIENTO: ${analisis.sentimiento} (${analisis.intensidad})`);
    console.log(`   ${analisis.descripcion}\n`);
    
    // Estadísticas básicas
    console.log('📈 ESTADÍSTICAS:');
    console.log(`   Total de ofertas analizadas: ${analisis.totalOfertas}`);
    console.log(`   🟢 Ofertas de COMPRA: ${analisis.cantidadCompras} (${analisis.proporcionCompras}%)`);
    console.log(`   🔴 Ofertas de VENTA: ${analisis.cantidadVentas} (${analisis.proporcionVentas}%)`);
    console.log(`   📊 Diferencia: ${analisis.diferencia}%\n`);
    
    // Gráfico visual
    console.log('📊 PROPORCIÓN VISUAL:');
    console.log(`   🟢 COMPRA [${barra.compras}] ${analisis.proporcionCompras}%`);
    console.log(`   🔴 VENTA  [${barra.ventas}] ${analisis.proporcionVentas}%\n`);
    
    // Volúmenes
    console.log('💰 VOLÚMENES (USD):');
    console.log(`   🟢 Compras: $${analisis.volumenCompras}`);
    console.log(`   🔴 Ventas: $${analisis.volumenVentas}`);
    console.log(`   💵 Total: $${analisis.volumenTotal}\n`);
    
    // Tasas promedio
    if (parseFloat(analisis.tasaPromedioCompras) > 0 || parseFloat(analisis.tasaPromedioVentas) > 0) {
        console.log('💱 TASAS PROMEDIO (CUP/USD):');
        if (parseFloat(analisis.tasaPromedioCompras) > 0) {
            console.log(`   🟢 Compras: ${analisis.tasaPromedioCompras} CUP/USD`);
        }
        if (parseFloat(analisis.tasaPromedioVentas) > 0) {
            console.log(`   🔴 Ventas: ${analisis.tasaPromedioVentas} CUP/USD`);
        }
        console.log('');
    }
    
    // Interpretación
    console.log('💡 INTERPRETACIÓN:');
    if (analisis.sentimiento === 'ALCISTA') {
        console.log('   • Más gente quiere COMPRAR USD (ofertas type="buy")');
        console.log('   • Presión al alza en el precio del USD');
        console.log('   • Buena oportunidad para VENDER USD si tienes');
        console.log('   • Puede ser difícil encontrar USD para comprar');
    } else if (analisis.sentimiento === 'BAJISTA') {
        console.log('   • Más gente quiere VENDER USD (ofertas type="sell")');
        console.log('   • Presión a la baja en el precio del USD');
        console.log('   • Buena oportunidad para COMPRAR USD');
        console.log('   • Abundancia de ofertas para adquirir USD');
    } else {
        console.log('   • Mercado equilibrado');
        console.log('   • No hay presión clara en ninguna dirección');
        console.log('   • Condiciones normales de trading');
    }
    
    // Filtros aplicados
    if (analisis.filtrosAplicados && Object.keys(analisis.filtrosAplicados).length > 0) {
        console.log('\n⚙️  FILTROS APLICADOS:');
        if (analisis.filtrosAplicados.moneda) {
            const monedas = Array.isArray(analisis.filtrosAplicados.moneda)
                ? analisis.filtrosAplicados.moneda.join(', ')
                : analisis.filtrosAplicados.moneda;
            console.log(`   • Moneda(s): ${monedas}`);
        }
        if (analisis.filtrosAplicados.soloKYC) {
            console.log('   • Solo usuarios con KYC');
        }
        if (analisis.filtrosAplicados.excluirVIP) {
            console.log('   • Excluir ofertas VIP');
        }
        if (analisis.filtrosAplicados.soloPublicas) {
            console.log('   • Solo ofertas públicas');
        }
    }
    
    console.log('\n═══════════════════════════════════════════════════════════\n');
}

/**
 * Obtener resumen compacto para integración
 */
function obtenerResumenCompacto(analisis) {
    return {
        sentimiento: analisis.sentimiento,
        intensidad: analisis.intensidad,
        icono: analisis.icono,
        proporcionCompras: analisis.proporcionCompras,
        proporcionVentas: analisis.proporcionVentas,
        diferencia: analisis.diferencia,
        descripcion: analisis.descripcion
    };
}

/**
 * Análisis rápido del mercado
 */
async function analizarMercadoRapido(token, filtros = {}) {
    const ofertas = await obtenerOfertasMercado(token);
    
    if (ofertas.length === 0) {
        console.error('❌ No se pudieron obtener ofertas del mercado');
        return null;
    }
    
    const analisis = analizarTendencia(ofertas, filtros);
    return analisis;
}

module.exports = {
    obtenerOfertasMercado,
    analizarTendencia,
    generarBarraProporcion,
    mostrarAnalisis,
    obtenerResumenCompacto,
    analizarMercadoRapido
};
