/**
 * 🎯 GESTOR MANUAL DE OFERTAS - QvaPay P2P
 *
 * Crea ofertas manuales según precio definido y escalas (ej: 1,2,5,10,15,20).
 * Uso: node gestor-ofertas-manual.js --price=495 --scale=1,2,5,10 --type=venta --coin=BANK_CUP
 */

const config = require('./config-gestor-ofertas');
const { crearOferta, obtenerMisOfertas } = require('./utils/api-ofertas');
const { obtenerBalance } = require('./utils/usuario');

// Simple CLI parsing (avoid new dependencies)
function parseArgs(argvRaw) {
    const out = {};
    argvRaw.forEach(arg => {
        if (!arg.startsWith('--')) return;
        const [k, v] = arg.replace(/^--/, '').split('=');
        out[k] = v === undefined ? true : v;
    });
    return out;
}
const argv = parseArgs(process.argv.slice(2));

function usageAndExit() {
    console.log('\nUso: node gestor-ofertas-manual.js --price=495 --scale=1,2,5,10 --type=venta --coin=BANK_CUP [--delay=3000] [--dry]');
    console.log('\n--price: Precio fijo en CUP (ej: 495)');
    console.log('--scale: Lista CSV de cantidades USD (ej: 1,2,5,10,15,20)');
    console.log('--type: venta|compra');
    console.log('--coin: BANK_CUP|BOLSATM');
    console.log('--delay: milisegundos entre creación de ofertas (default 3000)');
    console.log('--dry: modo solo simular (no crea ofertas)');
    process.exit(1);
}

// Validar y parsear argumentos
const price = parseFloat(argv.price || argv.p);
const scaleArg = argv.scale || argv.s;
const typeArg = (argv.type || argv.t || 'venta').toLowerCase();
const coin = argv.coin || argv.c || 'BANK_CUP';
const delayMs = parseInt(argv.delay || 10000, 10);
const dryRun = argv.dry || argv.sim || false;

if (!price || !scaleArg) {
    usageAndExit();
}

const scale = String(scaleArg).split(',').map(v => parseFloat(v.trim())).filter(Boolean);
if (scale.length === 0) {
    console.log('❌ Error: escala inválida');
    usageAndExit();
}

const TIPO_OFERTA = typeArg === 'venta' ? 'sell' : 'buy';
const MONEDA = coin;
const TOKEN = config.token;

