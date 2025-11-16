# 📚 UTILIDADES DISPONIBLES PARA EL GESTOR DE OFERTAS

## ✅ Utilidades Completadas

### 1. **`balance.js`** - Gestión de Balance
**Funciones:**
- `obtenerBalance(email, password, twoFactorCode)` - Obtiene balance completo con datos del usuario
- `obtenerSoloBalance(email, password, twoFactorCode)` - Devuelve solo el número del balance
- `verificarBalanceSuficiente(email, password, montoRequerido, twoFactorCode)` - Verifica si hay suficiente saldo

**Uso en el gestor:**
- Verificar saldo antes de crear ofertas de venta
- Monitorear balance disponible
- Prevenir errores por fondos insuficientes

---

### 2. **`publicar-ofertas.js`** - Crear Ofertas P2P
**Funciones:**
- `publicarOferta(email, password, tipo, datosOferta, opciones, twoFactorCode)` - Publicar oferta (detecta automáticamente tipo)
- `publicarOfertaCompra(...)` - Publicar oferta de compra (no requiere balance)
- `publicarOfertaVenta(...)` - Publicar oferta de venta (requiere balance)
- `crearDetallesBancoCUP(nombre, banco, cuenta, telefono)` - Helper para detalles bancarios
- `crearDetallesTarjeta(nombre, numeroTarjeta, telefono)` - Helper para tarjeta
- `crearDetallesZelle(nombre, email, telefono)` - Helper para Zelle
- `calcularTasa(montoCUP, montoUSD)` - Calcular tasa de cambio
- `calcularMontoCUP(montoUSD, tasa)` - Calcular monto en CUP
- `calcularMontoUSD(montoCUP, tasa)` - Calcular monto en USD

**Constantes:**
- `MONEDAS` - Códigos de monedas disponibles (BANK_CUP, BANK_MLC, ZELLE, etc.)

**Uso en el gestor:**
- Crear ofertas iniciales
- Crear ofertas al renovar
- Calcular precios y tasas

---

### 3. **`notificaciones.js`** - Sistema de Notificaciones
**Funciones:**
- `notificarOportunidad(oportunidad)` - Envía notificación de oportunidad
- `notificarResumen(oportunidades, precios)` - Envía resumen de múltiples oportunidades
- `verificarConfiguracion()` - Verifica qué métodos de notificación están habilitados
- `enviarPorTelegram(mensaje)` - Envía mensaje por Telegram
- `enviarPorCallMeBot(mensaje)` - Envía mensaje por WhatsApp (CallMeBot)
- `enviarPorTwilio(mensaje)` - Envía mensaje por WhatsApp (Twilio)

**Configuración:**
- Telegram (múltiples chats)
- WhatsApp vía CallMeBot (múltiples números)
- WhatsApp vía Twilio

**Uso en el gestor:**
- Notificar cuando se detecta un peer
- Alertar al renovar ofertas
- Informar errores o problemas

---

### 4. **`api-ofertas.js`** - API Wrapper
**Funciones:**
- `obtenerMisOfertas(token)` - Obtiene tus ofertas activas
- `crearOferta(token, datosOferta)` - Crea una nueva oferta
- `cancelarOferta(token, uuid)` - Cancela/elimina una oferta
- `obtenerBalance(token)` - Obtiene balance del usuario
- `filtrarOfertasSinPeer(ofertas)` - Filtra ofertas sin peer
- `filtrarOfertasConPeer(ofertas)` - Filtra ofertas con peer (aceptadas)
- `calcularEdadOferta(fechaCreacion)` - Calcula edad en minutos
- `necesitaRenovacion(oferta, tiempoMaximo)` - Verifica si necesita renovarse
- `encontrarOfertaGestionada(misOfertas, configOferta)` - Encuentra oferta específica

**Uso en el gestor:**
- Obtener estado actual de ofertas
- Cancelar ofertas antiguas
- Detectar ofertas aceptadas

---

### 5. **`calcular-precios.js`** - Calculadora de Precios Óptimos
**Funciones:**
- `calcularPreciosPorMoneda(ofertas, opciones)` - Calcula precios óptimos por moneda
- `formatearResultado(resultado, moneda)` - Formatea resultados para mostrar

**Configuración:**
- Método de margen: `spread_real`, `porcentaje_fijo`, `mixto`
- Factor de seguridad ajustable
- Eliminación de outliers

**Uso en el gestor:**
- Calcular precios para ofertas nuevas
- Actualizar precios al renovar
- Optimizar tasas competitivas

---

### 6. **`filtros.js`** - Sistema de Filtros
**Funciones:**
- `aplicarFiltrosEstandar(ofertas, opciones)` - Aplica filtros a ofertas
- `estadisticasFiltrado(original, filtrada)` - Muestra estadísticas de filtrado

