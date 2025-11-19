/**
 * 🎯 GESTOR ESCALONADO DE COMPRAS - QvaPay P2P
 * 
 * Crea ofertas de COMPRA en escalas progresivas: 1, 2, 3, 5, 10, 15, 20, 25, 30...
 * Usa tu balance en CUP disponible para calcular cuántas ofertas crear.
 * 
 * Estrategia:
 * 1. Obtener balance disponible en CUP
 * 2. Calcular precio óptimo de compra (yo compro USD)
 * 3. Crear ofertas siguiendo la escala predefinida
 * 4. Si no alcanza para la siguiente escala, fracciona el restante
 * 5. Detecta peers y renueva ofertas automáticamente
 */

const fetch = require('node-fetch');
const config = require('./config-gestor-ofertas');
const configCompra = require('./config-gestor-compra');
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
const { enviarPorTelegram } = require('./utils/notificaciones');

// 📊 ESCALA DE OFERTAS (en USD)
const ESCALA_OFERTAS = [1, 2, 3, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100];

// ⚙️ CONFIGURACIÓN
const TIPO_OFERTA = 'compra'; // FIJO: compra de USD
const MONEDA = 'BANK_CUP';
const INTERVALO_ESCANEO = 60; // segundos
const TIEMPO_MAX_SIN_PEER = 10; // minutos
const DELAY_ENTRE_OFERTAS = 10000; // milisegundos (3 segundos) entre crear ofertas

// 💰 CONFIGURACIÓN DE CAPITAL
// Puedes configurar esto de dos formas:
// 1. BALANCE_CUP_DISPONIBLE: null -> Usa todo el balance en CUP
// 2. BALANCE_CUP_DISPONIBLE: 10000 -> Usa solo 10000 CUP
//
// ⚠️ IMPORTANTE: Si configuras un valor manual, el gestor NO verificará
// si tienes suficiente CUP. Asegúrate de tener al menos ese monto disponible.
//
// 📁 CONFIGURACIÓN: Edita el archivo config-gestor-compra.js
const BALANCE_CUP_DISPONIBLE = configCompra.balanceCupManual || process.env.BALANCE_CUP_MANUAL || null;

// Estadísticas
let estadisticas = {
    ofertasCreadas: 0,
    ofertasRenovadas: 0,
    peersDetectados: 0,
    capitalInvertido: 0,
    inicioSesion: new Date()
};

// Caché de peers detectados para evitar notificaciones duplicadas
const peersNotificados = new Map();
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
 * Obtener balance disponible en CUP
 * Si tienes múltiples cuentas, suma los CUP disponibles
 */
