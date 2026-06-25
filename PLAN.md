# PLAN — NOVALUX Landing Page con Astro 7

## Resumen del proyecto

Landing page estática para **Novalux**, empresa de distribución energética y telecomunicaciones. Construida con **Astro 7** y **CSS vanilla** (sin frameworks CSS), orientada a captación de distribuidores independientes.

---

## Cómo funciona Astro con HTML y CSS vanilla

Astro es un framework de islas. Cada fichero `.astro` es básicamente HTML con un bloque frontmatter (entre `---`) para lógica JS en tiempo de build. El resultado final es **HTML estático puro** — cero JS en el navegador por defecto. Para añadir interactividad (como el menú móvil), se usa una etiqueta `<script>` normal dentro del componente y Astro la gestiona. El CSS se escribe en un bloque `<style>` dentro del `.astro` (scoped al componente) o en `global.css` para estilos globales.

---

## Paleta de colores (CSS custom properties)

Definidas en `src/styles/global.css`:

```css
:root {
  --color-navy:   #0E2A4D;
  --color-blue:   #1E5F8C;
  --color-orange: #F7941D;
  --color-gold:   #FFC107;
  --color-cream:  #FFF4E2;
  --color-bg:     #F6F8FB;
  --color-muted:  #64748B;
  --color-border: #E5EAF0;
}
```

---

## Estructura de ficheros final

```
src/
├── components/
│   ├── Header.astro       ← nav fija + menú móvil (con <script> vanilla)
│   ├── Hero.astro         ← headline, métricas (+40 compañías, +300 colaboradores, 24-48h)
│   ├── Benefits.astro     ← 3 cards: compañías / comisiones / tramitación
│   ├── Services.astro     ← 4 cards imagen: Energía, Gas, Fibra, Móvil
│   ├── Commissions.astro  ← sección navy + timeline 3 fases
│   ├── Testimonials.astro ← 3 testimonios (Marta, Javier, Laura)
│   ├── ContactForm.astro  ← CTA + formulario estático (nombre, tel, email, tipo negocio)
│   └── Footer.astro       ← links legales + copyright
├── layouts/
│   └── BaseLayout.astro   ← <html>, <head> con fuentes Manrope + Material Icons, global.css
├── pages/
│   └── index.astro        ← importa todos los componentes en orden
└── styles/
    └── global.css         ← :root variables, reset, tipografía base, clases de utilidad
```

---

## Fuentes y recursos externos

- **Manrope** (Google Fonts) — fuente principal
- **Material Symbols Outlined** (Google Fonts) — iconos
- Ambas se cargan en el `<head>` de `BaseLayout.astro` vía `<link>` de Google Fonts, sin dependencias npm adicionales

---

## Componentes clave y qué hacen

| Componente | Descripción |
|---|---|
| `BaseLayout.astro` | Envuelve todo; inyecta fuentes y el `<link>` al `global.css` |
| `Header.astro` | Navbar fija con `backdrop-filter: blur`, enlaces de ancla y botón hamburguesa con `<script>` que añade/quita clase `open` al menú en móvil |
| `Hero.astro` | Headline con gradiente de texto navy→blue, dos CTA buttons, grid de métricas |
| `Commissions.astro` | Fondo `var(--color-navy)`, timeline vertical con 3 fases (Activación, Recurrencia, Sin límite), accent colors naranja/azul/dorado |
| `ContactForm.astro` | Formulario HTML estático con `action=""` vacío; validación nativa HTML5 con `required` |

---

## Flujo de datos (cero JS en runtime)

```
Astro 7 Build (Vite 8)
  └─ BaseLayout.astro (head, fonts, global.css)
       └─ pages/index.astro (orquesta componentes)
            └─ Componentes .astro (HTML + CSS scoped)
                 └─ HTML estático (dist/)
```

---

## Notas de implementación

- CSS vanilla con Grid y Flexbox nativo — sin clases de utilidad
- El menú móvil usa `<script>` inline en `Header.astro` (Astro lo bundlea automáticamente)
- Las imágenes de servicios se dejan como `src` externo hasta que el cliente proporcione imágenes reales
- El formulario no envía datos todavía — queda preparado para añadir EmailJS o Netlify Forms en el futuro

---

## Stack técnico

| Herramienta | Versión | Rol |
|---|---|---|
| Astro | 7.x | Framework SSG |
| Vite | 8.x (incluido en Astro) | Bundler |
| pnpm | 10.x | Gestor de paquetes |
| CSS vanilla | — | Estilos (sin Tailwind) |
| Node.js | 22+ | Runtime de build |
