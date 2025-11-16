/**
 * 🔍 MONITOR DE OPORTUNIDADES - QvaPay P2P
 * 
 * Escanea el mercado cada 30 segundos buscando oportunidades de arbitraje.
 * Muestra alertas cuando encuentra ofertas con precios favorables.
 */

const fetch = require('node-fetch');
const { calcularPreciosPorMoneda } = require('./utils/calcular-precios');
const { aplicarFiltrosEstandar } = require('./utils/filtros');
const { obtenerConfiguracionEstrategia } = require('./config-estrategia');
const { 
    notificarOportunidad, 
    notificarResumen, 
    verificarConfiguracion,
    mostrarInstrucciones 
} = require('./utils/notificaciones');
const credenciales = require('./credenciales');

const TOKEN = credenciales.token;
const INTERVALO_SEGUNDOS = 30;

// ⚙️ CONFIGURACIÓN DE FILTROS
const GANANCIA_MINIMA_CUP = 10; // Ganancia mínima por USD para notificar

// Contador de escaneos
let contadorEscaneos = 0;
let preciosReferencia = {};

// Caché de ofertas notificadas para evitar duplicados
// Estructura: { uuid: timestamp }
let ofertasNotificadas = new Map();

// Tiempo para limpiar ofertas del caché (30 minutos)
const TIEMPO_CACHE_MS = 30 * 60 * 1000;

/**
 * Obtener ofertas del mercado
 */