**Filtros disponibles:**
- Excluir VIP
- Requerir KYC
- Solo ofertas públicas
- Solo monedas CUP
- Rangos de montos

**Uso en el gestor:**
- Filtrar ofertas del mercado para análisis
- Excluir ofertas no deseadas

---

### 7. **`gestionar-ofertas.js`** ⭐ NUEVA
**Funciones de Detección:**
- `detectarPeers(ofertas)` - Detecta ofertas con peer aceptado
- `notificarPeersDetectados(peersDetectados)` - Notifica peers
- `formatearNotificacionPeer(peer)` - Formatea mensaje de peer

**Funciones de Renovación:**
- `identificarOfertasParaRenovar(ofertas, tiempoMaximo)` - Identifica ofertas antiguas
- `renovarOferta(token, email, password, oferta, nuevosPrecios, twoFactorCode)` - Renueva una oferta
- `calcularEdadOferta(fechaCreacion)` - Calcula edad en minutos

**Funciones de Sincronización:**
- `sincronizarConConfiguracion(misOfertas, ofertasConfig)` - Sincroniza con config
- `crearOfertasFaltantes(email, password, ofertasFaltantes, precios, twoFactorCode)` - Crea ofertas faltantes

**Funciones de Reporte:**
- `generarReporte(ciclo, peersDetectados, ofertasRenovadas, ofertasCreadas)` - Genera reporte

**Uso en el gestor:**
- Core del sistema de gestión automática
- Renovar ofertas antiguas
- Detectar y notificar peers
- Crear ofertas faltantes

---

### 8. **`monedas.js`** - Gestión de Monedas
**Funciones:**
- `obtenerTodasLasMonedas(token)` - Lista todas las monedas
- `obtenerMonedasP2P(token)` - Obtiene monedas habilitadas para P2P
- `buscarMoneda(monedas, criterio)` - Busca moneda por nombre/código

**Uso en el gestor:**
- Validar monedas disponibles
- Verificar códigos de moneda

---

## 🎯 Próximo Paso: Crear el Gestor Principal

Con todas estas utilidades listas, el siguiente paso es crear:

### `gestor-ofertas.js` - Sistema Principal

Este archivo orquestará todas las utilidades para:

1. **Inicialización:**
   - Cargar configuración
   - Hacer login
   - Verificar balance inicial

2. **Ciclo Principal (cada X segundos):**
   ```javascript
   while (true) {
       // 1. Obtener precios óptimos
       const precios = await calcularPrecios();
       
       // 2. Obtener mis ofertas
       const misOfertas = await obtenerMisOfertas(token);
       
       // 3. Detectar peers
       const peers = detectarPeers(misOfertas);
       if (peers.length > 0) {
           await notificarPeersDetectados(peers);
       }
       
       // 4. Renovar ofertas antiguas
       const paraRenovar = identificarOfertasParaRenovar(misOfertas, tiempoMaximo);
       for (const oferta of paraRenovar) {
           await renovarOferta(token, email, password, oferta, precios, twoFactorCode);
       }
       
       // 5. Crear ofertas faltantes
       const sync = sincronizarConConfiguracion(misOfertas, configOfertas);
       if (sync.ofertasFaltantes.length > 0) {
           await crearOfertasFaltantes(email, password, sync.ofertasFaltantes, precios, twoFactorCode);
       }
       
       // 6. Generar reporte
       generarReporte(ciclo, peers, renovadas, creadas);
       
       // 7. Esperar próximo ciclo
       await sleep(intervalo);
   }
   ```

3. **Manejo de Errores:**
   - Reintentos automáticos
   - Notificaciones de errores
   - Logs detallados

---

## 📦 Estructura Final

```
arbitrage/
├── gestor-ofertas.js          ← CREAR (Sistema principal)
├── config-gestor-ofertas.js   ← Configuración
├── utils/
│   ├── balance.js             ✅ Completo
│   ├── publicar-ofertas.js    ✅ Completo
│   ├── notificaciones.js      ✅ Completo
│   ├── api-ofertas.js         ✅ Completo
│   ├── calcular-precios.js    ✅ Completo
│   ├── filtros.js             ✅ Completo
│   ├── gestionar-ofertas.js   ✅ Completo (NUEVA)
│   └── monedas.js             ✅ Completo
└── tests/
    └── test-gestor.js         ← CREAR (Test del gestor)
```

---

## 🚀 ¿Listo para crear el gestor principal?

Todas las utilidades están completas. Solo falta:
1. `gestor-ofertas.js` - El orquestador principal
2. `test-gestor.js` - Test del sistema completo

¿Procedemos a crear el gestor principal?
