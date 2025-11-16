/**
 * 💱 Utilidades - Obtener Información de Monedas
 * 
 * Funciones para obtener y buscar monedas disponibles en QvaPay
 */

// Polyfill para fetch en versiones antiguas de Node
if (!globalThis.fetch) {
    globalThis.fetch = require('node-fetch');
}

const { getAllCoins, getCoinById } = require('../../src');

/**
 * Obtener todas las monedas agrupadas por categoría
 * @returns {Promise<Array>} Array de categorías con sus monedas
 */
async function obtenerTodasLasMonedas() {
    try {
        console.log('💱 Obteniendo lista de monedas disponibles...\n');
        
        const categorias = await getAllCoins();
        
        console.log('✅ Monedas obtenidas exitosamente!\n');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📊 CATEGORÍAS DE MONEDAS DISPONIBLES');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        let totalMonedas = 0;
        
        categorias.forEach((categoria, index) => {
            const cantidadMonedas = categoria.coins ? categoria.coins.length : 0;
            totalMonedas += cantidadMonedas;
            
            console.log(`${index + 1}. ${categoria.name}`);
            console.log(`   💰 Monedas: ${cantidadMonedas}`);
            
            if (categoria.coins && categoria.coins.length > 0) {
                console.log('   ├─ Disponibles:');
                categoria.coins.forEach((coin, i) => {
                    const isLast = i === categoria.coins.length - 1;
                    const prefix = isLast ? '   └─' : '   ├─';
                    const p2pStatus = coin.enabled_p2p ? '✅ P2P' : '❌ P2P';
                    console.log(`${prefix} [ID: ${coin.id}] ${coin.name} (${coin.tick}) - ${p2pStatus}`);
                });
            }
            console.log('');
        });
        
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`📊 Total de monedas: ${totalMonedas}`);
        console.log('═══════════════════════════════════════════════════════════\n');
        
        return categorias;
        
    } catch (error) {
        console.error('❌ Error al obtener monedas:', error.message);
        throw error;
    }
}

/**
 * Buscar una moneda por nombre o símbolo
 * @param {string} busqueda - Nombre o símbolo a buscar (case insensitive)
 * @returns {Promise<Array>} Array de monedas que coinciden
 */
async function buscarMoneda(busqueda) {
    try {
        const categorias = await getAllCoins();
        const resultados = [];
        
        const busquedaLower = busqueda.toLowerCase();
        
        categorias.forEach(categoria => {
            if (categoria.coins) {
                categoria.coins.forEach(coin => {
                    const nombreMatch = coin.name.toLowerCase().includes(busquedaLower);
                    const tickMatch = coin.tick.toLowerCase().includes(busquedaLower);
                    
                    if (nombreMatch || tickMatch) {
                        resultados.push({
                            ...coin,
                            categoria: categoria.name
                        });
                    }
                });
            }
        });
        
        if (resultados.length === 0) {
            console.log(`⚠️  No se encontraron monedas con: "${busqueda}"\n`);
            return [];
        }
        
        console.log(`\n🔍 Resultados para: "${busqueda}"\n`);
        console.log('═══════════════════════════════════════════════════════════');
        
        resultados.forEach((coin, index) => {
            console.log(`\n${index + 1}. ${coin.name} (${coin.tick})`);
            console.log(`   🆔 ID: ${coin.id}`);
            console.log(`   📂 Categoría: ${coin.categoria}`);
            console.log(`   💱 P2P: ${coin.enabled_p2p ? '✅ Habilitado' : '❌ Deshabilitado'}`);
            console.log(`   💵 Precio: $${coin.price}`);
            console.log(`   📥 Depósitos: ${coin.enabled_in ? '✅' : '❌'}`);
            console.log(`   📤 Retiros: ${coin.enabled_out ? '✅' : '❌'}`);
        });
        
        console.log('\n═══════════════════════════════════════════════════════════\n');
        
        return resultados;
        
    } catch (error) {
        console.error('❌ Error al buscar moneda:', error.message);
        throw error;
    }
}

/**
 * Obtener detalles de una moneda por ID
 * @param {number} coinId - ID de la moneda
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Detalles completos de la moneda
 */
