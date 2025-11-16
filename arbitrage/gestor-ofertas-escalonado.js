/**
 * 🎯 GESTOR ESCALONADO DE OFERTAS - QvaPay P2P
 * 
 * Crea ofertas en escalas progresivas: 1, 2, 3, 5, 10, 15, 20, 25, 30...
 * Cuando no hay capital suficiente, fracciona el restante.
 * 
 * Estrategia:
 * 1. Obtener balance disponible
 * 2. Crear ofertas siguiendo la escala predefinida
 * 3. Si no alcanza para la siguiente escala, fracciona el restante
 * 4. Repite el proceso constantemente
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
    necesitaRenovacion
} = require('./utils/api-ofertas');
const { obtenerBalance } = require('./utils/usuario');
const { notificarOportunidad } = require('./utils/notificaciones');

// 📊 ESCALA DE OFERTAS (en USD)
const ESCALA_OFERTAS = [1, 2, 3, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100];

// Configuración
const TIPO_OFERTA = 'venta'; // 'compra' o 'venta'
const MONEDA = 'BANK_CUP';
const INTERVALO_ESCANEO = 60; // segundos
const TIEMPO_MAX_SIN_PEER = 10; // minutos

// Estadísticas
let estadisticas = {
    ofertasCreadas: 0,
    ofertasRenovadas: 0,
    peersDetectados: 0,
    capitalInvertido: 0,
    inicioSesion: new Date()
};

// Caché de peers detectados para evitar notificaciones duplicadas
// Estructura: { ofertaId: { peer_uuid, timestamp } }
const peersNotificados = new Map();

// Tiempo para limpiar el caché (30 minutos)
const TIEMPO_CACHE_MS = 30 * 60 * 1000;

/**
 * Limpiar caché de peers antiguos
 */
function limpiarCachePeers() {
    const ahora = Date.now();
    for (const [key, value] of peersNotificados.entries()) {
        if (ahora - value.timestamp > TIEMPO_CACHE_MS) {
            peersNotificados.delete(key);
        }
    }
}

/**
 * Notificar cuando se detecta un peer en una oferta
 */
async function notificarPeerDetectado(oferta) {
    const ofertaId = oferta.uuid;
    const peerUuid = oferta.peer ? oferta.peer.uuid : null;
    
    if (!peerUuid) return;
    
    // Verificar si ya notificamos sobre este peer en esta oferta
    const cacheKey = `${ofertaId}-${peerUuid}`;
    if (peersNotificados.has(cacheKey)) {
        return; // Ya notificado
    }
    
    // Registrar en caché
    peersNotificados.set(cacheKey, {
        peer_uuid: peerUuid,
        timestamp: Date.now()
    });
    
    estadisticas.peersDetectados++;
    
    // Preparar mensaje
    const tipo = oferta.type === 'sell' ? 'VENTA' : 'COMPRA';
    const emoji = oferta.type === 'sell' ? '🔴' : '🟢';
    const peerUsername = oferta.peer.username || 'Desconocido';
    const amount = parseFloat(oferta.amount);
    const receive = parseFloat(oferta.receive);
    const tasa = (receive / amount).toFixed(2);
    
    let mensaje = `${emoji} <b>PEER DETECTADO - ${tipo}</b>\n\n`;
    mensaje += `🆔 Oferta: ${ofertaId.substring(0, 8)}...\n`;
    mensaje += `💰 Monto: ${amount} USD → ${receive} CUP\n`;
    mensaje += `📊 Tasa: ${tasa} CUP/USD\n`;
    mensaje += `👤 Peer: @${peerUsername}\n`;
    mensaje += `⏰ ${new Date().toLocaleTimeString('es-ES')}`;
    
    console.log(`\n   🎉 ¡PEER DETECTADO! Oferta ${ofertaId.substring(0, 8)}... - @${peerUsername}`);
    console.log(`   📲 Enviando notificación...`);
    
    try {
        await enviarPorTelegram(mensaje);
        console.log(`   ✅ Notificación enviada`);
    } catch (error) {
        console.log(`   ⚠️  Error al enviar notificación: ${error.message}`);
    }
    
    // Limpiar caché cada vez que notificamos
    limpiarCachePeers();
}