async function run() {
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║   🎯 GESTOR MANUAL DE OFERTAS P2P (Manual Escalonado) ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    console.log(`⚙️  CONFIG: tipo=${typeArg.toUpperCase()}, coin=${MONEDA}, price=${price} CUP`);
    console.log(`   • Escala: ${scale.join(', ')} USD`);
    console.log(`   • Delay entre ofertas: ${delayMs} ms`);
    console.log(`   • Dry run: ${dryRun}\n`);

    // 1. Obtener balance
    console.log('💰 Obteniendo balance...');
    const balanceRes = await obtenerBalance(TOKEN);
    if (!balanceRes.exito) {
        console.log('   ❌ No se pudo obtener el balance. Continuando sin validación de balance.');
    }

    const balance = (balanceRes.exito && balanceRes.balance) ? balanceRes.balance : null;
    if (balance !== null) {
        console.log(`   ✅ Balance reportado: $${balance.toFixed(2)} USD`);
    }

    // 2. Obtener mis ofertas para evitar duplicados y respetar límite de 15
    console.log('\n📋 Obteniendo mis ofertas activas...');
    const misOfertas = await obtenerMisOfertas(TOKEN);
    const abiertas = misOfertas.filter(o => o.status === 'open');
    const espaciosDisponibles = 15 - abiertas.length;
    console.log(`   ✅ Ofertas activas: ${abiertas.length}/15. Espacios: ${espaciosDisponibles}`);

    if (espaciosDisponibles <= 0) {
        console.log('   ⚠️  No hay espacios libres para nuevas ofertas. Cancela algunas o ajusta la configuración.');
        return;
    }

    // 3. Filtrar la escala evitando cantidades que ya existen
    const cantidadesExistentes = abiertas
        .filter(o => o.coin === MONEDA && ((o.type === 'sell' && TIPO_OFERTA === 'sell') || (o.type === 'buy' && TIPO_OFERTA === 'buy')))
        .map(o => parseFloat(o.amount));

    const cantidadesACrear = scale.filter(q => !cantidadesExistentes.includes(q));
    if (cantidadesACrear.length === 0) {
        console.log('   ✅ No hay nuevas cantidades para crear (ya existen ofertas para cada cantidad en la escala).');
        return;
    }

    // Si hay más cantidades que espacios, limitar
    const crearLimite = Math.min(cantidadesACrear.length, espaciosDisponibles);

    // 4. Validación de balance si es venta (sell) -> se necesita USD
    if (TIPO_OFERTA === 'sell' && balance !== null) {
        const totalUSD = cantidadesACrear.slice(0, crearLimite).reduce((sum, v) => sum + v, 0);
        if (totalUSD > balance) {
            console.log(`   ⚠️  Balance insuficiente: requiere $${totalUSD}, tienes $${balance}`);
            console.log('   ▸ Ajustando cantidad de ofertas según balance disponible...');
            // Recorta la lista hasta que entre en balance
            let acumulado = 0;
            const ajustadas = [];
            for (const q of cantidadesACrear) {
                if (ajustadas.length >= crearLimite) break;
                if (acumulado + q <= balance) {
                    ajustadas.push(q);
                    acumulado += q;
                }
            }
            if (ajustadas.length === 0) {
                console.log('   ❌ No hay suficiente balance para crear ninguna oferta. Salir.');
                return;
            }
            cantidadesACrear.length = 0;
            cantidadesACrear.push(...ajustadas);
            console.log(`   ✅ Lista ajustada: ${cantidadesACrear.join(', ')} (total $${acumulado})`);
        }
    }

    // 5. Crear ofertas (manual price)
    console.log('\n🚀 Creando ofertas manuales...');
    let creadas = 0;
    for (let i = 0; i < cantidadesACrear.length && creadas < crearLimite; i++) {
        const cantidadUSD = cantidadesACrear[i];
        const cantidadCUP = parseFloat((cantidadUSD * price).toFixed(2));

        // Preparar payload
        const datosOferta = {
            type: TIPO_OFERTA,
            coin: MONEDA,
            amount: cantidadUSD,
            receive: cantidadCUP,
            details: config.ofertas[0] ? config.ofertas[0].detallesPago : [],
            only_kyc: config.ofertas[0] ? (config.ofertas[0].soloKYC ? 1 : 0) : 0,
            private: config.ofertas[0] ? (config.ofertas[0].privada ? 1 : 0) : 0,
            only_vip: config.ofertas[0] ? (config.ofertas[0].soloVIP ? 1 : 0) : 0,
            message: config.ofertas[0] ? config.ofertas[0].mensaje : undefined
        };

        console.log(`\n   ▸ Oferta ${i + 1}/${crearLimite}: $${cantidadUSD} USD → ${cantidadCUP} CUP (${price} CUP/USD)`);
        if (dryRun) {
            console.log('      🔎 Dry run: no se crea la oferta');
            creadas++;
        } else {
            const res = await crearOferta(TOKEN, datosOferta);
            if (res.exito) {
                console.log(`      ✅ Creada: ${res.oferta.uuid.substring(0, 8)}...`);
                creadas++;
            } else {
                console.log(`      ❌ Error al crear: ${res.error}`);
            }
        }

        // Delay entre creaciones
        if (i < cantidadesACrear.length - 1 && delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    console.log('\n📊 Proceso finalizado:');
    console.log(`   • Ofertas creadas: ${creadas}`);
    console.log(`   • Intentadas: ${Math.min(cantidadesACrear.length, crearLimite)}`);
    console.log('\nFin.');
}

// Ejecutar
run().catch(err => {
    console.error('❌ Error en gestor manual:', err.message || err);
    process.exit(1);
});
