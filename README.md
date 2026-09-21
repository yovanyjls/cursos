# Cursos y Certificaciones — sitio estático

Página estática (HTML + CSS + JS puro, sin librerías) que muestra un catálogo
buscable y ordenable de cursos/certificaciones. Pensada para publicarse en
GitHub Pages.

## Archivos

- `index.html` — estructura de la página.
- `style.css` — estilos (paleta clara/oscura, tipografía, tabla).
- `app.js` — carga `cursos.json`, arma la tabla, buscador, orden por columna
  y el botón de tema claro/oscuro.
- `cursos.json` — los datos. **No lo edites a mano si puedes evitarlo**: se
  genera automáticamente (ver abajo).

## Cómo agregar o corregir un curso

**Opción recomendada** (mantiene todo sincronizado con el CV y el análisis
de importancia): edita `cv_generator/data/es/cursos.yaml` como ya vienes
haciendo, y luego vuelve a correr:

```
cd cv_generator/_build
python exportar_cursos_json.py
```

Esto regenera `sitio_cursos/cursos.json` a partir de `cursos.yaml` (mismo
cálculo de área/palabras clave que usa `analizar_cursos.py`).

**Opción rápida** (si solo quieres tocar el sitio sin pasar por el
generador de CV): edita `cursos.json` directamente. Cada entrada:

```json
{
  "nombre": "Nombre del curso",
  "institucion": "Institución",
  "fecha": "2026-01",       // o "" si sigue "enCurso": true
  "enCurso": false,
  "horas": 8,                // o null si no hay dato
  "area": "Inteligencia Artificial",
  "claves": ["Inteligencia Artificial", "IA"],
  "url": "https://..."       // o null si no hay certificado digital
}
```

## Ver el sitio en tu computadora antes de publicarlo

Los navegadores bloquean `fetch()` a un archivo local cuando abres
`index.html` con doble clic (protocolo `file://`). Necesitas un servidor
local mínimo. Con Python ya instalado, desde esta carpeta:

```
python -m http.server 8000
```

Y abre `http://localhost:8000` en el navegador. Una vez publicado en GitHub
Pages esto deja de ser un problema (se sirve por `https://`).