/**
 * Notificar cuando se crea una oferta
 */
async function notificarOfertaCreada(oferta, cantidadUSD, cantidadCUP, tasa) {
    const tipo = TIPO_OFERTA === 'venta' ? 'VENTA' : 'COMPRA';
    const emoji = TIPO_OFERTA === 'venta' ? '🔴' : '🟢';
    
    let mensaje = `${emoji} <b>OFERTA CREADA - ${tipo}</b>\n\n`;
    mensaje += `🆔 ID: ${oferta.uuid.substring(0, 8)}...\n`;
    mensaje += `💰 Monto: ${cantidadUSD} USD → ${cantidadCUP} CUP\n`;
    mensaje += `📊 Tasa: ${tasa.toFixed(2)} CUP/USD\n`;
    mensaje += `💵 Moneda: ${MONEDA}\n`;
    mensaje += `⏰ ${new Date().toLocaleTimeString('es-ES')}`;
    
    try {
        await enviarPorTelegram(mensaje);
    } catch (error) {
        console.log(`   ⚠️  Error al enviar notificación: ${error.message}`);
    }
}

/**
 * Notificar cuando se renueva una oferta
 */
async function notificarOfertaRenovada(ofertaVieja, ofertaNueva, edad) {
    const tipo = TIPO_OFERTA === 'venta' ? 'VENTA' : 'COMPRA';
    const emoji = '🔄';
    
    const amount = parseFloat(ofertaNueva.amount);
    const receive = parseFloat(ofertaNueva.receive);
    const tasa = (receive / amount).toFixed(2);
    
    let mensaje = `${emoji} <b>OFERTA RENOVADA - ${tipo}</b>\n\n`;
    mensaje += `🆔 ID anterior: ${ofertaVieja.substring(0, 8)}...\n`;
    mensaje += `🆔 ID nueva: ${ofertaNueva.uuid.substring(0, 8)}...\n`;
    mensaje += `💰 Monto: ${amount} USD → ${receive} CUP\n`;
    mensaje += `📊 Tasa: ${tasa} CUP/USD\n`;
    mensaje += `⏱️  Sin peer por: ${edad} minutos\n`;
    mensaje += `⏰ ${new Date().toLocaleTimeString('es-ES')}`;
    
    try {
        await enviarPorTelegram(mensaje);
    } catch (error) {
        console.log(`   ⚠️  Error al enviar notificación: ${error.message}`);
    }
}

/**
 * Obtener ofertas del mercado
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
 * Calcular precios de referencia
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
 * Calcular cantidades de ofertas necesarias según balance
 */
function calcularOfertasNecesarias(balanceDisponible, ofertasExistentes) {
    const ofertasACrear = [];
    let capitalRestante = balanceDisponible;
    
    // Obtener cantidades ya existentes
    const cantidadesExistentes = ofertasExistentes
        .filter(o => o.status === 'open' && !o.peer_id)
        .map(o => parseFloat(o.amount));
    
    console.log(`\n   💰 Balance disponible: $${balanceDisponible.toFixed(2)}`);
    console.log(`   📊 Ofertas activas: ${cantidadesExistentes.length}`);
    if (cantidadesExistentes.length > 0) {
        console.log(`   📋 Cantidades: ${cantidadesExistentes.map(c => `$${c}`).join(', ')}`);
    }
    
    // Recorrer la escala
    for (const cantidad of ESCALA_OFERTAS) {
        // Si ya existe una oferta con esta cantidad, saltar
        if (cantidadesExistentes.includes(cantidad)) {
            continue;
        }
        
        // Si tenemos capital suficiente, agregarla
        if (capitalRestante >= cantidad) {
            ofertasACrear.push(cantidad);
            capitalRestante -= cantidad;
        }
    }
    
    // Si sobra capital, fraccionarlo
    if (capitalRestante >= 1) {
        // Intentar crear ofertas fraccionadas
        const fraccionada = Math.floor(capitalRestante);
        if (fraccionada >= 1) {
            ofertasACrear.push(fraccionada);
            capitalRestante -= fraccionada;
        }
    }
    
    console.log(`\n   ✅ Ofertas a crear: ${ofertasACrear.length}`);
    if (ofertasACrear.length > 0) {
        console.log(`   📋 Cantidades: ${ofertasACrear.map(c => `$${c}`).join(', ')}`);
    }
    console.log(`   💵 Capital restante: $${capitalRestante.toFixed(2)}\n`);
    
    return ofertasACrear;
}

