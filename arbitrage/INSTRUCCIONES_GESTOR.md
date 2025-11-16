# 🤖 INSTRUCCIONES DEL GESTOR AUTOMÁTICO DE OFERTAS

## ✅ Estado del Sistema

**COMPLETO Y LISTO PARA USAR** ✨

Todas las utilidades han sido implementadas y probadas:
- ✅ `balance.js` - Gestión de balance
- ✅ `publicar-ofertas.js` - Crear ofertas P2P
- ✅ `notificaciones.js` - Sistema de notificaciones
- ✅ `api-ofertas.js` - API Wrapper
- ✅ `calcular-precios.js` - Calculadora de precios óptimos
- ✅ `filtros.js` - Sistema de filtros
- ✅ `gestionar-ofertas.js` - Gestión del ciclo de vida
- ✅ `monedas.js` - Gestión de monedas

## 📋 Antes de Ejecutar

### 1. Actualizar Token en la Configuración

El token en `config-gestor-ofertas.js` debe ser válido. Obtén un token nuevo:

```bash
# Método 1: Login manual
node EMPEZAR_AQUI/1-mi-login.js

# Método 2: Ver tu balance (también muestra el token)
node EMPEZAR_AQUI/ver-mi-balance.js
```

Luego actualiza el token en `arbitrage/config-gestor-ofertas.js`:

```javascript
module.exports = {
    token: 'TU_TOKEN_AQUI',
    // ... resto de la configuración
};
```

### 2. Configurar tus Ofertas

Edita `arbitrage/config-gestor-ofertas.js` y define las ofertas que quieres mantener activas:

```javascript
ofertas: [
    {
        id: 'venta-bank-cup-100',     // Identificador único
        tipo: 'venta',                  // 'compra' o 'venta'
        moneda: 'BANK_CUP',            // Moneda a operar
        coinId: 2,                      // ID numérico (2=BANK_CUP)
        cantidadUSD: 100,              // Monto en USD
        
        detallesPago: [                // Información de pago
            { name: 'Método de pago', value: 'Transferencia Bancaria' },
            { name: 'Banco', value: 'Banco Popular de Ahorro' }
        ],
        
        soloKYC: true,                 // Solo usuarios verificados
        privada: false,                // Oferta pública
        soloVIP: false,                // Solo usuarios VIP
        habilitada: true,              // Activar esta oferta
        
        mensaje: 'Operación rápida y segura'
    }
]
```

### 3. Configurar Notificaciones

Para recibir notificaciones cuando alguien acepta tus ofertas, configura WhatsApp o Telegram.

Ver archivo: `arbitrage/CONFIGURACION_WHATSAPP.md` o `arbitrage/NOTIFICACIONES.md`

## 🧪 Testing

### Ejecutar Tests del Sistema

Antes de poner el gestor en producción, ejecuta los tests:

```bash
# Test completo del gestor (sin crear ofertas reales)
node arbitrage/tests/test-gestor.js
```

Este test verifica:
- ✅ Conexión a la API
- ✅ Cálculo de precios óptimos
- ✅ Obtención de tus ofertas actuales
- ✅ Detección de renovaciones necesarias
- ✅ Sincronización con configuración
- ✅ Simulación de creación de ofertas

### Tests Individuales

```bash
# Ver tus ofertas actuales
node arbitrage/tests/test-ver-mis-ofertas.js

# Probar notificaciones
node arbitrage/tests/test-notificacion.js

# Test del sistema de balance
node arbitrage/tests/test-balance.js

# Test de crear oferta (simulado)
node arbitrage/tests/test-crear-oferta.js
```

## 🚀 Ejecución del Gestor

### Modo Normal

```bash
node arbitrage/gestor-ofertas.js
```

### Modo Background (recomendado para producción)

```bash
# Con nohup (Linux/Mac)
nohup node arbitrage/gestor-ofertas.js > gestor.log 2>&1 &

# Ver logs en tiempo real
tail -f gestor.log

# Ver proceso
ps aux | grep gestor-ofertas

# Detener
pkill -f gestor-ofertas.js
```

### Usando PM2 (recomendado)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar gestor
pm2 start arbitrage/gestor-ofertas.js --name "qvapay-gestor"

# Ver logs
pm2 logs qvapay-gestor

# Ver estado
pm2 status

# Detener
pm2 stop qvapay-gestor

# Reiniciar
pm2 restart qvapay-gestor

# Configurar para iniciar con el sistema
pm2 startup
pm2 save
```

## 📊 Funcionamiento del Gestor

### Ciclo Automático (cada 30 segundos por defecto)

1. **Obtener Precios del Mercado**
   - Analiza ofertas públicas
   - Calcula precios óptimos de compra/venta
   - Aplica factor de seguridad

2. **Revisar tus Ofertas Activas**
   - Obtiene todas tus ofertas
   - Identifica cuáles tienen peer (aceptadas)
   - Calcula edad de cada oferta

3. **Detectar Peers**
   - Si una oferta fue aceptada → **NOTIFICA INMEDIATAMENTE** 🎉
   - Envía notificación por WhatsApp/Telegram
   - Muestra datos del comprador/vendedor

4. **Renovar Ofertas Antiguas**
   - Si una oferta lleva >20 min sin peer:
     - Elimina la oferta antigua
     - Crea una nueva con precios actualizados
     - Notifica la renovación

5. **Crear Ofertas Faltantes**
   - Si alguna oferta configurada no existe
   - La crea con precios óptimos actuales

### Ejemplo de Salida

```
═══════════════════════════════════════════════════════
🔍 CICLO GESTOR - 15/11/2025, 14:30:00
═══════════════════════════════════════════════════════