async function obtenerDetallesMoneda(coinId, token) {
    try {
        console.log(`\n💱 Obteniendo detalles de moneda ID: ${coinId}...\n`);
        
        const coin = await getCoinById(coinId, token);
        
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`💰 ${coin.name} (${coin.tick})`);
        console.log('═══════════════════════════════════════════════════════════\n');
        
        console.log('📊 Información General:');
        console.log(`   🆔 ID: ${coin.id}`);
        console.log(`   📂 Categoría: ${coin.coin_category.name}`);
        console.log(`   💵 Precio: $${coin.price}`);
        console.log('');
        
        console.log('⚙️  Configuración:');
        console.log(`   📥 Depósitos: ${coin.enabled_in ? '✅ Habilitado' : '❌ Deshabilitado'}`);
        console.log(`   📤 Retiros: ${coin.enabled_out ? '✅ Habilitado' : '❌ Deshabilitado'}`);
        console.log(`   💱 P2P: ${coin.enabled_p2p ? '✅ Habilitado' : '❌ Deshabilitado'}`);
        console.log('');
        
        console.log('💸 Comisiones y Límites:');
        console.log(`   📥 Entrada - Min: $${coin.min_in} | Fee: ${coin.fee_in}% | Max: $${coin.max_in || 'Sin límite'}`);
        console.log(`   📤 Salida - Min: $${coin.min_out} | Fee: ${coin.fee_out}% | Max: $${coin.max_out || 'Sin límite'}`);
        console.log('');
        
        if (coin.working_data) {
            try {
                const campos = JSON.parse(coin.working_data);
                console.log('📋 Campos requeridos para operar:');
                campos.forEach(campo => {
                    console.log(`   • ${campo.name} (${campo.type})`);
                });
                console.log('');
            } catch (e) {
                // Ignorar si no se puede parsear
            }
        }
        
        console.log('═══════════════════════════════════════════════════════════\n');
        
        return coin;
        
    } catch (error) {
        console.error('❌ Error al obtener detalles:', error.message);
        throw error;
    }
}

/**
 * Listar solo monedas habilitadas para P2P
 * @returns {Promise<Array>} Array de monedas P2P
 */
async function obtenerMonedasP2P() {
    try {
        console.log('💱 Obteniendo monedas habilitadas para P2P...\n');
        
        const categorias = await getAllCoins();
        const monedasP2P = [];
        
        categorias.forEach(categoria => {
            if (categoria.coins) {
                categoria.coins.forEach(coin => {
                    if (coin.enabled_p2p) {
                        monedasP2P.push({
                            ...coin,
                            categoria: categoria.name
                        });
                    }
                });
            }
        });
        
        console.log('═══════════════════════════════════════════════════════════');
        console.log('💱 MONEDAS HABILITADAS PARA P2P');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        monedasP2P.forEach((coin, index) => {
            console.log(`${index + 1}. [ID: ${coin.id}] ${coin.name} (${coin.tick})`);
            console.log(`   📂 ${coin.categoria} | 💵 $${coin.price}`);
        });
        
        console.log(`\n═══════════════════════════════════════════════════════════`);
        console.log(`📊 Total monedas P2P: ${monedasP2P.length}`);
        console.log('═══════════════════════════════════════════════════════════\n');
        
        return monedasP2P;
        
    } catch (error) {
        console.error('❌ Error al obtener monedas P2P:', error.message);
        throw error;
    }
}

/**
 * Crear un mapa de monedas por nombre para fácil acceso
 * @returns {Promise<Object>} Objeto con monedas indexadas por nombre
 */
async function crearMapaMonedas() {
    try {
        const categorias = await getAllCoins();
        const mapa = {};
        
        categorias.forEach(categoria => {
            if (categoria.coins) {
                categoria.coins.forEach(coin => {
                    // Indexar por nombre normalizado
                    const nombreKey = coin.name.toUpperCase().replace(/\s+/g, '_');
                    const tickKey = coin.tick.toUpperCase();
                    
                    mapa[nombreKey] = {
                        id: coin.id,
                        name: coin.name,
                        tick: coin.tick,
                        categoria: categoria.name,
                        p2p_enabled: coin.enabled_p2p,
                        price: coin.price
                    };
                    
                    // También indexar por tick si es diferente
                    if (tickKey !== nombreKey) {
                        mapa[tickKey] = mapa[nombreKey];
                    }
                });
            }
        });
        
        return mapa;
        
    } catch (error) {
        console.error('❌ Error al crear mapa de monedas:', error.message);
        throw error;
    }
}

module.exports = {
    obtenerTodasLasMonedas,
    buscarMoneda,
    obtenerDetallesMoneda,
    obtenerMonedasP2P,
    crearMapaMonedas
};
