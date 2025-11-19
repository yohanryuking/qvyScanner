/**
 * 🔧 API Wrapper para gestión de ofertas P2P
 * 
 * Simplifica las operaciones con ofertas en QvaPay P2P
 */

const fetch = require('node-fetch');
const API_BASE_URL = 'https://api.qvapay.com';

/**
 * Obtener mis ofertas activas
 */
async function obtenerMisOfertas(token) {
    const url = `${API_BASE_URL}/p2p/index?my=true`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            return result.data || [];
        } else {
            throw new Error(result.message || 'Error al obtener ofertas');
        }
    } catch (error) {
        console.error('❌ Error al obtener mis ofertas:', error.message);
        return [];
    }
}

/**
 * Crear una nueva oferta P2P
 */
async function crearOferta(token, datosOferta) {
    const url = `${API_BASE_URL}/p2p/create`;
    
    // Asegurar que amount y receive sean números parseados correctamente
    const amount = typeof datosOferta.amount === 'string' 
        ? parseFloat(datosOferta.amount) 
        : datosOferta.amount;
    
    const receive = typeof datosOferta.receive === 'string' 
        ? parseFloat(datosOferta.receive) 
        : datosOferta.receive;
    
    const body = {
        type: datosOferta.type,              // 'buy' o 'sell'
        coin: datosOferta.coin,              // String de la moneda (ej: 'BANK_CUP')
        amount: amount,                       // Monto a enviar/recibir (número)
        receive: receive,                     // Monto a recibir/pagar (número)
        details: datosOferta.details,        // Array de {name, value}
        only_kyc: datosOferta.only_kyc || 0,
        private: datosOferta.private || 0,
        only_vip: datosOferta.only_vip || 0
    };
    
    if (datosOferta.message) {
        body.message = datosOferta.message;
    }
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        const result = await response.json();
        
        if (response.status === 201 || response.ok) {
            return {
                exito: true,
                oferta: result.p2p
            };
        } else {
            // Mostrar más detalles del error
            console.error('      ⚠️  Respuesta del servidor:', JSON.stringify(result, null, 2));
            return {
                exito: false,
                error: result.message || result.error || JSON.stringify(result)
            };
        }
    } catch (error) {
        console.error('❌ Error al crear oferta:', error.message);
        return {
            exito: false,
            error: error.message
        };
    }
}

/**
 * Cancelar/eliminar una oferta
 * Endpoint: POST /p2p/{uuid}/cancel
 * Según documentación: No retorna body en la respuesta
 */
async function cancelarOferta(token, uuid) {
    const url = `${API_BASE_URL}/p2p/${uuid}/cancel`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        // La API no retorna body según documentación
        // Solo verificamos el status code
        if (response.ok) {
            // Status 200-299 = éxito
            return { 
                exito: true,
                status: response.status
            };
        } else {
            // Intentar obtener error del body si existe
            let errorMsg = `HTTP ${response.status}`;
            try {
                const text = await response.text();
                if (text) {
                    // Intentar parsear como JSON
                    try {
                        const json = JSON.parse(text);
                        errorMsg = json.message || json.error || text;
                    } catch {
                        errorMsg = text;
                    }
                }
            } catch {
                // Si no hay body, usar solo el status
            }
            
            return {
                exito: false,
                error: errorMsg,
                status: response.status
            };
        }
    } catch (error) {
        console.error('❌ Error al cancelar oferta:', error.message);
        return {
            exito: false,
            error: error.message
        };
    }
}

/**
 * Obtener balance/saldo del usuario
 * NOTA: Esta función está deprecada. Usa obtenerBalance de utils/usuario.js
 */
async function obtenerBalance(token) {
    const url = `${API_BASE_URL}/user`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.balance !== undefined) {
            return {
                exito: true,
                balance: parseFloat(data.balance),
                usuario: data
            };
        } else {
            return {
                exito: false,
                error: data.message || data.error || 'Error al obtener balance'
            };
        }
    } catch (error) {
        console.error('❌ Error al obtener balance:', error.message);
        return {
            exito: false,
            error: error.message
        };
    }
}

/**
 * Filtrar solo ofertas abiertas (sin peer asignado)
 */
function filtrarOfertasSinPeer(ofertas) {
    return ofertas.filter(o => 
        o.status === 'open' && 
        (!o.peer_id || o.peer_id === null)
    );
}

/**
 * Filtrar ofertas con peer (alguien las aceptó)
 */
function filtrarOfertasConPeer(ofertas) {
    return ofertas.filter(o => 
        o.status === 'open' && 
        o.peer_id !== null && 
        o.peer_id !== undefined
    );
}

/**
 * Calcular edad de una oferta en minutos
 */
function calcularEdadOferta(fechaCreacion) {
    const ahora = new Date();
    const creacion = new Date(fechaCreacion);
    const diferenciaMs = ahora - creacion;
    return Math.floor(diferenciaMs / (1000 * 60));
}

/**
 * Verificar si una oferta necesita renovación
 */
function necesitaRenovacion(oferta, tiempoMaximo) {
    // Si tiene peer, no renovar
    if (oferta.peer_id) return false;
    
    // Si no está abierta, no renovar
    if (oferta.status !== 'open') return false;
    
    // Calcular edad
    const edad = calcularEdadOferta(oferta.created_at);
    
    return edad >= tiempoMaximo;
}

/**
 * Encontrar oferta gestionada por el sistema
 */
function encontrarOfertaGestionada(misOfertas, configOferta) {
    // Buscar por moneda, tipo y cantidad similar
    return misOfertas.find(o => {
        const tipoCoincide = (configOferta.tipo === 'compra' && o.type === 'buy') ||
                             (configOferta.tipo === 'venta' && o.type === 'sell');
        const monedaCoincide = o.coin === configOferta.moneda;
        const cantidadSimilar = Math.abs(parseFloat(o.amount) - configOferta.cantidadUSD) < 0.01;
        
        return tipoCoincide && monedaCoincide && cantidadSimilar && o.status === 'open';
    });
}

module.exports = {
    obtenerMisOfertas,
    crearOferta,
    cancelarOferta,
    obtenerBalance,
    filtrarOfertasSinPeer,
    filtrarOfertasConPeer,
    calcularEdadOferta,
    necesitaRenovacion,
    encontrarOfertaGestionada
};