/**
 * Crear oferta
 */
async function crearOfertaEscalonada(cantidadUSD, preciosReferencia) {
    const preciosMoneda = preciosReferencia[MONEDA];
    
    if (!preciosMoneda) {
        console.log(`   ⚠️  No hay precios de referencia para ${MONEDA}`);
        return null;
    }
    
    const precioOptimo = TIPO_OFERTA === 'venta' 
        ? preciosMoneda.precios.venta 
        : preciosMoneda.precios.compra;
    
    const cantidadCUP = parseFloat((cantidadUSD * precioOptimo).toFixed(2));
    
    // Preparar datos según tipo de oferta
    let datosOferta;
    if (TIPO_OFERTA === 'venta') {
        // YO VENDO USD (doy USD, recibo CUP)
        datosOferta = {
            type: 'sell',  // CORRECTO: sell = yo vendo USD
            coin: MONEDA,
            amount: cantidadUSD,
            receive: cantidadCUP,
            details: config.ofertas[0].detallesPago,
            only_kyc: config.ofertas[0].soloKYC ? 1 : 0,
            private: config.ofertas[0].privada ? 1 : 0,
            only_vip: config.ofertas[0].soloVIP ? 1 : 0,
            message: config.ofertas[0].mensaje || undefined
        };
    } else {
        // YO COMPRO USD (doy CUP, recibo USD)
        datosOferta = {
            type: 'buy',  // CORRECTO: buy = yo compro USD
            coin: MONEDA,
            amount: cantidadUSD,
            receive: cantidadCUP,
            details: config.ofertas[0].detallesPago,
            only_kyc: config.ofertas[0].soloKYC ? 1 : 0,
            private: config.ofertas[0].privada ? 1 : 0,
            only_vip: config.ofertas[0].soloVIP ? 1 : 0,
            message: config.ofertas[0].mensaje || undefined
        };
    }
    
    console.log(`   📝 Creando oferta: $${cantidadUSD} USD → ${cantidadCUP} CUP (${precioOptimo.toFixed(2)} CUP/USD)`);
    
    const resultado = await crearOferta(config.token, datosOferta);
    
    if (resultado.exito) {
        console.log(`      ✅ Creada: ${resultado.oferta.uuid.substring(0, 8)}...`);
        estadisticas.ofertasCreadas++;
        estadisticas.capitalInvertido += cantidadUSD;
        
        // Notificar creación
        await notificarOfertaCreada(resultado.oferta, cantidadUSD, cantidadCUP, precioOptimo);
        
        return resultado.oferta;
    } else {
        console.log(`      ❌ Error: ${resultado.error}`);
        return null;
    }
}

/**
 * Verificar y renovar ofertas antiguas
 */
async function verificarRenovaciones(misOfertas, preciosReferencia) {
    const ofertasSinPeer = filtrarOfertasSinPeer(misOfertas);
    let renovadas = 0;
    
    for (const oferta of ofertasSinPeer) {
        const edad = calcularEdadOferta(oferta.created_at);
        
        if (necesitaRenovacion(oferta, TIEMPO_MAX_SIN_PEER)) {
            const uuid = oferta.uuid;
            console.log(`\n   🔄 Renovando oferta ${uuid.substring(0, 8)}... (${edad} min sin peer)`);
            
            const resultadoCancel = await cancelarOferta(config.token, uuid);
            
            if (resultadoCancel.exito) {
                console.log(`      ✅ Cancelada`);
                
                // Recrear con precios actualizados
                const cantidad = parseFloat(oferta.amount);
                const ofertaNueva = await crearOfertaEscalonada(cantidad, preciosReferencia);
                
                if (ofertaNueva) {
                    // Notificar renovación
                    await notificarOfertaRenovada(uuid, ofertaNueva, edad);
                }
                estadisticas.ofertasRenovadas++;
                renovadas++;
                
                // Pausa de 3 segundos para evitar rate limiting
                await new Promise(resolve => setTimeout(resolve, 3000));
            } else {
                console.log(`      ❌ Error al cancelar: ${resultadoCancel.error}`);
            }
        }
    }
    
    return renovadas;
}

