# Visualizador Google Sheets

Web estática en HTML, CSS y JS que consume una hoja de Google Sheets publicada y muestra una tabla + gráfico.

## Archivos

- `index.html`: estructura principal.
- `tabla.html`: tabla general de puntos por jugador.
- `styles.css`: estilos.
- `app.js`: carga y render de datos.
- `tabla.js`: agregación de puntos y render de tabla.

## Ajustar la hoja

En `app.js`, cambia `SHEET_PUBHTML_URL` y `SHEET_CSV_BASE_URL` si usas otra hoja.
Puedes editar `MANUAL_TAB_NAMES` para listar las pestañas esperadas.

El formato recomendado para hojas publicadas es:

```
https://docs.google.com/spreadsheets/d/e/<ID>/pub?output=csv
```

## Ejecutar en local

Necesitas un servidor estático (por ejemplo, con Python):

```powershell
python -m http.server 5173
```

Luego abre: `http://localhost:5173`

## Notas

- Si la hoja tiene varias pestañas, el selector de hoja se llena automáticamente desde `pubhtml`.
- Si alguna pestaña no aparece, asegúrate de que esté publicada o pasa su `gid` manualmente.
- Si no se listan todas las pestañas, puedes forzar `&gid=<ID>` en `SHEET_CSV_BASE_URL`.
- El gráfico detecta columnas numéricas automáticamente.
