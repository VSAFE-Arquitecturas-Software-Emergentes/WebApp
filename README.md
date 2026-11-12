# VSafe WebApp

Aplicación Vue 3 + TypeScript + PrimeVue, organizada por features y Clean Architecture: planning, journeys, reports, history y preferences. Dominio puro, casos de uso con puertos, adaptadores HTTP y presentación. El composition root está en src/app/container.ts.

## Desarrollo

Node.js 24.

```powershell
npm ci
npm run dev
```

Aplicación: http://localhost:5173. El proxy de Vite dirige /api al gateway en http://127.0.0.1:3100. El backend se ejecuta desde [Microservices](https://github.com/VSAFE-Arquitecturas-Software-Emergentes/Microservices); no se necesita copiar sus paquetes a este repositorio. La URL de API se configura en src/shared/infrastructure/http-client.ts mediante VITE_API_BASE_URL, por defecto /api/v1.

## Pruebas y compilación

```powershell
npm run build
npm run typecheck
npm test
# Con npm run dev y el backend demo ejecutándose:
npm run test:browser
```

Las pruebas de navegador usan Google Chrome instalado. Configurable en playwright.config.ts. Las capturas y trazas quedan en test-results/, excluido de Git. Los cuatro escenarios verifican coordenadas manuales, comparación/recorrido/historial, reportes y vista móvil sin desbordamiento horizontal.

## Cloudflare Pages

Raíz /, build npm run build, salida dist, NODE_VERSION=24. Mantener VITE_API_BASE_URL=/api/v1. Configurar API_ORIGIN en Pages Functions con el origen HTTPS del gateway Railway (sin /api). functions/api/[[path]].ts retransmite API, cookies y SSE en el mismo origen, sin caché. Añadir el origen exacto de Pages a FRONTEND_ORIGINS del gateway. Las variables VITE_ son públicas: no contienen tokens privados ni claves.

El modo demo se muestra explícitamente según el backend. El historial es optativo y local; los recorridos no garantizan seguridad. Inglés predeterminado y español es_419 disponibles. Los C4 y mockups del informe no forman parte de esta implementación.

[Landing independiente](https://github.com/VSAFE-Arquitecturas-Software-Emergentes/landing-page)
