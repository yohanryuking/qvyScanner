/**
 * 📊 Utilidades - Cálculo de Precios de Arbitraje
 */

/**
 * Extraer tasa de cambio de una oferta
 * @param {Object} oferta - Objeto de oferta
 * @returns {number} Tasa de cambio
 */
function extraerTasa(oferta) {
    const amount = parseFloat(oferta.amount);
    const receive = parseFloat(oferta.receive);
    return receive / amount; // CUP por USD
}

/**
 * Calcular margen adaptable basado en el mercado
 * @param {Array} ofertas - Array de ofertas
 * @param {Object} opciones - Opciones de configuración
 * @returns {Object} Margen y método usado
 */
function calcularMargenAdaptable(ofertas, opciones = {}) {
    const {
        metodo = 'spread_real', // 'spread_real', 'percentil', 'desviacion'
        factorSeguridad = 0.5 // Multiplicador de seguridad (0.5 = spread completo)
    } = opciones;
    
    if (!ofertas || ofertas.length === 0) {
        return { margen: 5, metodo: 'fijo_default' };
    }
    
    const tasas = ofertas.map(o => extraerTasa(o)).sort((a, b) => a - b);
    const cantidad = tasas.length;
    
    if (cantidad < 3) {
        return { margen: 5, metodo: 'fijo_pocos_datos' };
    }
    
    // Separar ofertas de compra y venta
    const compras = ofertas.filter(o => o.type === 'buy').map(o => extraerTasa(o));
    const ventas = ofertas.filter(o => o.type === 'sell').map(o => extraerTasa(o));
    
    let margen;
    let detalles = {};
    
    if (metodo === 'spread_real' && compras.length > 0 && ventas.length > 0) {
        // MÉTODO 1: Spread Real del Mercado
        // Usar la diferencia real entre compras y ventas
        const promedioCompras = compras.reduce((sum, t) => sum + t, 0) / compras.length;
        const promedioVentas = ventas.reduce((sum, t) => sum + t, 0) / ventas.length;
        const spreadReal = Math.abs(promedioVentas - promedioCompras);
        
        // Usar la mitad del spread real como margen
        margen = (spreadReal / 2) * factorSeguridad;
        
        detalles = {
            metodo: 'spread_real',
            spreadMercado: parseFloat(spreadReal.toFixed(2)),
            promedioCompras: parseFloat(promedioCompras.toFixed(2)),
            promedioVentas: parseFloat(promedioVentas.toFixed(2)),
            factorAplicado: factorSeguridad
        };
        
    } else if (metodo === 'percentil') {
        // MÉTODO 2: Percentiles
        // Usar percentil 25 para compra y 75 para venta
        const p25Index = Math.floor(cantidad * 0.25);
        const p75Index = Math.floor(cantidad * 0.75);
        const promedio = tasas.reduce((sum, t) => sum + t, 0) / cantidad;
        
        const p25 = tasas[p25Index];
        const p75 = tasas[p75Index];
        
        // Margen = distancia del promedio al percentil
        margen = Math.max(promedio - p25, p75 - promedio) * factorSeguridad;
        
        detalles = {
            metodo: 'percentil',
            p25: parseFloat(p25.toFixed(2)),
            p75: parseFloat(p75.toFixed(2)),
            promedio: parseFloat(promedio.toFixed(2)),
            factorAplicado: factorSeguridad
        };
        
    } else {
        // MÉTODO 3: Desviación Estándar (default)
        const promedio = tasas.reduce((sum, t) => sum + t, 0) / cantidad;
        const varianza = tasas.reduce((sum, t) => sum + Math.pow(t - promedio, 2), 0) / cantidad;
        const desviacion = Math.sqrt(varianza);
        
        // Usar 1 desviación estándar como margen
        margen = desviacion * factorSeguridad;
        
        detalles = {
            metodo: 'desviacion',
            desviacion: parseFloat(desviacion.toFixed(2)),
            promedio: parseFloat(promedio.toFixed(2)),
            factorAplicado: factorSeguridad
        };
    }
    
    // Asegurar margen mínimo de 3 CUP
    margen = Math.max(margen, 3);
    
    return {
        margen: parseFloat(margen.toFixed(2)),
        ...detalles
    };
}

