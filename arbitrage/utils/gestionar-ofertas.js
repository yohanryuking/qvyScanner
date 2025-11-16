/**
 * 🔄 Utilidades - Gestión de Ofertas P2P
 * 
 * Funciones para gestionar el ciclo de vida de las ofertas:
 * - Detectar peers (ofertas aceptadas)
 * - Renovar ofertas antiguas
 * - Actualizar precios
 * - Sincronizar con configuración
 */

const { obtenerMisOfertas, cancelarOferta, necesitaRenovacion, filtrarOfertasConPeer } = require('./api-ofertas');
const { publicarOfertaCompra, publicarOfertaVenta } = require('./publicar-ofertas');
const { notificarOportunidad } = require('./notificaciones');

/**
 * Detectar ofertas con peer (alguien las aceptó)
 * @param {Array} ofertas - Array de ofertas
 * @returns {Array} Ofertas con peer detectado
 */
function detectarPeers(ofertas) {
    const ofertasConPeer = filtrarOfertasConPeer(ofertas);
    
    return ofertasConPeer.map(oferta => ({
        uuid: oferta.uuid,
        tipo: oferta.type,
        moneda: oferta.coin,
        amount: oferta.amount,
        receive: oferta.receive,
        tasa: (oferta.receive / oferta.amount).toFixed(2),
        peer: oferta.Peer || null,
        usuario: oferta.Peer?.User || null,
        link: `https://qvapay.com/p2p/${oferta.uuid}`,
        ofertaCompleta: oferta
    }));
}

/**
 * Notificar peers detectados
 * @param {Array} peersDetectados - Array de ofertas con peer
 */
async function notificarPeersDetectados(peersDetectados) {
    for (const peer of peersDetectados) {
        const mensaje = formatearNotificacionPeer(peer);
        console.log(mensaje);
        
        // Aquí podrías enviar notificación real
        // await notificarOportunidad({ ...peer, tipo: 'peer' });
    }
}

/**
 * Formatear mensaje de peer detectado
 */
function formatearNotificacionPeer(peer) {
    const emoji = peer.tipo === 'buy' ? '🟢' : '🔴';
    const accion = peer.tipo === 'buy' ? 'COMPRA' : 'VENTA';
    
    let mensaje = `\n${emoji} ¡OFERTA ACEPTADA!\n`;
    mensaje += `═══════════════════════════════════════════════════════════\n`;
    mensaje += `📊 Tipo: ${accion}\n`;
    mensaje += `💱 Moneda: ${peer.moneda}\n`;
    mensaje += `💰 Monto: ${peer.amount} USD → ${peer.receive} CUP\n`;
    mensaje += `📈 Tasa: ${peer.tasa} CUP/USD\n`;
    
    if (peer.usuario) {
        mensaje += `\n👤 USUARIO:\n`;
        mensaje += `   Nombre: ${peer.usuario.username || 'N/A'}\n`;
        mensaje += `   KYC: ${peer.usuario.kyc ? '✅' : '❌'}\n`;
        if (peer.usuario.rating_avg) {
            mensaje += `   Rating: ${parseFloat(peer.usuario.rating_avg).toFixed(1)} ⭐\n`;
        }
    }
    
    mensaje += `\n🔗 Link: ${peer.link}\n`;
    mensaje += `═══════════════════════════════════════════════════════════\n`;
    
    return mensaje;
}

/**
 * Identificar ofertas que necesitan renovación
 * @param {Array} ofertas - Mis ofertas activas
 * @param {number} tiempoMaximo - Minutos máximos sin peer
 * @returns {Array} Ofertas que necesitan renovación
 */
function identificarOfertasParaRenovar(ofertas, tiempoMaximo) {
    return ofertas.filter(oferta => necesitaRenovacion(oferta, tiempoMaximo));
}

