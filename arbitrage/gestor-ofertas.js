/**
 * 🤖 GESTOR AUTOMÁTICO DE OFERTAS P2P
 * 
 * Sistema que publica y gestiona ofertas automáticamente:
 * - Crea ofertas con precios óptimos
 * - Detecta cuando tienen peer (alguien las acepta)
 * - Renueva ofertas antiguas sin peer (>20 min)
 */

const fetch = require('node-fetch');
const config = require('./config-gestor-ofertas');
const { calcularPreciosPorMoneda } = require('./utils/calcular-precios');
const { aplicarFiltrosEstandar } = require('./utils/filtros');
const { obtenerConfiguracionEstrategia } = require('./config-estrategia');
const {
    obtenerMisOfertas,
    crearOferta,
    cancelarOferta,
    filtrarOfertasSinPeer,
    filtrarOfertasConPeer,
    calcularEdadOferta,
    necesitaRenovacion,
    encontrarOfertaGestionada
} = require('./utils/api-ofertas');
const { notificarOportunidad } = require('./utils/notificaciones');

// Estadísticas
let estadisticas = {
    ofertasCreadas: 0,
    ofertasRenovadas: 0,
    peersDetectados: 0,
    inicioSesion: new Date()
};

// Caché de peers detectados (para no notificar duplicados)
const peersNotificados = new Map();

/**
 * Obtener ofertas del mercado (igual que el monitor)
 */