/**
 * Calcular estadísticas y precios de arbitraje de una lista de ofertas
 * @param {Array} ofertas - Array de ofertas
 * @param {Object} opciones - Opciones de configuración
 * @returns {Object} Estadísticas y precios recomendados
 */
function calcularPreciosArbitraje(ofertas, opciones = {}) {
    const {
        margenGanancia = 15, // Ganancia mínima deseada en CUP por USD
        descuentoVenta = 1,  // Descuento para vender más rápido
        metodoMargen = 'estrategia_spread',
        factorSeguridad = 1
    } = opciones;
    
    if (!ofertas || ofertas.length === 0) {
        return null;
    }
    
    // Separar ofertas por tipo (compra y venta)
    const compras = ofertas.filter(o => o.type === 'buy');
    const ventas = ofertas.filter(o => o.type === 'sell');
    
    // Calcular tasas promedio separadas
    const tasaPromedioCompras = compras.length > 0
        ? compras.reduce((sum, o) => sum + extraerTasa(o), 0) / compras.length
        : 0;
    
    const tasaPromedioVentas = ventas.length > 0
        ? ventas.reduce((sum, o) => sum + extraerTasa(o), 0) / ventas.length
        : 0;
    
    // Extraer todas las tasas para estadísticas generales
    const tasas = ofertas.map(o => extraerTasa(o)).sort((a, b) => a - b);
    
    // Calcular estadísticas generales
    const cantidad = tasas.length;
    const promedio = tasas.reduce((sum, t) => sum + t, 0) / cantidad;
    const minimo = tasas[0];
    const maximo = tasas[cantidad - 1];
    
    // Calcular mediana
    const mediana = cantidad % 2 === 0
        ? (tasas[cantidad / 2 - 1] + tasas[cantidad / 2]) / 2
        : tasas[Math.floor(cantidad / 2)];
    
    // Calcular desviación estándar
    const varianza = tasas.reduce((sum, t) => sum + Math.pow(t - promedio, 2), 0) / cantidad;
    const desviacion = Math.sqrt(varianza);
    
    // ESTRATEGIA DE PRECIOS:
    // 1. Precio de venta óptimo: promedio de ventas - descuento (para vender más rápido)
    // 2. Precio de compra máximo: precio venta - ganancia mínima
    
    let precioVentaOptimo, precioCompraMaximo, spreadReal, infoEstrategia;
    
    if (tasaPromedioVentas > 0 && metodoMargen === 'estrategia_spread') {
        // Usar estrategia basada en spread real del mercado
        precioVentaOptimo = tasaPromedioVentas - descuentoVenta;
        precioCompraMaximo = precioVentaOptimo - margenGanancia;
        spreadReal = precioVentaOptimo - precioCompraMaximo;
        
        infoEstrategia = {
            metodo: 'estrategia_spread',
            tasaPromedioCompras: parseFloat(tasaPromedioCompras.toFixed(2)),
            tasaPromedioVentas: parseFloat(tasaPromedioVentas.toFixed(2)),
            margenGanancia,
            descuentoVenta,
            cantidadCompras: compras.length,
            cantidadVentas: ventas.length
        };
    } else {
        // Fallback: usar promedio general con margen fijo
        const margenCalculado = calcularMargenAdaptable(ofertas, { 
            metodo: 'desviacion', 
            factorSeguridad 
        });
        
        precioCompraMaximo = promedio - margenCalculado.margen;
        precioVentaOptimo = promedio + margenCalculado.margen;
        spreadReal = precioVentaOptimo - precioCompraMaximo;
        
        infoEstrategia = {
            metodo: 'fallback_promedio',
            ...margenCalculado
        };
    }
    
    const gananciaPotencial = spreadReal;
    const porcentajeGanancia = (gananciaPotencial / precioCompraMaximo) * 100;
    
    return {
        estadisticas: {
            cantidad,
            promedio: parseFloat(promedio.toFixed(2)),
            mediana: parseFloat(mediana.toFixed(2)),
            minimo: parseFloat(minimo.toFixed(2)),
            maximo: parseFloat(maximo.toFixed(2)),
            desviacion: parseFloat(desviacion.toFixed(2)),
            cantidadCompras: compras.length,
            cantidadVentas: ventas.length,
            tasaPromedioCompras: parseFloat(tasaPromedioCompras.toFixed(2)),
            tasaPromedioVentas: parseFloat(tasaPromedioVentas.toFixed(2))
        },
        precios: {
            compra: parseFloat(precioCompraMaximo.toFixed(2)),
            venta: parseFloat(precioVentaOptimo.toFixed(2)),
            spread: parseFloat(spreadReal.toFixed(2)),
            gananciaPotencial: parseFloat(gananciaPotencial.toFixed(2)),
            porcentajeGanancia: parseFloat(porcentajeGanancia.toFixed(2))
        },
        estrategia: infoEstrategia
    };
}