/**
 * Renovar una oferta (eliminar y crear nueva)
 * @param {string} token - Token de autenticación
 * @param {string} email - Email del usuario
 * @param {string} password - Password del usuario
 * @param {Object} oferta - Oferta a renovar
 * @param {Object} nuevosPrecios - Nuevos precios calculados
 * @param {string} twoFactorCode - Código 2FA
 */
async function renovarOferta(token, email, password, oferta, nuevosPrecios, twoFactorCode) {
    console.log(`\n🔄 Renovando oferta ${oferta.uuid}...`);
    console.log(`   Edad: ${calcularEdadOferta(oferta.created_at)} minutos`);
    console.log(`   Precio anterior: ${(oferta.receive / oferta.amount).toFixed(2)} CUP/USD`);
    
    try {
        // 1. Cancelar oferta antigua
        console.log('   ❌ Cancelando oferta antigua...');
        const resultadoCancelacion = await cancelarOferta(token, oferta.uuid);
        
        if (!resultadoCancelacion.exito) {
            console.error('   ❌ Error al cancelar:', resultadoCancelacion.error);
            return { exito: false, error: resultadoCancelacion.error };
        }
        
        console.log('   ✅ Oferta cancelada');
        
        // 2. Preparar datos para nueva oferta
        const tipo = oferta.type === 'buy' ? 'compra' : 'venta';
        const moneda = oferta.coin;
        
        // Obtener nuevo precio según el tipo
        let nuevoPrecio;
        if (nuevosPrecios && nuevosPrecios[moneda]) {
            nuevoPrecio = tipo === 'compra' 
                ? nuevosPrecios[moneda].precios.compra 
                : nuevosPrecios[moneda].precios.venta;
        } else {
            // Si no hay nuevos precios, usar el mismo
            nuevoPrecio = oferta.receive / oferta.amount;
        }
        
        const datosOferta = {
            coin: moneda,
            amount: oferta.amount,
            receive: Math.round(oferta.amount * nuevoPrecio),
            details: oferta.details
        };
        
        const opciones = {
            only_kyc: oferta.only_kyc || 0,
            only_vip: oferta.only_vip || 0,
            private: oferta.private || 0,
            message: oferta.message || ''
        };
        
        // 3. Crear nueva oferta
        console.log(`   ✅ Creando nueva oferta a ${nuevoPrecio.toFixed(2)} CUP/USD...`);
        
        let resultado;
        if (tipo === 'compra') {
            resultado = await publicarOfertaCompra(email, password, datosOferta, opciones, twoFactorCode);
        } else {
            resultado = await publicarOfertaVenta(email, password, datosOferta, opciones, twoFactorCode);
        }
        
        if (resultado.exito) {
            console.log(`   ✅ Oferta renovada exitosamente`);
            console.log(`   🆔 Nueva UUID: ${resultado.oferta.uuid}`);
            return {
                exito: true,
                ofertaAntigua: oferta.uuid,
                ofertaNueva: resultado.oferta.uuid,
                precioAnterior: (oferta.receive / oferta.amount).toFixed(2),
                precioNuevo: nuevoPrecio.toFixed(2)
            };
        } else {
            console.error(`   ❌ Error al crear nueva oferta`);
            return { exito: false, error: 'Error al crear nueva oferta' };
        }
        
    } catch (error) {
        console.error('   ❌ Error al renovar oferta:', error.message);
        return { exito: false, error: error.message };
    }
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
 * Sincronizar ofertas con configuración
 * Verifica que existan las ofertas configuradas
 * @param {Array} misOfertas - Mis ofertas actuales
 * @param {Array} ofertasConfig - Ofertas configuradas
 * @returns {Object} Estado de sincronización
 */
function sincronizarConConfiguracion(misOfertas, ofertasConfig) {
    const resultado = {
        ofertasExistentes: [],
        ofertasFaltantes: [],
        ofertasExtra: []
    };
    
    // Verificar cada oferta configurada
    ofertasConfig.forEach(config => {
        if (!config.habilitada) return;
        
        const ofertaExistente = misOfertas.find(o => {
            const tipoCoincide = (config.tipo === 'compra' && o.type === 'buy') ||
                                 (config.tipo === 'venta' && o.type === 'sell');
            const monedaCoincide = o.coin === config.moneda;
            const cantidadSimilar = Math.abs(parseFloat(o.amount) - config.cantidadUSD) < 0.01;
            
            return tipoCoincide && monedaCoincide && cantidadSimilar && o.status === 'open';
        });
        
        if (ofertaExistente) {
            resultado.ofertasExistentes.push({
                config,
                oferta: ofertaExistente
            });
        } else {
            resultado.ofertasFaltantes.push(config);
        }
    });
    
    return resultado;
}

/**
 * Crear ofertas faltantes según configuración
 */
async function crearOfertasFaltantes(email, password, ofertasFaltantes, precios, twoFactorCode) {
    const resultados = [];
    
    for (const config of ofertasFaltantes) {
        console.log(`\n📝 Creando oferta ${config.tipo} para ${config.moneda}...`);
        
        try {
            // Obtener precio óptimo
            const preciosMoneda = precios[config.moneda];
            if (!preciosMoneda || !preciosMoneda.precios) {
                console.log(`   ⚠️  No hay precios disponibles para ${config.moneda}`);
                continue;
            }
            
            const precio = config.tipo === 'compra' 
                ? preciosMoneda.precios.compra 
                : preciosMoneda.precios.venta;
            
            const datosOferta = {
                coin: config.moneda,
                amount: config.cantidadUSD,
                receive: Math.round(config.cantidadUSD * precio),
                details: config.detallesPago
            };
            
            const opciones = {
                only_kyc: config.soloKYC ? 1 : 0,
                only_vip: config.soloVIP ? 1 : 0,
                private: config.privada ? 1 : 0,
                message: config.mensaje || ''
            };
            
            let resultado;
            if (config.tipo === 'compra') {
                resultado = await publicarOfertaCompra(email, password, datosOferta, opciones, twoFactorCode);
            } else {
                resultado = await publicarOfertaVenta(email, password, datosOferta, opciones, twoFactorCode);
            }
            
            resultados.push({
                config,
                resultado
            });
            
            // Esperar un poco entre creaciones
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            console.error(`   ❌ Error al crear oferta:`, error.message);
            resultados.push({
                config,
                error: error.message
            });
        }
    }
    
    return resultados;
}

/**
 * Generar reporte de gestión
 */
function generarReporte(ciclo, peersDetectados, ofertasRenovadas, ofertasCreadas) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log(`║         📊 REPORTE DE GESTIÓN - Ciclo ${ciclo}                ║`);
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    console.log(`🎉 Peers detectados: ${peersDetectados.length}`);
    console.log(`🔄 Ofertas renovadas: ${ofertasRenovadas.length}`);
    console.log(`✨ Ofertas creadas: ${ofertasCreadas.length}\n`);
    
    if (peersDetectados.length > 0) {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🎉 PEERS DETECTADOS:');
        peersDetectados.forEach((peer, i) => {
            console.log(`   ${i + 1}. ${peer.tipo.toUpperCase()} - ${peer.amount} USD @ ${peer.tasa} CUP/USD`);
        });
    }
    
    if (ofertasRenovadas.length > 0) {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🔄 OFERTAS RENOVADAS:');
        ofertasRenovadas.forEach((ren, i) => {
            console.log(`   ${i + 1}. ${ren.precioAnterior} → ${ren.precioNuevo} CUP/USD`);
        });
    }
    
    console.log('═══════════════════════════════════════════════════════════\n');
}

module.exports = {
    detectarPeers,
    notificarPeersDetectados,
    formatearNotificacionPeer,
    identificarOfertasParaRenovar,
    renovarOferta,
    calcularEdadOferta,
    sincronizarConConfiguracion,
    crearOfertasFaltantes,
    generarReporte
};