/**
 * Notificar peer detectado
 */
async function notificarPeerDetectado(oferta) {
    const uuid = oferta.uuid;
    
    if (peersNotificados.has(uuid)) {
        return;
    }
    
    peersNotificados.set(uuid, Date.now());
    
    const amount = parseFloat(oferta.amount);
    const receive = parseFloat(oferta.receive);
    const tasa = receive / amount;
    
    console.log(`\n   🎉 ¡PEER DETECTADO en oferta $${amount} USD!`);
    console.log(`      UUID: ${uuid.substring(0, 8)}...`);
    console.log(`      💰 ${amount} USD → ${receive} CUP`);
    
    try {
        const oportunidad = {
            tipo: oferta.type === 'buy' ? 'venta' : 'compra',
            moneda: oferta.coin,
            amount: amount,
            receive: receive,
            tasa: tasa.toFixed(2),
            peer_id: oferta.peer_id,
            uuid: uuid,
            link: `https://qvapay.com/p2p/${uuid}`,
            mensaje: `🎉 *¡OFERTA ACEPTADA!*\n\n` +
                    `Tu oferta de *$${amount} USD* fue aceptada:\n\n` +
                    `💰 *Monto:* ${amount} USD → ${receive} CUP\n` +
                    `📊 *Tasa:* ${tasa.toFixed(2)} CUP/USD\n` +
                    `💱 *Moneda:* ${oferta.coin}\n\n` +
                    `👤 *Peer ID:* ${oferta.peer_id}\n\n` +
                    `🔗 *Ver oferta:* https://qvapay.com/p2p/${uuid}`
        };
        
        await notificarOportunidad(oportunidad);
        console.log(`      📲 Notificación enviada`);
        estadisticas.peersDetectados++;
    } catch (error) {
        console.error(`      ❌ Error al notificar:`, error.message);
    }
}

/**
 * Ciclo principal
 */
