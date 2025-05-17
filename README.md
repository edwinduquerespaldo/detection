# AstroImage

Este proyecto es un portafolio multipágina construido con Astro. Incluye:

- Un menú de navegación para acceder a diferentes proyectos.
- Una página de detección de objetos en tiempo real usando la cámara y TensorFlow.js (COCO-SSD).

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

### Proyecto: Detección de Objetos
- Accede a `/deteccion` para probar la detección de objetos en tiempo real.
- Requiere permisos de cámara y debe ejecutarse en HTTPS o localhost.