📊 Calculando precios de referencia...
✅ Precios actualizados

   BANK_CUP:
      🟢 Comprar hasta: 508.50 CUP/USD
      🔴 Vender desde: 512.80 CUP/USD
      📊 25 ofertas analizadas

📋 Obteniendo mis ofertas activas...
   Total ofertas: 2
   🎉 Con peer: 1
   ⏳ Sin peer: 1

🔧 Gestionando ofertas...

   🎉 Oferta abc12345... tiene PEER!
      👤 Peer ID: user-789
      💰 100 USD → 51200 CUP
      📲 Notificación enviada

   ⏳ Oferta def67890... - Sin peer (15 min de 20 max)

📊 ESTADÍSTICAS DEL GESTOR:
   ⏰ Tiempo activo: 120 minutos
   ✅ Ofertas creadas: 3
   🔄 Ofertas renovadas: 2
   🎉 Peers detectados: 1

═══════════════════════════════════════════════════════
⏰ Próximo ciclo en 30 segundos...
═══════════════════════════════════════════════════════
```

## ⚙️ Configuración Avanzada

### Ajustar Tiempos

En `config-gestor-ofertas.js`:

```javascript
gestion: {
    tiempoMaximoSinPeer: 20,    // Minutos antes de renovar
    intervaloEscaneo: 30,       // Segundos entre ciclos
    margenAjuste: 0,            // % de ajuste de precio (0 = exacto)
    notificarRenovacion: true,  // Notificar renovaciones
    notificarPeer: true         // Notificar peers (RECOMENDADO)
}
```

### Múltiples Ofertas

Puedes mantener varias ofertas simultáneamente:

```javascript
ofertas: [
    {
        id: 'venta-bank-cup-100',
        tipo: 'venta',
        moneda: 'BANK_CUP',
        cantidadUSD: 100,
        habilitada: true
    },
    {
        id: 'compra-bank-cup-50',
        tipo: 'compra',
        moneda: 'BANK_CUP',
        cantidadUSD: 50,
        habilitada: true
    },
    {
        id: 'venta-zelle-200',
        tipo: 'venta',
        moneda: 'ZELLE',
        coinId: 6,
        cantidadUSD: 200,
        habilitada: false  // Deshabilitada temporalmente
    }
]
```

## 🔐 Seguridad

- ✅ El token nunca se muestra en logs
- ✅ Solo gestiona TUS ofertas (filtro automático)
- ✅ Verifica balance antes de crear ofertas de venta
- ✅ Notificaciones cifradas en tránsito
- ✅ No almacena información sensible

## 📱 Notificaciones

Cuando alguien acepta tu oferta recibirás:

```
🎉 ¡OFERTA ACEPTADA!

Alguien aceptó tu oferta de VENTA:

💰 Monto: 100 USD → 51200 CUP
📊 Tasa: 512.00 CUP/USD
💱 Moneda: BANK_CUP

👤 Peer ID: user-789
📅 Hora: 14:30:15

🔗 Ver oferta: https://qvapay.com/p2p/abc123...

Completa la transacción en la plataforma
```

## 🛑 Detener el Gestor

**Modo Normal:**
- Presiona `Ctrl+C` en la terminal

**Modo Background:**
```bash
pkill -f gestor-ofertas.js
```

**Con PM2:**
```bash
pm2 stop qvapay-gestor
```

## 📈 Monitoreo

### Ver Estadísticas

El gestor muestra estadísticas cada hora:

```
📊 ESTADÍSTICAS DEL GESTOR:
   ⏰ Tiempo activo: 360 minutos
   ✅ Ofertas creadas: 8
   🔄 Ofertas renovadas: 6
   🎉 Peers detectados: 2
```

### Logs

```bash
# Ver logs en tiempo real
tail -f gestor.log

# Buscar peers detectados
grep "PEER DETECTADO" gestor.log

# Ver renovaciones
grep "Renovando oferta" gestor.log
```

## ⚠️ Solución de Problemas

### Error: "Unauthorized"
- **Causa:** Token expirado
- **Solución:** Obtén un token nuevo y actualiza `config-gestor-ofertas.js`

### Error: "Insufficient balance"
- **Causa:** No tienes saldo suficiente para vender
- **Solución:** Recarga tu cuenta QvaPay

### No detecta peers
- **Causa:** Las ofertas no son competitivas
- **Solución:** Ajusta `margenAjuste` en la configuración para ser más agresivo

### Ofertas no se renuevan
- **Causa:** Error en la API o red
- **Solución:** Revisa los logs, el gestor reintentará automáticamente

## 📚 Documentación Adicional

- `GESTOR_OFERTAS.md` - Documentación completa del sistema
- `NOTIFICACIONES.md` - Configurar notificaciones
- `RESUMEN_UTILIDADES.md` - Detalles de todas las utilidades
- `PUBLICAR_OFERTAS.md` - API de publicación de ofertas

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs: `tail -f gestor.log`
2. Ejecuta el test: `node arbitrage/tests/test-gestor.js`
3. Verifica tu token: `node EMPEZAR_AQUI/ver-mi-balance.js`
4. Revisa la configuración en `config-gestor-ofertas.js`

---

**¡El gestor está listo para automatizar tus operaciones P2P!** 🚀