/**
 * Eliminar outliers usando el método IQR (Rango Intercuartílico)
 * @param {Array} ofertas - Array de ofertas
 * @returns {Array} Ofertas sin outliers
 */
function eliminarOutliers(ofertas) {
    if (ofertas.length < 4) {
        return ofertas; // No suficientes datos para eliminar outliers
    }
    
    // Calcular tasas
    const tasas = ofertas.map(o => ({
        oferta: o,
        tasa: parseFloat(o.receive) / parseFloat(o.amount)
    })).filter(t => !isNaN(t.tasa) && t.tasa > 0);
    
    // Ordenar por tasa
    tasas.sort((a, b) => a.tasa - b.tasa);
    
    // Calcular Q1, Q2, Q3
    const q1Index = Math.floor(tasas.length * 0.25);
    const q3Index = Math.floor(tasas.length * 0.75);
    
    const q1 = tasas[q1Index].tasa;
    const q3 = tasas[q3Index].tasa;
    const iqr = q3 - q1;
    
    // Calcular límites
    const limiteInferior = q1 - (1.5 * iqr);
    const limiteSuperior = q3 + (1.5 * iqr);
    
    // Filtrar outliers
    const sinOutliers = tasas
        .filter(t => t.tasa >= limiteInferior && t.tasa <= limiteSuperior)
        .map(t => t.oferta);
    
    return sinOutliers;
}

/**
 * Calcular precios por moneda
 * @param {Array} ofertas - Array de todas las ofertas
 * @param {Object} opciones - Opciones de configuración
 * @returns {Object} Precios por moneda
 */
function calcularPreciosPorMoneda(ofertas, opciones = {}) {
    const {
        margenGanancia = 15,      // Ganancia mínima deseada en CUP por USD
        descuentoVenta = 1,       // Descuento para vender más rápido
        metodoMargen = 'estrategia_spread',
        factorSeguridad = 1,
        eliminarOutliersFlag = true
    } = opciones;
    
    // Agrupar por moneda
    const porMoneda = {};
    
    ofertas.forEach(oferta => {
        const moneda = oferta.coin;
        if (!porMoneda[moneda]) {
            porMoneda[moneda] = [];
        }
        porMoneda[moneda].push(oferta);
    });
    
    // Calcular precios para cada moneda
    const resultados = {};
    
    Object.entries(porMoneda).forEach(([moneda, ofertasMoneda]) => {
        // Eliminar outliers si está habilitado
        const ofertasLimpias = eliminarOutliersFlag 
            ? eliminarOutliers(ofertasMoneda)
            : ofertasMoneda;
        
        if (ofertasLimpias.length < 3) {
            // No suficientes datos para análisis confiable
            return;
        }
        
        const resultado = calcularPreciosArbitraje(ofertasLimpias, {
            margenGanancia,
            descuentoVenta,
            metodoMargen,
            factorSeguridad
        });
        
        if (resultado) {
            resultados[moneda] = {
                ...resultado,
                outliersEliminados: ofertasMoneda.length - ofertasLimpias.length
            };
        }
    });
    
    return resultados;
}

