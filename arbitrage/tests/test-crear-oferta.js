const fetch = require('node-fetch');

const TOKEN = '161859|$2b$10$cIpb.pYzr9ZwSf/6uiSzVu9jQYXH2tztqIUEpbcxGEjv/JWbFE51m';

async function test() {
    const url = 'https://api.qvapay.com/p2p/create';
    
    const body = {
        type: 'sell',
        coin: 2,
        amount: 10,
        receive: 5200,
        details: [
            { name: 'Banco', value: 'Banco Popular' }
        ],
        only_kyc: 1,
        private: 0
    };
    
    console.log('Datos:', JSON.stringify(body, null, 2));
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Respuesta:', JSON.stringify(result, null, 2));
}

test();