async function obtenerOfertas() {
    try {
        const [response1, response2] = await Promise.all([
            fetch('https://api.qvapay.com/p2p/index?page=1', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${TOKEN}`
                }
            }),
            fetch('https://api.qvapay.com/p2p/index?page=2', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${TOKEN}`
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
        return null;
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
 * Buscar oportunidades en el mercado
 */
async function buscarOportunidades() {
    if (!preciosReferencia || Object.keys(preciosReferencia).length === 0) {
        console.log('⚠️  Sin precios de referencia. Calculando...\n');
        return [];
    }
    
    const ofertasOriginales = await obtenerOfertas();
    
    if (ofertasOriginales.length === 0) {
        return [];
    }
    
    // Filtrar solo ofertas abiertas, públicas, con KYC y CUP
    const ofertas = ofertasOriginales.filter(o => {
        const moneda = o.coin ? o.coin.toUpperCase() : '';
        const monedasCUP = ['BANK_CUP', 'BOLSATM'];
        
        return o.status === 'open' &&
               !o.only_vip &&
               o.User && o.User.kyc === true &&
               !o.private &&
               monedasCUP.includes(moneda);
    });
    
    const oportunidades = [];
    
    ofertas.forEach(oferta => {
        const moneda = oferta.coin.toUpperCase();
        
        if (!preciosReferencia[moneda] || !preciosReferencia[moneda].precios) {
            return;
        }
        
        const precioRef = preciosReferencia[moneda].precios;
        const amount = parseFloat(oferta.amount);
        const receive = parseFloat(oferta.receive);
        const tasaOferta = receive / amount;
        
        // OPORTUNIDAD DE COMPRA: 
        // Yo compro USD (oferta type='sell'), alguien vende USD
        // Busco tasas <= mi precio de compra (pago menos o igual)
        if (oferta.type === 'sell' && tasaOferta <= precioRef.compra) {
            const diferencia = precioRef.compra - tasaOferta;
            const ventaja = (diferencia / precioRef.compra) * 100;
            
            // Filtro: Ganancia mínima de 10 CUP por USD
            const gananciaTotalCUP = diferencia * amount;
            if (gananciaTotalCUP >= GANANCIA_MINIMA_CUP) {
                oportunidades.push({
                    tipo: 'COMPRA',
                    moneda,
                    oferta,
                    tasaOferta: tasaOferta.toFixed(2),
                    precioReferencia: precioRef.compra.toFixed(2),
                    diferencia: diferencia.toFixed(2),
                    ventajaPorcentaje: ventaja.toFixed(2),
                    amount,
                    receive,
                    gananciaTotalCUP: gananciaTotalCUP.toFixed(2)
                });
            }
        }
        
        // OPORTUNIDAD DE VENTA:
        // Yo vendo USD (oferta type='buy'), alguien compra USD
        // Busco tasas >= mi precio de venta (cobro más o igual)
        if (oferta.type === 'buy' && tasaOferta >= precioRef.venta) {
            const diferencia = tasaOferta - precioRef.venta;
            const ventaja = (diferencia / precioRef.venta) * 100;
            
            // Filtro: Ganancia mínima de 10 CUP por USD
            const gananciaTotalCUP = diferencia * amount;
            if (gananciaTotalCUP >= GANANCIA_MINIMA_CUP) {
                oportunidades.push({
                    tipo: 'VENTA',
                    moneda,
                    oferta,
                    tasaOferta: tasaOferta.toFixed(2),
                    precioReferencia: precioRef.venta.toFixed(2),
                    diferencia: diferencia.toFixed(2),
                    ventajaPorcentaje: ventaja.toFixed(2),
                    amount,
                    receive,
                    gananciaTotalCUP: gananciaTotalCUP.toFixed(2)
                });
            }
        }
    });
    
    // Ordenar por ventaja (mayor a menor)
    oportunidades.sort((a, b) => parseFloat(b.ventajaPorcentaje) - parseFloat(a.ventajaPorcentaje));
    
    return oportunidades;
}

/**
 * Formatear y mostrar oportunidad
 */
function mostrarOportunidad(oportunidad, index) {
    const icono = oportunidad.tipo === 'COMPRA' ? '🟢' : '🔴';
    const { oferta } = oportunidad;
    
    console.log(`${icono} OPORTUNIDAD ${index + 1}: ${oportunidad.tipo} ${oportunidad.moneda}`);
    console.log('─────────────────────────────────────────────────────');
    
    if (oportunidad.tipo === 'COMPRA') {
        console.log(`💰 PUEDES COMPRAR USD más barato de lo calculado`);
        console.log(`   Tasa oferta: ${oportunidad.tasaOferta} CUP/USD`);
        console.log(`   Tu precio máximo: ${oportunidad.precioReferencia} CUP/USD`);
        console.log(`   💵 Ahorras: ${oportunidad.diferencia} CUP por USD (${oportunidad.ventajaPorcentaje}%)`);
        console.log(`   � Ganancia total: ${oportunidad.gananciaTotalCUP} CUP`);
        console.log(`   �📦 Cantidad: ${oportunidad.amount} USD → ${oportunidad.receive} CUP`);
    } else {
        console.log(`💸 PUEDES VENDER USD más caro de lo calculado`);
        console.log(`   Tasa oferta: ${oportunidad.tasaOferta} CUP/USD`);
        console.log(`   Tu precio mínimo: ${oportunidad.precioReferencia} CUP/USD`);
        console.log(`   💵 Ganas extra: ${oportunidad.diferencia} CUP por USD (${oportunidad.ventajaPorcentaje}%)`);
        console.log(`   💰 Ganancia total: ${oportunidad.gananciaTotalCUP} CUP`);
        console.log(`   📦 Cantidad: ${oportunidad.amount} USD → ${oportunidad.receive} CUP`);
    }
    
    console.log(`\n   👤 Usuario: ${oferta.User?.username || 'N/A'}`);
    console.log(`   ⭐ Rating: ${oferta.User?.rating_avg || 'N/A'} (${oferta.User?.total_reviews || 0} reviews)`);
    console.log(`   ✅ KYC: ${oferta.User?.kyc ? 'Verificado' : 'No verificado'}`);
    console.log(`   📅 Creada: ${new Date(oferta.created_at).toLocaleString('es-ES')}`);
    
    // Enlace directo a la oferta
    const enlace = `https://qvapay.com/p2p/${oferta.uuid}`;
    console.log(`\n   🔗 VER OFERTA: ${enlace}`);
    console.log('─────────────────────────────────────────────────────\n');
}

/**
 * Mostrar resumen de precios de referencia
 */
function mostrarPreciosReferencia() {
    console.log('📊 PRECIOS DE REFERENCIA:');
    
    Object.entries(preciosReferencia).forEach(([moneda, datos]) => {
        if (datos.precios) {
            console.log(`   ${moneda}:`);
            console.log(`     🟢 Comprar hasta: ${datos.precios.compra.toFixed(2)} CUP/USD`);
            console.log(`     🔴 Vender desde: ${datos.precios.venta.toFixed(2)} CUP/USD`);
            console.log(`     📊 ${datos.estadisticas.cantidad} ofertas analizadas`);
        }
    });
    
    console.log('');
}

/**
 * Ejecutar escaneo
 */
async function ejecutarEscaneo() {
    contadorEscaneos++;
    const ahora = new Date().toLocaleString('es-ES');
    
    console.log('═══════════════════════════════════════════════════════');
    console.log(`🔍 ESCANEO #${contadorEscaneos} - ${ahora}`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    try {
        // Recalcular precios de referencia cada escaneo
        console.log('📊 Recalculando precios de referencia...');
        preciosReferencia = await calcularPreciosReferencia();
        
        if (!preciosReferencia || Object.keys(preciosReferencia).length === 0) {
            console.log('❌ No se pudieron calcular precios de referencia\n');
            return;
        }
        
        console.log('✅ Precios actualizados\n');
        mostrarPreciosReferencia();
        
        // Buscar oportunidades
        console.log('🔎 Escaneando mercado en busca de oportunidades...\n');
        const oportunidades = await buscarOportunidades();
        
        if (oportunidades.length === 0) {
            console.log('📭 No se encontraron oportunidades en este momento.');
            console.log('   Las ofertas actuales no cumplen con los criterios de precio.\n');
        } else {
            console.log(`� ¡${oportunidades.length} OPORTUNIDAD(ES) ENCONTRADA(S)!\n`);
            console.log('═══════════════════════════════════════════════════════\n');
            
            // Mostrar todas las oportunidades
            oportunidades.forEach((oportunidad, index) => {
                mostrarOportunidad(oportunidad, index);
            });
            
            // Enviar notificaciones (solo de ofertas nuevas)
            console.log('═══════════════════════════════════════════════════════');
            
            let notificacionesEnviadas = 0;
            let notificacionesOmitidas = 0;
            
            // Convertir oportunidades al formato esperado por notificaciones
            for (const oportunidad of oportunidades) {
                const uuid = oportunidad.oferta.uuid;
                const ahora = Date.now();
                
                // Verificar si ya fue notificada recientemente
                if (ofertasNotificadas.has(uuid)) {
                    const tiempoTranscurrido = ahora - ofertasNotificadas.get(uuid);
                    const minutosTranscurridos = Math.floor(tiempoTranscurrido / 60000);
                    
                    console.log(`   ⏭️  Omitiendo oferta ${uuid.substring(0, 8)}... (ya notificada hace ${minutosTranscurridos} min)`);
                    notificacionesOmitidas++;
                    continue;
                }
                
                // Formatear y enviar notificación
                const oportunidadFormateada = {
                    tipo: oportunidad.tipo.toLowerCase(),
                    moneda: oportunidad.moneda,
                    tasa: parseFloat(oportunidad.tasaOferta),
                    precioObjetivo: parseFloat(oportunidad.precioReferencia),
                    diferencia: parseFloat(oportunidad.diferencia),
                    gananciaTotalCUP: parseFloat(oportunidad.gananciaTotalCUP),
                    oferta: {
                        uuid: uuid,
                        amount: oportunidad.amount.toString(),
                        receive: oportunidad.receive.toString(),
                        User: oportunidad.oferta.User,
                        private: oportunidad.oferta.private
                    },
                    enlace: `https://qvapay.com/p2p/${uuid}`
                };
                
                const enviado = await notificarOportunidad(oportunidadFormateada);
                
                if (enviado) {
                    // Guardar en caché
                    ofertasNotificadas.set(uuid, ahora);
                    notificacionesEnviadas++;
                    console.log(`   ✅ Nueva oferta notificada: ${uuid.substring(0, 8)}...`);
                }
            }
            
            // Mostrar resumen
            console.log(`\n   📊 Resumen: ${notificacionesEnviadas} nuevas, ${notificacionesOmitidas} omitidas (duplicadas)`);
            
            // Limpiar caché de ofertas antiguas (más de 30 minutos)
            limpiarCacheAntiguo();
            
            console.log('═══════════════════════════════════════════════════════\n');
        }
        
    } catch (error) {
        console.error('❌ Error en escaneo:', error.message);
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log(`⏰ Próximo escaneo en ${INTERVALO_SEGUNDOS} segundos...`);
    console.log('═══════════════════════════════════════════════════════\n');
}

/**
 * Limpiar caché de ofertas antiguas
 */
function limpiarCacheAntiguo() {
    const ahora = Date.now();
    let eliminadas = 0;
    
    for (const [uuid, timestamp] of ofertasNotificadas.entries()) {
        if (ahora - timestamp > TIEMPO_CACHE_MS) {
            ofertasNotificadas.delete(uuid);
            eliminadas++;
        }
    }
    
    if (eliminadas > 0) {
        console.log(`   🗑️  Limpieza de caché: ${eliminadas} ofertas antiguas eliminadas`);
    }
    
    // Mostrar tamaño actual del caché
    if (ofertasNotificadas.size > 0) {
        console.log(`   💾 Ofertas en caché: ${ofertasNotificadas.size}`);
    }
}

/**
 * Iniciar monitor
 */
async function iniciarMonitor() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║     🔍 MONITOR DE OPORTUNIDADES - QvaPay P2P        ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
    
    // Verificar configuración de notificaciones
    const configNotificaciones = verificarConfiguracion();
    
    console.log('⚙️  CONFIGURACIÓN:');
    console.log(`   • Intervalo: ${INTERVALO_SEGUNDOS} segundos`);
    console.log('   • Monedas: BANK_CUP, BOLSATM');
    console.log('   • Filtros: Solo KYC, públicas, no-VIP');
    console.log(`   • Caché: ${TIEMPO_CACHE_MS / 60000} minutos (evita duplicados)\n`);
    
    console.log('📲 NOTIFICACIONES:');
    if (configNotificaciones.habilitado) {
        console.log(`   ✅ Habilitadas: ${configNotificaciones.metodos.join(', ')}`);
        if (configNotificaciones.config.twilio) console.log('   🔹 Twilio WhatsApp: Activo');
        if (configNotificaciones.config.callmebot) console.log('   🔹 CallMeBot WhatsApp: Activo');
        if (configNotificaciones.config.telegram) console.log('   🔹 Telegram: Activo');
    } else {
        console.log('   ⚠️  Deshabilitadas (solo mostrar en consola)');
        console.log('   💡 Para habilitar, configura variables de entorno');
        console.log('   📖 Ejecuta: node -e "require(\'./utils/notificaciones\').mostrarInstrucciones()"');
    }
    console.log('');
    
    console.log('🎯 ESTRATEGIA:');
    console.log('   🟢 Oportunidades de COMPRA: Tasa <= Precio calculado de compra');
    console.log('   🔴 Oportunidades de VENTA: Tasa >= Precio calculado de venta\n');
    
    console.log('💡 TIP: Deja este monitor corriendo y recibirás alertas');
    console.log('   cuando aparezcan oportunidades en el mercado.\n');
    
    console.log('🛑 Para detener: Presiona Ctrl+C\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Primer escaneo inmediato
    await ejecutarEscaneo();
    
    // Escaneos subsecuentes cada 30 segundos
    setInterval(ejecutarEscaneo, INTERVALO_SEGUNDOS * 1000);
}

// Manejar señales de terminación
process.on('SIGINT', () => {
    console.log('\n\n═══════════════════════════════════════════════════════');
    console.log('🛑 Monitor detenido por el usuario');
    console.log(`📊 Total de escaneos realizados: ${contadorEscaneos}`);
    console.log(`📲 Ofertas únicas notificadas: ${ofertasNotificadas.size}`);
    console.log('═══════════════════════════════════════════════════════\n');
    process.exit(0);
});

// Iniciar
iniciarMonitor().catch(error => {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
});
