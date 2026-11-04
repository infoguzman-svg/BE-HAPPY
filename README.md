# Web Jardín Infantil Be Happy

La web se actualiza sola: cada vez que guardas un cambio aquí en GitHub, Vercel la vuelve a publicar en ~1 minuto.

## Cambiar textos (horarios, niveles, testimonios, contacto)

1. Abre el archivo **`content.json`** y pulsa el lápiz ✏️ (Edit).
2. Cambia solo el texto que está **entre comillas**. No borres comillas `"`, comas `,` ni llaves `{ }`.
3. Abajo pulsa **Commit changes**. Listo.

Ejemplo, cambiar un horario:
```
"horario": "Editar horario"   →   "horario": "08:30 a 13:00"
```

Si quieres agregar el correo, escríbelo en `"email": ""`.
Si una sección queda sin testimonios (`"testimonios": []`), se oculta sola.

## Cambiar o agregar fotos

1. Entra a la carpeta **`fotos`** → **Add file → Upload files** y sube la foto (ej. `fonda.jpg`).
2. En `content.json`, en `"galeria"`, cambia la ruta: `"foto": "fotos/fonda.jpg"`.
3. Para agregar una foto nueva, copia una línea completa de la galería, pégala debajo y cambia título y foto.

⚠️ Usa solo fotos de niños que tengan autorización de sus apoderados para publicarse en internet.

## Cambiar el logo

Sube el logo oficial con el nombre **`logo.svg`** (o `logo.png` y cambia `logo.svg` por `logo.png` en `index.html`).

## Archivos

- `content.json` → todos los textos (lo único que necesitas editar)
- `fotos/` → imágenes de la galería
- `index.html`, `styles.css`, `app.js` → diseño (no es necesario tocarlos)
