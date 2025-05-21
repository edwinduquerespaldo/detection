# AstroImage

Este proyecto es un portafolio multipágina construido con Astro. Incluye:

- Un menú de navegación para acceder a diferentes proyectos.
- Una página de detección de objetos en tiempo real usando la cámara y TensorFlow.js (COCO-SSD).
- Un juego de laberinto controlado con la nariz usando TensorFlow.js.
- Un filtro congelador que aplica efectos sobre el video.
- Filtros faciales interactivos usando ml5.js FaceMesh.

## Tecnologías
- Astro para la estructura multipágina
- TensorFlow.js para detección de objetos y pose estimation
- ml5.js para detección facial y efectos en tiempo real
- WebRTC para acceso a la cámara
- Canvas API para renderizado de efectos

## Estructura
- Cada proyecto debe agregarse como una nueva página en `src/pages`.
- El menú principal enlaza a cada proyecto.

## Cómo iniciar el proyecto

```sh
npm run dev
```

Luego abre el navegador en http://localhost:4321

## Despliegue
Puedes desplegar este sitio en Cloudflare Pages, Vercel, Netlify, etc.

---

### Proyectos Disponibles

#### Detección de Objetos
- Ruta: `/deteccion`
- Detección de objetos en tiempo real usando COCO-SSD
- Muestra el nombre y porcentaje de confianza de los objetos detectados

#### Laberinto con Nariz
- Ruta: `/laberinto`
- Juego interactivo controlado por movimientos de la nariz
- Usa TensorFlow.js para tracking facial

#### Filtro Congelador
- Ruta: `/filtro-congelador`
- Efecto de congelamiento sobre el video en tiempo real
- Efectos visuales personalizados usando Canvas

#### Filtros Faciales
- Ruta: `/filtros`
- Filtros interactivos usando ml5.js FaceMesh
- Opciones disponibles:
  - Puntos faciales
  - Gafas vectoriales
  - Sombrero con seguimiento
- Tracking facial en tiempo real

Nota: Todos los proyectos requieren permisos de cámara y deben ejecutarse en HTTPS o localhost.
