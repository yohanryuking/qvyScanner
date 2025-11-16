/**
 * ⚙️ CONFIGURACIÓN CENTRALIZADA DE ESTRATEGIA DE ARBITRAJE
 * 
 * Este archivo centraliza todos los parámetros de tu estrategia.
 * Cambia aquí y se aplica automáticamente en:
 * - calcular-precios.js
 * - monitor.js
 * - gestor-ofertas.js
 */

/**
 * Configuración de estrategia de precios
 */
const ESTRATEGIA_PRECIOS = {
    // Tu ganancia mínima deseada por cada USD
    margenGanancia: 15,
    
    // Descuento que aplicas al vender para cerrar más rápido
    descuentoVenta: 1,
    
    // Método de cálculo de precios
    metodoMargen: 'estrategia_spread',
    
    // Factor de seguridad (no cambiar)
    factorSeguridad: 0.5,
    
    // Eliminar outliers del análisis
    eliminarOutliersFlag: true
};

/**
 * Obtener configuración de estrategia
 * @returns {Object} Configuración completa
 */
function obtenerConfiguracionEstrategia() {
    return { ...ESTRATEGIA_PRECIOS };
}

/**
 * Mostrar resumen de la estrategia configurada
 */
function mostrarEstrategia() {
    console.log('🎯 ESTRATEGIA CONFIGURADA:');
    console.log(`   • Ganancia mínima: ${ESTRATEGIA_PRECIOS.margenGanancia} CUP por USD`);
    console.log(`   • Descuento de venta: ${ESTRATEGIA_PRECIOS.descuentoVenta} CUP (para vender más rápido)`);
    console.log(`   • Método: ${ESTRATEGIA_PRECIOS.metodoMargen}`);
}

/**
 * Explicación de la estrategia
 */
function explicarEstrategia() {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║            📚 EXPLICACIÓN DE LA ESTRATEGIA               ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    console.log('🎯 TU ESTRATEGIA DE ARBITRAJE:\n');
    
    console.log('1️⃣  ANALIZAR EL MERCADO:');
    console.log('   • Se obtiene el precio promedio de las ventas (type="sell")');
    console.log('   • Este es el precio al que la gente está vendiendo USD\n');
    
    console.log('2️⃣  CALCULAR TU PRECIO DE VENTA:');
    console.log(`   • Precio mercado - ${ESTRATEGIA_PRECIOS.descuentoVenta} CUP = Tu precio de venta`);
    console.log('   • Ejemplo: Si mercado = 508 CUP, tú vendes a 507 CUP');
    console.log('   • Ventaja: Vendes más rápido que la competencia\n');
    
    console.log('3️⃣  CALCULAR TU PRECIO DE COMPRA:');
    console.log(`   • Tu precio venta - ${ESTRATEGIA_PRECIOS.margenGanancia} CUP = Tu precio de compra máximo`);
    console.log('   • Ejemplo: 507 - 15 = 492 CUP máximo para comprar');
    console.log('   • Ventaja: Garantizas mínimo 15 CUP de ganancia\n');
    
    console.log('4️⃣  RESULTADO:');
    console.log(`   • Compras hasta: 492 CUP/USD (oferta type="sell")`);
    console.log(`   • Vendes a: 507 CUP/USD (oferta type="buy")`);
    console.log(`   • Ganancia garantizada: ${ESTRATEGIA_PRECIOS.margenGanancia} CUP por cada USD\n`);
    
    console.log('💡 PARA CAMBIAR LA ESTRATEGIA:');
    console.log('   Edita el archivo: arbitrage/config-estrategia.js\n');
    
    console.log('═══════════════════════════════════════════════════════════\n');
}

module.exports = {
    ESTRATEGIA_PRECIOS,
    obtenerConfiguracionEstrategia,
    mostrarEstrategia,
    explicarEstrategia
};
