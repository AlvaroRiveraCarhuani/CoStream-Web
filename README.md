# CoStream Web Client

**CoStream** es una plataforma profesional de transmisión, diseñada para facilitar sesiones de *live coding*, defensas de proyectos y revisiones de arquitectura técnica en tiempo real sin requerir registros obligatorios para los espectadores.

Este repositorio contiene la aplicación cliente (Frontend) desarrollada con **Angular**.

## 🚀 Tecnologías Principales

- **Framework:** Angular 17+ (Standalone Components)
- **WebRTC & Video:** [LiveKit Client](https://livekit.io/)
- **Tiempo Real:** Socket.io Client
- **Estilos:** Vanilla CSS con CSS Grid / Flexbox
- **Validación:** Angular Reactive Forms

## ✨ Características

- **Estudio de Transmisión (Room):** Integración completa con LiveKit para audio, video y uso compartido de pantalla (Screen Share).
- **Layout Adaptativo (Zoom-like):** Cuadrícula asimétrica (`CSS Grid`) que se re-calcula en tiempo real según la cantidad de participantes y si hay pantalla compartida activa.
- **Chat en Vivo:** Comunicación en tiempo real a través de WebSockets, con retención de historial de mensajes.
- **Controles de Anfitrión:** Permisos avanzados para el host (apagar cámara/micrófono de terceros, expulsar participantes, forzar estado de media).
- **Diseño Responsivo:** UI optimizada tanto para escritorio como para dispositivos móviles (layouts de 2 columnas).

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio y acceder
```bash
git clone https://github.com/AlvaroRiveraCarhuani/CoStream-Web.git
cd CoStream-Web
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Variables de Entorno
Crea un archivo `src/environments/environment.ts` o configura las variables en tu proveedor de hosting:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  socketUrl: 'http://localhost:3000',
  livekitUrl: 'wss://tu-instancia.livekit.cloud'
};
```

### 4. Servidor de Desarrollo
Ejecuta el servidor de desarrollo local de Angular:
```bash
npm run start
# o
ng serve
```
La aplicación estará disponible en `http://localhost:4200/`.

## 📦 Compilación para Producción

Para generar los archivos estáticos de producción:
```bash
npm run build
```
Los artefactos se almacenarán en la carpeta `dist/costream-web`.

## 📄 Licencia

Este proyecto es propiedad de sus creadores y está restringido a los términos y condiciones especificados por el equipo de CoStream.
