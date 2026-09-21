# Cursos y Certificaciones — sitio estático

Página estática bilingüe (HTML + CSS + JS puro, sin librerías) que muestra
un catálogo buscable y ordenable de cursos/certificaciones, con selector de
idioma (ES/EN) y modo claro/oscuro. Pensada para publicarse en GitHub Pages.

## Archivos

- `index.html` — estructura de la página.
- `style.css` — estilos (paleta clara/oscura, tipografía, tabla, botones de
  idioma/tema).
- `app.js` — carga `cursos.es.json` y `cursos.en.json`, arma la tabla,
  buscador, orden por columna, selector de idioma y botón de tema.
- `cursos.es.json` / `cursos.en.json` — los datos, uno por idioma. **No los
  edites a mano si puedes evitarlo**: se generan automáticamente (ver abajo).

## Idioma y tema por defecto

En `app.js`, arriba de todo:

```js
const IDIOMA_INICIAL = "es"; // "es" o "en"
const TEMA_INICIAL = "light"; // "light" o "dark"
```

Define cómo abre la página para alguien que la visita por primera vez (sin
preferencia guardada en su navegador). Si tú u otro visitante usa los
botones ES/EN o 🌙/☀️, esa elección se guarda en su propio navegador y
prevalece la próxima vez — cambiar estas dos variables no afecta a quien ya
eligió una preferencia, solo a las visitas nuevas.

## Cómo agregar o corregir un curso

**Opción recomendada** (mantiene todo sincronizado con el CV y el análisis
de importancia): edita `cv_generator/data/es/cursos.yaml` (y su equivalente
`data/en/cursos.yaml` si quieres que también se refleje en inglés) como ya
vienes haciendo, y luego vuelve a correr:

```
cd cv_generator/_build
python exportar_cursos_json.py
```

Esto regenera `sitio_cursos/cursos.es.json` y `cursos.en.json` a partir de
ambos `cursos.yaml` (área/palabras clave calculadas automáticamente).

**Opción rápida** (si solo quieres tocar el sitio sin pasar por el
generador de CV): edita `cursos.es.json` y/o `cursos.en.json` directamente.
Cada entrada:

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

Si agregas un curso "a mano" en un idioma, agrégalo también en el otro
archivo para que ambas versiones tengan el mismo número de registros.

## Ver el sitio en tu computadora antes de publicarlo

Los navegadores bloquean `fetch()` a un archivo local cuando abres
`index.html` con doble clic (protocolo `file://`). Necesitas un servidor
local mínimo. Con Python ya instalado, desde esta carpeta:

```
python -m http.server 8000
```

Y abre `http://localhost:8000` en el navegador. Una vez publicado en GitHub
Pages esto deja de ser un problema (se sirve por `https://`).