async function obtenerBalanceCUP() {
    try {
        const response = await fetch('https://qvapay.com/api/v1/balance', {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${config.token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        // Buscar balance en CUP
        // La API retorna un array de balances por moneda
        let totalCUP = 0;
        
        if (Array.isArray(data)) {
            for (const item of data) {
                // Buscar CUP, BANK_CUP, etc.
                if (item.coin && (item.coin.toUpperCase().includes('CUP'))) {
                    totalCUP += parseFloat(item.balance || 0);
                }
            }
        }
        
        return totalCUP;
        
    } catch (error) {
        console.error('❌ Error al obtener balance CUP:', error.message);
        return 0;
    }
}

/**
 * Calcular cantidades de ofertas necesarias según balance en CUP
 */
function calcularOfertasNecesarias(balanceCUP, precioCompra, ofertasExistentes, maxOfertasPermitidas) {
    const ofertasACrear = [];
    
    // Calcular cuánto USD puedo comprar con mi CUP disponible
    const usdDisponible = balanceCUP / precioCompra;
    let capitalRestante = usdDisponible;
    
    // Obtener cantidades ya existentes
    const cantidadesExistentes = ofertasExistentes
        .filter(o => o.status === 'open' && !o.peer_id)
        .map(o => parseFloat(o.amount));
    
    console.log(`\n   💰 Balance CUP: ${balanceCUP.toFixed(2)} CUP`);
    console.log(`   💵 Equivalente USD: $${usdDisponible.toFixed(2)}`);
    console.log(`   📊 Precio compra: ${precioCompra.toFixed(2)} CUP/USD`);
    console.log(`   📊 Ofertas activas: ${cantidadesExistentes.length}`);
    console.log(`   🎯 Límite máximo: ${maxOfertasPermitidas} ofertas`);
    if (cantidadesExistentes.length > 0) {
        console.log(`   📋 Cantidades: ${cantidadesExistentes.map(c => `$${c}`).join(', ')}`);
    }
    
    // Si ya tenemos el máximo de ofertas permitidas, no crear más
    if (cantidadesExistentes.length >= maxOfertasPermitidas) {
        console.log(`   ⚠️  Ya tienes ${cantidadesExistentes.length} ofertas activas (máximo ${maxOfertasPermitidas})`);
        return ofertasACrear;
    }
    
    // Calcular cuántas ofertas podemos crear
    const ofertasDisponibles = maxOfertasPermitidas - cantidadesExistentes.length;
    console.log(`   📊 Espacios disponibles: ${ofertasDisponibles} ofertas`);
    
    // Dividir el capital disponible entre las ofertas que podemos crear
    if (ofertasDisponibles > 0 && capitalRestante > 0) {
        const capitalPorOferta = capitalRestante / ofertasDisponibles;
        console.log(`   💵 Capital por oferta: $${capitalPorOferta.toFixed(2)}`);
        
        // Recorrer la escala
        for (const cantidad of ESCALA_OFERTAS) {
            // Si ya existe una oferta con esta cantidad, saltar
            if (cantidadesExistentes.includes(cantidad)) {
                continue;
            }
            
            // Si tenemos capital suficiente, agregarla
            if (capitalRestante >= cantidad && ofertasACrear.length < ofertasDisponibles) {
                ofertasACrear.push(cantidad);
                capitalRestante -= cantidad;
            }
        }
        
        // Si sobra capital y aún tenemos espacios, fraccionarlo
        if (capitalRestante >= 1 && ofertasACrear.length < ofertasDisponibles) {
            const fraccionada = Math.floor(capitalRestante);
            if (fraccionada >= 1 && !cantidadesExistentes.includes(fraccionada)) {
                ofertasACrear.push(fraccionada);
                capitalRestante -= fraccionada;
            }
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
 * Crear oferta de compra
 */
async function crearOfertaCompra(cantidadUSD, precioCompra) {
    const cantidadCUP = parseFloat((cantidadUSD * precioCompra).toFixed(2));
    
    // YO COMPRO USD (doy CUP, recibo USD)
    const datosOferta = {
        type: 'buy',  // buy = yo compro USD
        coin: MONEDA,
        amount: cantidadUSD,      // USD que quiero comprar
        receive: cantidadCUP,     // CUP que voy a pagar
        details: config.ofertas[0].detallesPago,
        only_kyc: config.ofertas[0].soloKYC ? 1 : 0,
        private: config.ofertas[0].privada ? 1 : 0,
        only_vip: config.ofertas[0].soloVIP ? 1 : 0,
        message: config.ofertas[0].mensaje || undefined
    };
    
    console.log(`   📝 Creando oferta COMPRA: $${cantidadUSD} USD por ${cantidadCUP} CUP (${precioCompra.toFixed(2)} CUP/USD)`);
    
    const resultado = await crearOferta(config.token, datosOferta);
    
    if (resultado.exito) {
        console.log(`      ✅ Creada: ${resultado.oferta.uuid.substring(0, 8)}...`);
        estadisticas.ofertasCreadas++;
        estadisticas.capitalInvertido += cantidadCUP;
        
        // Notificar creación
        await notificarOfertaCreada(resultado.oferta, cantidadUSD, cantidadCUP, precioCompra);
        
        return resultado.oferta;
    } else {
        console.log(`      ❌ Error: ${resultado.error}`);
        return null;
    }
}

/**
 * Notificar cuando se crea una oferta
 */
async function notificarOfertaCreada(oferta, cantidadUSD, cantidadCUP, tasa) {
    const emoji = '🟢';
    
    let mensaje = `${emoji} <b>OFERTA CREADA - COMPRA</b>\n\n`;
    mensaje += `🆔 ID: ${oferta.uuid.substring(0, 8)}...\n`;
    mensaje += `💰 Compro: ${cantidadUSD} USD por ${cantidadCUP} CUP\n`;
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
    const emoji = '🟢';
    const peerUsername = oferta.peer.username || 'Desconocido';
    const amount = parseFloat(oferta.amount);
    const receive = parseFloat(oferta.receive);
    const tasa = (receive / amount).toFixed(2);
    
    let mensaje = `${emoji} <b>PEER DETECTADO - COMPRA</b>\n\n`;
    mensaje += `🆔 Oferta: ${ofertaId.substring(0, 8)}...\n`;
    mensaje += `💰 Compro: ${amount} USD por ${receive} CUP\n`;
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
 * Notificar cuando se renueva una oferta
 */
async function notificarOfertaRenovada(ofertaVieja, ofertaNueva, edad) {
    const emoji = '🔄';
    
    const amount = parseFloat(ofertaNueva.amount);
    const receive = parseFloat(ofertaNueva.receive);
    const tasa = (receive / amount).toFixed(2);
    
    let mensaje = `${emoji} <b>OFERTA RENOVADA - COMPRA</b>\n\n`;
    mensaje += `🆔 ID anterior: ${ofertaVieja.substring(0, 8)}...\n`;
    mensaje += `🆔 ID nueva: ${ofertaNueva.uuid.substring(0, 8)}...\n`;
    mensaje += `💰 Compro: ${amount} USD por ${receive} CUP\n`;
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
 * Verificar y renovar ofertas antiguas
 */
async function verificarRenovaciones(misOfertas, precioCompra) {
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
                const ofertaNueva = await crearOfertaCompra(cantidad, precioCompra);
                
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
 * Ciclo principal
 */
async function cicloGestor() {
    try {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log(`🔍 CICLO GESTOR COMPRA - ${new Date().toLocaleString('es-ES')}`);
        console.log('═══════════════════════════════════════════════════════');
        
        // 1. Calcular precios de referencia
        console.log('\n📊 Calculando precios de referencia...');
        const preciosReferencia = await calcularPreciosReferencia();
        
        if (!preciosReferencia || !preciosReferencia[MONEDA]) {
            console.log('   ⚠️  No se pudieron calcular precios de referencia');
            return;
        }
        
        const precioCompra = preciosReferencia[MONEDA].precios.compra;
        
        console.log('   ✅ Precios actualizados');
        console.log(`   ${MONEDA}: Compra ${precioCompra.toFixed(2)} CUP/USD`);
        
        // 2. Obtener balance en CUP
        console.log('\n💰 Obteniendo balance CUP...');
        let balanceCUP = await obtenerBalanceCUP();
        
        // Si se configuró un límite manual, usarlo
        if (BALANCE_CUP_DISPONIBLE !== null) {
            console.log(`   ⚙️  Balance MANUAL configurado: ${BALANCE_CUP_DISPONIBLE} CUP`);
            console.log(`   💡 El gestor usará exactamente este monto (sin verificar disponibilidad real)`);
            balanceCUP = BALANCE_CUP_DISPONIBLE;
        } else {
            console.log(`   🔍 Balance AUTOMÁTICO de la API: ${balanceCUP.toFixed(2)} CUP`);
        }
        
        console.log(`   ✅ Balance CUP disponible: ${balanceCUP.toFixed(2)} CUP`);
        
        if (balanceCUP < precioCompra) {
            console.log('   ⚠️  No hay suficiente CUP para crear ofertas (mínimo 1 USD)');
            return;
        }
        
        // 3. Obtener mis ofertas activas
        console.log('\n📋 Obteniendo mis ofertas...');
        const misOfertas = await obtenerMisOfertas(config.token);
        
        // 📊 ANALIZAR LIMITACIÓN DE 15 OFERTAS ACTIVAS
        const totalOfertasActivas = misOfertas.filter(o => o.status === 'open').length;
        const modoConfigurado = config.gestores.modoDistribucion;
        const configModo = config.gestores.modos[modoConfigurado];
        
        console.log(`   📊 Total ofertas activas: ${totalOfertasActivas}/15`);
        console.log(`   🎯 Modo configurado: ${modoConfigurado} (${configModo.descripcion})`);
        console.log(`   📈 Límite compras: ${configModo.maxCompras} ofertas`);
        
        // Filtrar solo ofertas de COMPRA de BANK_CUP
        const misOfertasCompra = misOfertas.filter(o => 
            o.type === 'buy' && o.coin === MONEDA
        );
        
        const ofertasConPeer = filtrarOfertasConPeer(misOfertasCompra);
        const ofertasSinPeer = filtrarOfertasSinPeer(misOfertasCompra);
        
        // Detectar peers
        for (const oferta of ofertasConPeer) {
            await notificarPeerDetectado(oferta);
        }
        
        // Calcular CUP bloqueado en ofertas sin peer
        const cupBloqueado = ofertasSinPeer.reduce((sum, o) => sum + parseFloat(o.receive), 0);
        const cupDisponible = balanceCUP - cupBloqueado;
        
        console.log(`   📊 Ofertas compra con peer: ${ofertasConPeer.length}`);
        console.log(`   📊 Ofertas compra sin peer: ${ofertasSinPeer.length}`);
        console.log(`   💼 CUP bloqueado: ${cupBloqueado.toFixed(2)} CUP`);
        console.log(`   💵 CUP disponible: ${cupDisponible.toFixed(2)} CUP`);
        
        // Verificar si podemos crear más ofertas de compra
        const ofertasCompraActivas = misOfertasCompra.filter(o => o.status === 'open').length;
        if (ofertasCompraActivas >= configModo.maxCompras) {
            console.log(`\n⚠️  Ya tienes ${ofertasCompraActivas} ofertas de compra activas (máximo ${configModo.maxCompras})`);
            console.log('   No se crearán más ofertas de compra en este ciclo');
            mostrarEstadisticas();
            return;
        }
        
        // 4. Verificar renovaciones
        console.log('\n🔄 Verificando renovaciones...');
        const renovadas = await verificarRenovaciones(misOfertasCompra, precioCompra);
        if (renovadas > 0) {
            console.log(`   ✅ ${renovadas} ofertas renovadas`);
        } else {
            console.log(`   ✅ Ninguna oferta necesita renovación`);
        }
        
        // 5. Crear nuevas ofertas según balance disponible
        console.log('\n📝 Calculando ofertas necesarias...');
        const maxOfertasCompra = configModo.maxCompras;
        const cantidadesACrear = calcularOfertasNecesarias(cupDisponible, precioCompra, ofertasSinPeer, maxOfertasCompra);
        
        if (cantidadesACrear.length > 0) {
            console.log(`   🚀 Creando ${cantidadesACrear.length} ofertas con delay de ${DELAY_ENTRE_OFERTAS/1000}s entre cada una...`);
            for (let i = 0; i < cantidadesACrear.length; i++) {
                const cantidad = cantidadesACrear[i];
                console.log(`\n   📦 Oferta ${i + 1}/${cantidadesACrear.length}:`);
                await crearOfertaCompra(cantidad, precioCompra);
                
                // Pausa entre ofertas (excepto en la última)
                if (i < cantidadesACrear.length - 1) {
                    console.log(`      ⏳ Esperando ${DELAY_ENTRE_OFERTAS/1000}s antes de crear la siguiente...`);
                    await new Promise(resolve => setTimeout(resolve, DELAY_ENTRE_OFERTAS));
                }
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
    console.log(`   💰 CUP invertido: ${estadisticas.capitalInvertido.toFixed(2)} CUP`);
}

/**
 * Iniciar gestor
 */
async function iniciar() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   🟢 GESTOR ESCALONADO DE COMPRAS P2P               ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
    
    console.log('⚙️  CONFIGURACIÓN:');
    console.log(`   • Tipo: COMPRA (yo compro USD)`);
    console.log(`   • Moneda: ${MONEDA}`);
    console.log(`   • Escala: ${ESCALA_OFERTAS.join(', ')} USD`);
    console.log(`   • Intervalo: ${INTERVALO_ESCANEO} segundos`);
    console.log(`   • Renovación: ${TIEMPO_MAX_SIN_PEER} minutos sin peer`);
    console.log(`   • Delay entre ofertas: ${DELAY_ENTRE_OFERTAS/1000} segundos`);
    
    const modoConfigurado = config.gestores.modoDistribucion;
    const configModo = config.gestores.modos[modoConfigurado];
    console.log(`   • Modo distribución: ${modoConfigurado} (${configModo.descripcion})`);
    console.log(`   • Límite ofertas compra: ${configModo.maxCompras}/15 total`);
    
    if (BALANCE_CUP_DISPONIBLE !== null) {
        console.log(`   • 💰 Balance CUP: MANUAL (${BALANCE_CUP_DISPONIBLE} CUP)`);
        console.log(`     📝 Configurado en: config-gestor-compra.js`);
    } else {
        console.log(`   • 💰 Balance CUP: AUTOMÁTICO (desde API)`);
        console.log(`     🔍 Se obtiene automáticamente de tu cuenta`);
    }
    
    console.log('\n💡 ESTRATEGIA:');
    console.log('   1. Calcula precio óptimo de compra con tu estrategia');
    console.log('   2. Determina cuánto USD puedes comprar con tu CUP');
    console.log('   3. Respeta el límite de 15 ofertas activas totales');
    console.log('   4. Crea ofertas siguiendo la escala predefinida');
    console.log('   5. Detecta peers y notifica inmediatamente');
    console.log('   6. Renueva ofertas sin peer automáticamente');
    
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