async function cicloGestor() {
    try {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log(`🔍 CICLO GESTOR - ${new Date().toLocaleString('es-ES')}`);
        console.log('═══════════════════════════════════════════════════════');
        
        // 1. Obtener balance
        console.log('\n💰 Obteniendo balance...');
        const resultadoBalance = await obtenerBalance(config.token);
        
        if (!resultadoBalance.exito) {
            console.log('   ❌ Error al obtener balance');
            return;
        }
        
        const balanceTotal = resultadoBalance.balance;
        console.log(`   ✅ Balance total: $${balanceTotal.toFixed(2)} USD`);
        
        // 2. Calcular precios de referencia
        console.log('\n📊 Calculando precios de referencia...');
        const preciosReferencia = await calcularPreciosReferencia();
        
        if (!preciosReferencia || Object.keys(preciosReferencia).length === 0) {
            console.log('   ⚠️  No se pudieron calcular precios de referencia');
            return;
        }
        
        console.log('   ✅ Precios actualizados');
        console.log(`   ${MONEDA}: Venta ${preciosReferencia[MONEDA].precios.venta.toFixed(2)} CUP/USD`);
        
        // 3. Obtener mis ofertas activas
        console.log('\n📋 Obteniendo mis ofertas...');
        const misOfertas = await obtenerMisOfertas(config.token);
        
        const ofertasConPeer = filtrarOfertasConPeer(misOfertas);
        const ofertasSinPeer = filtrarOfertasSinPeer(misOfertas);
        
        // Detectar peers
        for (const oferta of ofertasConPeer) {
            await notificarPeerDetectado(oferta);
        }
        
        // Calcular capital bloqueado en ofertas sin peer
        const capitalBloqueado = ofertasSinPeer.reduce((sum, o) => sum + parseFloat(o.amount), 0);
        const balanceDisponible = balanceTotal - capitalBloqueado;
        
        console.log(`   📊 Ofertas con peer: ${ofertasConPeer.length}`);
        console.log(`   📊 Ofertas sin peer: ${ofertasSinPeer.length}`);
        console.log(`   💼 Capital bloqueado: $${capitalBloqueado.toFixed(2)}`);
        console.log(`   💵 Balance disponible: $${balanceDisponible.toFixed(2)}`);
        
        // 4. Verificar renovaciones
        console.log('\n🔄 Verificando renovaciones...');
        const renovadas = await verificarRenovaciones(misOfertas, preciosReferencia);
        if (renovadas > 0) {
            console.log(`   ✅ ${renovadas} ofertas renovadas`);
        } else {
            console.log(`   ✅ Ninguna oferta necesita renovación`);
        }
        
        // 5. Crear nuevas ofertas según balance disponible
        console.log('\n📝 Calculando ofertas necesarias...');
        const cantidadesACrear = calcularOfertasNecesarias(balanceDisponible, ofertasSinPeer);
        
        if (cantidadesACrear.length > 0) {
            console.log('   🚀 Creando ofertas...');
            for (const cantidad of cantidadesACrear) {
                await crearOfertaEscalonada(cantidad, preciosReferencia);
                // Pausa de 3 segundos para evitar rate limiting
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        } else {
            console.log('   ✅ No se necesitan más ofertas (capital completamente utilizado)');
        }
        
        // 6. Mostrar estadísticas
        mostrarEstadisticas();
        
    } catch (error) {
        console.error('\n❌ Error en ciclo del gestor:', error.message);
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`⏰ Próximo ciclo en ${INTERVALO_ESCANEO} segundos...`);
    console.log('═══════════════════════════════════════════════════════\n');
}

/**
 * Mostrar estadísticas
 */
function mostrarEstadisticas() {
    const tiempoActivo = Math.floor((Date.now() - estadisticas.inicioSesion) / (1000 * 60));
    
    console.log('\n📊 ESTADÍSTICAS DEL GESTOR:');
    console.log(`   ⏰ Tiempo activo: ${tiempoActivo} minutos`);
    console.log(`   ✅ Ofertas creadas: ${estadisticas.ofertasCreadas}`);
    console.log(`   🔄 Ofertas renovadas: ${estadisticas.ofertasRenovadas}`);
    console.log(`   🎉 Peers detectados: ${estadisticas.peersDetectados}`);
    console.log(`   💰 Capital invertido: $${estadisticas.capitalInvertido.toFixed(2)}`);
}

/**
 * Iniciar gestor
 */
async function iniciar() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   🎯 GESTOR ESCALONADO DE OFERTAS P2P               ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
    
    console.log('⚙️  CONFIGURACIÓN:');
    console.log(`   • Tipo: ${TIPO_OFERTA.toUpperCase()}`);
    console.log(`   • Moneda: ${MONEDA}`);
    console.log(`   • Escala: ${ESCALA_OFERTAS.join(', ')} USD`);
    console.log(`   • Intervalo: ${INTERVALO_ESCANEO} segundos`);
    console.log(`   • Renovación: ${TIEMPO_MAX_SIN_PEER} minutos sin peer`);
    
    console.log('\n💡 ESTRATEGIA:');
    console.log('   1. Crea ofertas siguiendo la escala predefinida');
    console.log('   2. Usa todo el balance disponible');
    console.log('   3. Fracciona el capital restante si no alcanza');
    console.log('   4. Renueva ofertas sin peer automáticamente');
    
    console.log('\n🛑 Para detener: Presiona Ctrl+C\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Ejecutar primer ciclo
    await cicloGestor();
    
    // Programar ciclos siguientes
    setInterval(cicloGestor, INTERVALO_ESCANEO * 1000);
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