async function obtenerOfertas() {
    try {
        const [response1, response2] = await Promise.all([
            fetch('https://api.qvapay.com/p2p/index?page=1', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${config.token}`
                }
            }),
            fetch('https://api.qvapay.com/p2p/index?page=2', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${config.token}`
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
 * Calcular precios de referencia (igual que el monitor)
 */
async function calcularPreciosReferencia() {
    const ofertasOriginales = await obtenerOfertas();
    
    if (ofertasOriginales.length === 0) {
        return {};
    }
    
    const ofertas = aplicarFiltrosEstandar(ofertasOriginales, {
        incluirVIP: false,
        requiereKYC: true,
        soloPublicas: true,
        soloCUP: true
    });
    
    const configEstrategia = obtenerConfiguracionEstrategia();
    const precios = calcularPreciosPorMoneda(ofertas, configEstrategia);
    
    return precios;
}

/**
 * Calcular precio óptimo para una oferta
 * @param {Object} preciosRef - Objeto con estructura {compra, venta}
 * @param {string} tipo - 'compra' o 'venta'
 * @returns {number} Precio óptimo calculado
 */
function calcularPrecioOptimo(preciosRef, tipo) {
    if (tipo === 'venta') {
        // Para vender, usar el precio de venta calculado
        return preciosRef.venta;
    } else {
        // Para comprar, usar el precio de compra calculado
        return preciosRef.compra;
    }
}

/**
 * Crear una nueva oferta basada en config y precios óptimos
 */
async function crearOfertaNueva(configOferta, preciosReferencia) {
    const preciosMoneda = preciosReferencia[configOferta.moneda];
    
    if (!preciosMoneda) {
        console.log(`   ⚠️  No hay precios de referencia para ${configOferta.moneda}`);
        return null;
    }
    
    const precioOptimo = calcularPrecioOptimo(preciosMoneda.precios, configOferta.tipo);
    const cantidadCUP = parseFloat((configOferta.cantidadUSD * precioOptimo).toFixed(2));
    
    // Preparar datos según tipo de oferta
    let datosOferta;
    if (configOferta.tipo === 'venta') {
        // Vendo USD, recibo CUP
        datosOferta = {
            type: 'sell',
            coin: configOferta.moneda,  // Usar string 'BANK_CUP' directamente
            amount: configOferta.cantidadUSD,
            receive: cantidadCUP,
            details: configOferta.detallesPago,
            only_kyc: configOferta.soloKYC ? 1 : 0,
            private: configOferta.privada ? 1 : 0,
            only_vip: configOferta.soloVIP ? 1 : 0,
            message: configOferta.mensaje || undefined
        };
    } else {
        // Compro USD, pago CUP
        datosOferta = {
            type: 'buy',
            coin: configOferta.moneda,  // Usar string 'BANK_CUP' directamente
            amount: configOferta.cantidadUSD,
            receive: cantidadCUP,
            details: configOferta.detallesPago,
            only_kyc: configOferta.soloKYC ? 1 : 0,
            private: configOferta.privada ? 1 : 0,
            only_vip: configOferta.soloVIP ? 1 : 0,
            message: configOferta.mensaje || undefined
        };
    }
    
    console.log(`\n   📝 Creando oferta de ${configOferta.tipo.toUpperCase()}:`);
    console.log(`      💰 ${configOferta.cantidadUSD} USD → ${cantidadCUP} CUP`);
    console.log(`      📊 Tasa: ${precioOptimo.toFixed(2)} CUP/USD`);
    
    const resultado = await crearOferta(config.token, datosOferta);
    
    if (resultado.exito) {
        console.log(`      ✅ Oferta creada: ${resultado.oferta.uuid.substring(0, 8)}...`);
        estadisticas.ofertasCreadas++;
        return resultado.oferta;
    } else {
        console.log(`      ❌ Error: ${resultado.error}`);
        return null;
    }
}

/**
 * Notificar peer detectado
 */
async function notificarPeerDetectado(oferta) {
    const uuid = oferta.uuid;
    
    // Evitar notificar el mismo peer múltiples veces
    if (peersNotificados.has(uuid)) {
        return;
    }
    
    peersNotificados.set(uuid, Date.now());
    
    const amount = parseFloat(oferta.amount);
    const receive = parseFloat(oferta.receive);
    const tasa = receive / amount;
    
    console.log(`\n   🎉 ¡PEER DETECTADO en oferta ${uuid.substring(0, 8)}...!`);
    console.log(`      👤 Peer ID: ${oferta.peer_id}`);
    console.log(`      💰 ${amount} USD → ${receive} CUP`);
    
    // Enviar notificación usando el sistema de notificaciones existente
    try {
        const oportunidad = {
            tipo: oferta.type === 'buy' ? 'compra' : 'venta',
            moneda: oferta.coin,
            amount: amount,
            receive: receive,
            tasa: tasa.toFixed(2),
            peer_id: oferta.peer_id,
            peer: oferta.Peer || {},
            uuid: uuid,
            link: `https://qvapay.com/p2p/${uuid}`,
            mensaje: `🎉 *¡OFERTA ACEPTADA!*\n\n` +
                    `Alguien aceptó tu oferta de *${oferta.type === 'buy' ? 'COMPRA' : 'VENTA'}*:\n\n` +
                    `💰 *Monto:* ${amount} USD → ${receive} CUP\n` +
                    `📊 *Tasa:* ${tasa.toFixed(2)} CUP/USD\n` +
                    `💱 *Moneda:* ${oferta.coin}\n\n` +
                    `👤 *Peer ID:* ${oferta.peer_id}\n` +
                    `📅 *Hora:* ${new Date().toLocaleTimeString('es-ES')}\n\n` +
                    `🔗 *Ver oferta:* https://qvapay.com/p2p/${uuid}\n\n` +
                    `_Completa la transacción en la plataforma_`
        };
        
        await notificarOportunidad(oportunidad);
        console.log(`      📲 Notificación enviada`);
    } catch (error) {
        console.error(`      ❌ Error al notificar:`, error.message);
    }
}

/**
 * Gestionar una oferta (verificar peer, renovar si es necesario)
 */
async function gestionarOferta(configOferta, misOfertas, preciosReferencia) {
    // Buscar si ya existe una oferta activa para esta configuración
    const ofertaExistente = encontrarOfertaGestionada(misOfertas, configOferta);
    
    if (!ofertaExistente) {
        // No existe, crear una nueva
        console.log(`\n   🆕 No hay oferta activa para: ${configOferta.id}`);
        await crearOfertaNueva(configOferta, preciosReferencia);
        return;
    }
    
    const uuid = ofertaExistente.uuid;
    const edad = calcularEdadOferta(ofertaExistente.created_at);
    
    // Verificar si tiene peer
    if (ofertaExistente.peer_id) {
        console.log(`\n   🎉 Oferta ${uuid.substring(0, 8)}... tiene PEER!`);
        
        if (config.gestion.notificarPeer) {
            await notificarPeerDetectado(ofertaExistente);
        }
        
        estadisticas.peersDetectados++;
        return;
    }
    
    // No tiene peer, verificar si necesita renovación
    if (necesitaRenovacion(ofertaExistente, config.gestion.tiempoMaximoSinPeer)) {
        console.log(`\n   🔄 Oferta ${uuid.substring(0, 8)}... sin peer (${edad} min)`);
        console.log(`      ❌ Eliminando oferta antigua...`);
        
        const resultadoCancel = await cancelarOferta(config.token, uuid);
        
        if (resultadoCancel.exito) {
            console.log(`      ✅ Oferta eliminada`);
            
            // Crear nueva con precios actualizados
            await crearOfertaNueva(configOferta, preciosReferencia);
            estadisticas.ofertasRenovadas++;
            
            if (config.gestion.notificarRenovacion) {
                console.log(`      📲 Renovación registrada`);
            }
        } else {
            console.log(`      ❌ Error al eliminar: ${resultadoCancel.error}`);
        }
    } else {
        // Aún no necesita renovación
        console.log(`   ⏳ Oferta ${uuid.substring(0, 8)}... - Sin peer (${edad} min de ${config.gestion.tiempoMaximoSinPeer} max)`);
    }
}

/**
 * Ciclo principal del gestor
 */
async function cicloGestor() {
    try {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log(`🔍 CICLO GESTOR - ${new Date().toLocaleString('es-ES')}`);
        console.log('═══════════════════════════════════════════════════════');
        
        // 1. Calcular precios de referencia (igual que el monitor)
        console.log('\n📊 Calculando precios de referencia...');
        const preciosReferencia = await calcularPreciosReferencia();
        
        if (!preciosReferencia || Object.keys(preciosReferencia).length === 0) {
            console.log('   ⚠️  No se pudieron calcular precios de referencia');
            return;
        }
        
        console.log('✅ Precios actualizados\n');
        
        // Mostrar precios calculados
        Object.entries(preciosReferencia).forEach(([moneda, data]) => {
            console.log(`   ${moneda}:`);
            console.log(`      🟢 Comprar hasta: ${data.precios.compra.toFixed(2)} CUP/USD`);
            console.log(`      🔴 Vender desde: ${data.precios.venta.toFixed(2)} CUP/USD`);
            if (data.ofertas && data.ofertas.length) {
                console.log(`      📊 ${data.ofertas.length} ofertas analizadas`);
            }
        });
        
        // 2. Obtener mis ofertas activas
        console.log('\n📋 Obteniendo mis ofertas activas...');
        const misOfertas = await obtenerMisOfertas(config.token);
        console.log(`   Total ofertas: ${misOfertas.length}`);
        
        const ofertasConPeer = filtrarOfertasConPeer(misOfertas);
        const ofertasSinPeer = filtrarOfertasSinPeer(misOfertas);
        
        console.log(`   🎉 Con peer: ${ofertasConPeer.length}`);
        console.log(`   ⏳ Sin peer: ${ofertasSinPeer.length}`);
        
        // 3. Gestionar cada oferta configurada
        console.log('\n🔧 Gestionando ofertas...');
        
        const ofertasHabilitadas = config.ofertas.filter(o => o.habilitada);
        console.log(`   Ofertas habilitadas en config: ${ofertasHabilitadas.length}`);
        
        for (const configOferta of ofertasHabilitadas) {
            await gestionarOferta(configOferta, misOfertas, preciosReferencia);
        }
        
        // 4. Mostrar estadísticas
        mostrarEstadisticas();
        
    } catch (error) {
        console.error('\n❌ Error en ciclo del gestor:', error.message);
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`⏰ Próximo ciclo en ${config.gestion.intervaloEscaneo} segundos...`);
    console.log('═══════════════════════════════════════════════════════\n');
}

/**
 * Mostrar estadísticas del gestor
 */
function mostrarEstadisticas() {
    const tiempoActivo = Math.floor((Date.now() - estadisticas.inicioSesion) / (1000 * 60));
    
    console.log('\n📊 ESTADÍSTICAS DEL GESTOR:');
    console.log(`   ⏰ Tiempo activo: ${tiempoActivo} minutos`);
    console.log(`   ✅ Ofertas creadas: ${estadisticas.ofertasCreadas}`);
    console.log(`   🔄 Ofertas renovadas: ${estadisticas.ofertasRenovadas}`);
    console.log(`   🎉 Peers detectados: ${estadisticas.peersDetectados}`);
}

/**
 * Iniciar gestor
 */
async function iniciar() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║     🤖 GESTOR AUTOMÁTICO DE OFERTAS P2P             ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
    
    console.log('⚙️  CONFIGURACIÓN:');
    console.log(`   • Intervalo: ${config.gestion.intervaloEscaneo} segundos`);
    console.log(`   • Tiempo max sin peer: ${config.gestion.tiempoMaximoSinPeer} minutos`);
    console.log(`   • Ofertas activas: ${config.ofertas.filter(o => o.habilitada).length}`);
    
    config.ofertas.filter(o => o.habilitada).forEach(o => {
        console.log(`     - ${o.id}: ${o.tipo.toUpperCase()} ${o.cantidadUSD} USD (${o.moneda})`);
    });
    
    console.log('\n🛑 Para detener: Presiona Ctrl+C\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Ejecutar primer ciclo inmediatamente
    await cicloGestor();
    
    // Programar ciclos siguientes
    setInterval(cicloGestor, config.gestion.intervaloEscaneo * 1000);
}

// Manejo de señal de interrupción
process.on('SIGINT', () => {
    console.log('\n\n═══════════════════════════════════════════════════════');
    console.log('🛑 Gestor detenido por el usuario');
    mostrarEstadisticas();
    console.log('═══════════════════════════════════════════════════════\n');
    process.exit(0);
});

// Iniciar
iniciar().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});