/**
 * Formatear resultados para mostrar
 * @param {Object} resultado - Resultado de calcularPreciosArbitraje
 * @param {string} moneda - Nombre de la moneda
 */
function formatearResultado(resultado, moneda) {
    if (!resultado || !resultado.estadisticas || !resultado.precios) {
        return `\n💱 ${moneda}: Sin datos suficientes\n`;
    }
    
    const { estadisticas, precios, estrategia } = resultado;
    
    let output = `\n💱 ${moneda}\n`;
    output += `   📊 Ofertas analizadas: ${estadisticas.cantidad}\n`;
    output += `   📈 Tasa promedio general: ${estadisticas.promedio.toFixed(2)} CUP/USD\n`;
    output += `   📊 Mediana: ${estadisticas.mediana.toFixed(2)}\n`;
    output += `   📉 Rango: ${estadisticas.minimo.toFixed(2)} - ${estadisticas.maximo.toFixed(2)}\n`;
    output += `   📏 Desv. estándar: ${estadisticas.desviacion.toFixed(2)}\n`;
    output += `\n`;
    
    // Mostrar tasas promedio separadas
    if (estadisticas.cantidadCompras > 0 || estadisticas.cantidadVentas > 0) {
        output += `   📊 ANÁLISIS POR TIPO DE OFERTA:\n`;
        output += `   🟢 Compras (type="buy"): ${estadisticas.cantidadCompras} ofertas → ${estadisticas.tasaPromedioCompras.toFixed(2)} CUP/USD promedio\n`;
        output += `   🔴 Ventas (type="sell"): ${estadisticas.cantidadVentas} ofertas → ${estadisticas.tasaPromedioVentas.toFixed(2)} CUP/USD promedio\n`;
        output += `\n`;
    }
    
    // Mostrar información de la estrategia
    if (estrategia) {
        output += `   🎯 ESTRATEGIA DE PRECIOS:\n`;
        output += `   Método: ${estrategia.metodo}\n`;
        
        if (estrategia.metodo === 'estrategia_spread') {
            output += `   📈 Precio venta mercado: ${estrategia.tasaPromedioVentas.toFixed(2)} CUP/USD\n`;
            output += `   💰 Tu descuento de venta: ${estrategia.descuentoVenta} CUP (para vender más rápido)\n`;
            output += `   🎯 Tu ganancia mínima: ${estrategia.margenGanancia} CUP/USD\n`;
        }
        
        output += `\n`;
    }
    
    output += `   💰 PRECIOS RECOMENDADOS:\n`;
    output += `   🟢 COMPRA MÁXIMO: ${precios.compra.toFixed(2)} CUP/USD\n`;
    output += `      (Crear oferta type="sell" hasta este precio)\n`;
    output += `   🔴 VENTA ÓPTIMO: ${precios.venta.toFixed(2)} CUP/USD\n`;
    output += `      (Crear oferta type="buy" a este precio)\n`;
    output += `\n`;
    output += `   📈 Spread: ${precios.spread.toFixed(2)} CUP\n`;
    output += `   💵 Ganancia potencial: ${precios.gananciaPotencial.toFixed(2)} CUP por USD (${precios.porcentajeGanancia.toFixed(2)}%)\n`;
    
    if (resultado.outliersEliminados && resultado.outliersEliminados > 0) {
        output += `   🗑️  Outliers eliminados: ${resultado.outliersEliminados}\n`;
    }
    
    return output;
}

module.exports = {
    calcularPreciosArbitraje,
    calcularMargenAdaptable,
    eliminarOutliers,
    calcularPreciosPorMoneda,
    formatearResultado
};
