/**
 * 🔍 Utilidades - Filtros de Ofertas
 */

/**
 * Filtrar ofertas por estado
 * @param {Array} ofertas - Array de ofertas
 * @returns {Array} Solo ofertas abiertas
 */
function filtrarAbiertas(ofertas) {
    return ofertas.filter(o => o.status === 'open');
}

/**
 * Filtrar ofertas no-VIP
 * @param {Array} ofertas - Array de ofertas
 * @returns {Array} Solo ofertas accesibles sin VIP
 */
function filtrarNoVIP(ofertas) {
    return ofertas.filter(o => !o.only_vip);
}

/**
 * Filtrar ofertas con KYC
 * @param {Array} ofertas - Array de ofertas
 * @returns {Array} Solo ofertas de usuarios con KYC
 */
function filtrarConKYC(ofertas) {
    return ofertas.filter(o => o.User && o.User.kyc === true);
}

/**
 * Filtrar ofertas privadas
 * @param {Array} ofertas - Array de ofertas
 * @returns {Array} Solo ofertas públicas
 */
function filtrarPublicas(ofertas) {
    return ofertas.filter(o => !o.private);
}

/**
 * Filtrar ofertas por moneda
 * @param {Array} ofertas - Array de ofertas
 * @param {string} moneda - Código de la moneda
 * @returns {Array} Solo ofertas de esa moneda
 */
function filtrarPorMoneda(ofertas, moneda) {
    return ofertas.filter(o => o.coin === moneda);
}

/**
 * Filtrar ofertas por tipo (buy/sell)
 * @param {Array} ofertas - Array de ofertas
 * @param {string} tipo - 'buy' o 'sell'
 * @returns {Array} Solo ofertas de ese tipo
 */
function filtrarPorTipo(ofertas, tipo) {
    return ofertas.filter(o => o.type === tipo);
}

/**
 * Filtrar ofertas por tiempo
 * @param {Array} ofertas - Array de ofertas
 * @param {number} horas - Horas hacia atrás desde ahora
 * @returns {Array} Solo ofertas dentro del rango de tiempo
 */
function filtrarPorTiempo(ofertas, horas = 24) {
    const ahora = new Date();
    const limiteInferior = new Date(ahora.getTime() - (horas * 60 * 60 * 1000));
    
    return ofertas.filter(o => {
        const fechaCreacion = new Date(o.created_at);
        return fechaCreacion >= limiteInferior;
    });
}

/**
 * Filtrar ofertas con rating mínimo
 * @param {Array} ofertas - Array de ofertas
 * @param {number} ratingMinimo - Rating mínimo del usuario (0-5)
 * @returns {Array} Solo ofertas de usuarios con rating >= mínimo
 */
function filtrarPorRating(ofertas, ratingMinimo = 4.5) {
    return ofertas.filter(o => {
        if (!o.User || !o.User.rating_avg) return false;
        return parseFloat(o.User.rating_avg) >= ratingMinimo;
    });
}

/**
 * Filtrar ofertas válidas (datos completos)
 * @param {Array} ofertas - Array de ofertas
 * @returns {Array} Solo ofertas con datos válidos
 */
function filtrarValidas(ofertas) {
    return ofertas.filter(o => {
        const amount = parseFloat(o.amount);
        const receive = parseFloat(o.receive);
        
        return !isNaN(amount) && 
               !isNaN(receive) && 
               amount > 0 && 
               receive > 0;
    });
}

/**
 * Filtra ofertas que solo sean de monedas en CUP (BANK_CUP y BOLSATM)
 */
function filtrarSoloCUP(ofertas) {
    const monedasCUP = ['BANK_CUP', 'BOLSATM'];
    return ofertas.filter(oferta => 
        oferta.coin && monedasCUP.includes(oferta.coin.toUpperCase())
    );
}

/**
 * Aplica filtros estándar a un array de ofertas
 * @param {Array} ofertas - Array de ofertas
 * @param {Object} opciones - Opciones de filtrado
 * @returns {Array} Ofertas filtradas
 */
function aplicarFiltrosEstandar(ofertas, opciones = {}) {
    const {
        incluirVIP = false,
        requiereKYC = true,
        soloPublicas = true,
        ratingMinimo = 4.5,
        soloCUP = true  // Por defecto solo analizar CUP
    } = opciones;
    
    let ofertasFiltradas = [...ofertas];
    
    // Filtrar solo monedas CUP (BANK_CUP y BOLSATM)
    if (soloCUP) {
        ofertasFiltradas = filtrarSoloCUP(ofertasFiltradas);
    }
    
    // Filtrar ofertas abiertas
    ofertasFiltradas = filtrarAbiertas(ofertasFiltradas);
    
    // Filtrar VIP si es necesario
    if (!incluirVIP) {
        ofertasFiltradas = filtrarNoVIP(ofertasFiltradas);
    }
    
    // Filtrar KYC si es necesario
    if (requiereKYC) {
        ofertasFiltradas = filtrarConKYC(ofertasFiltradas);
    }
    
    // Filtrar públicas si es necesario
    if (soloPublicas) {
        ofertasFiltradas = filtrarPublicas(ofertasFiltradas);
    }
    
    // RATING FILTER DESACTIVADO - Para incluir más ofertas
    // if (ratingMinimo > 0) {
    //     ofertasFiltradas = filtrarPorRating(ofertasFiltradas, ratingMinimo);
    // }
    
    // Filtrar válidas (último paso)
    ofertasFiltradas = filtrarValidas(ofertasFiltradas);
    
    return ofertasFiltradas;
}

/**
 * Obtener estadísticas de filtrado
 * @param {number} original - Cantidad original
 * @param {number} filtrada - Cantidad después de filtrar
 * @returns {Object} Estadísticas
 */
function estadisticasFiltrado(original, filtrada) {
    const eliminadas = original - filtrada;
    const porcentajeEliminado = original > 0 ? (eliminadas / original) * 100 : 0;
    const porcentajeRetenido = original > 0 ? (filtrada / original) * 100 : 0;
    
    return {
        original,
        filtrada,
        eliminadas,
        porcentajeEliminado: porcentajeEliminado.toFixed(2),
        porcentajeRetenido: porcentajeRetenido.toFixed(2)
    };
}

module.exports = {
    filtrarAbiertas,
    filtrarNoVIP,
    filtrarConKYC,
    filtrarPublicas,
    filtrarPorMoneda,
    filtrarPorTipo,
    filtrarPorTiempo,
    filtrarPorRating,
    filtrarValidas,
    filtrarSoloCUP,
    aplicarFiltrosEstandar,
    estadisticasFiltrado
};
