/**
 * 👤 UTILIDAD - Información del Usuario
 * 
 * Funciones para obtener información del usuario autenticado
 * de forma simple y reutilizable.
 */

const fetch = require('node-fetch');
const API_BASE_URL = 'https://api.qvapay.com';

/**
 * Obtener datos básicos del usuario (incluye balance)
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} { exito, usuario, balance, error }
 */
async function obtenerDatosUsuario(token) {
    const url = `${API_BASE_URL}/user`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const error = await response.text();
            return {
                exito: false,
                error: `HTTP ${response.status}: ${error}`
            };
        }
        
        const usuario = await response.json();
        
        return {
            exito: true,
            usuario: usuario,
            balance: parseFloat(usuario.balance),
            satoshis: usuario.satoshis,
            nombre: `${usuario.name} ${usuario.lastname}`.trim(),
            username: usuario.username,
            kyc: usuario.kyc,
            p2pHabilitado: usuario.p2p_enabled,
            verificado: usuario.phone_verified
        };
        
    } catch (error) {
        return {
            exito: false,
            error: error.message
        };
    }
}

/**
 * Obtener solo el balance del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} { exito, balance, error }
 */
async function obtenerBalance(token) {
    try {
        const resultado = await obtenerDatosUsuario(token);
        
        if (!resultado.exito) {
            return {
                exito: false,
                error: resultado.error
            };
        }
        
        return {
            exito: true,
            balance: resultado.balance
        };
        
    } catch (error) {
        return {
            exito: false,
            error: error.message
        };
    }
}

/**
 * Obtener datos extendidos del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} { exito, usuario, error }
 */
async function obtenerDatosExtendidos(token) {
    const url = `${API_BASE_URL}/user/extended`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const error = await response.text();
            return {
                exito: false,
                error: `HTTP ${response.status}: ${error}`
            };
        }
        
        const usuario = await response.json();
        
        return {
            exito: true,
            usuario: usuario,
            balance: parseFloat(usuario.balance),
            balancePendiente: parseFloat(usuario.pending_balance),
            satoshis: usuario.satoshis,
            trustscore: usuario.trustscore,
            vip: usuario.vip,
            kyc: usuario.kyc,
            kycData: usuario.KYC
        };
        
    } catch (error) {
        return {
            exito: false,
            error: error.message
        };
    }
}

/**
 * Obtener estado KYC del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} { exito, kyc, error }
 */
async function obtenerEstadoKYC(token) {
    const url = `${API_BASE_URL}/user/kyc`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const error = await response.text();
            return {
                exito: false,
                error: `HTTP ${response.status}: ${error}`
            };
        }
        
        const kyc = await response.json();
        
        return {
            exito: true,
            kyc: kyc
        };
        
    } catch (error) {
        return {
            exito: false,
            error: error.message
        };
    }
}

/**
 * Verificar si el usuario tiene suficiente balance
 * @param {string} token - Token de autenticación
 * @param {number} cantidadRequerida - Cantidad mínima requerida
 * @returns {Promise<Object>} { exito, tieneSuficiente, balance, error }
 */
async function verificarBalanceSuficiente(token, cantidadRequerida) {
    try {
        const resultado = await obtenerBalance(token);
        
        if (!resultado.exito) {
            return {
                exito: false,
                error: resultado.error
            };
        }
        
        return {
            exito: true,
            tieneSuficiente: resultado.balance >= cantidadRequerida,
            balance: resultado.balance,
            faltante: Math.max(0, cantidadRequerida - resultado.balance)
        };
        
    } catch (error) {
        return {
            exito: false,
            error: error.message
        };
    }
}

module.exports = {
    obtenerDatosUsuario,
    obtenerBalance,
    obtenerDatosExtendidos,
    obtenerEstadoKYC,
    verificarBalanceSuficiente
};
