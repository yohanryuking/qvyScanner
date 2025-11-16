const fetch = require('node-fetch');
const credenciales = require('../credenciales');

async function verMonedasMercado() {
    const response = await fetch('https://api.qvapay.com/p2p/index?page=1', {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${credenciales.token}`
        }
    });
    
    const data = await response.json();
    const monedas = new Map();
    
    data.data.forEach(o => {
        if (!monedas.has(o.coin)) {
            monedas.set(o.coin, {
                coin: o.coin,
                coinObject: o.Coin
            });
        }
    });
    
    console.log('📊 Monedas encontradas en el mercado P2P:\n');
    monedas.forEach((data, coin) => {
        console.log(`💱 ${coin}`);
        if (data.coinObject) {
            console.log(`   ID: ${data.coinObject.id || 'N/A'}`);
            console.log(`   Nombre: ${data.coinObject.name || 'N/A'}`);
        }
        console.log('');
    });
}

verMonedasMercado();
