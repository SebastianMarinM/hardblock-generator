# Hardblock Generator

Hardblock Generator es una aplicación web interna para generar textos automáticos de solicitudes Hardblock desde un formulario, copiar los bloques generados y guardar cada solicitud en SQLite con fecha de creación.

## Funcionalidades

- Formulario con los campos: `airline`, `ato`, `rooms`, `pax`, `nights`, `motivo`, `hotel`, `prioridad`, `status`, `booking_source`, `meals` y `payment`.
- Generación automática de dos bloques:
  - **Hardblock en curso**: usa `En curso` como valor fijo para `Status`, `Booking source`, `Meals`, `Payment`, `Hotel` y `Prioridad`.
  - **Hardblock Completed**: usa los valores reales ingresados en el formulario.
- Botones para copiar cada bloque, limpiar el formulario, guardar la solicitud y actualizar el historial.
- Persistencia en SQLite en `data/hardblock.db`.
- Pantalla simple de historial de solicitudes guardadas.

## Estructura del proyecto

```text
hardblock-generator/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   └── templates_service.py
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── data/
├── requirements.txt
└── README.md
```

## Requisitos

- Python 3.10 o superior
- pip

## Ejecución local paso a paso

1. Clona o abre el proyecto:

   ```bash
   cd hardblock-generator
   ```

2. Crea un entorno virtual:

   ```bash
   python -m venv .venv
   ```

3. Activa el entorno virtual:

   En macOS/Linux:

   ```bash
   source .venv/bin/activate
   ```

   En Windows PowerShell:

   ```powershell
   .venv\Scripts\Activate.ps1
   ```

4. Instala dependencias:

   ```bash
   pip install -r requirements.txt
   ```

5. Ejecuta la aplicación:

   ```bash
   uvicorn backend.main:app --reload
   ```

6. Abre la aplicación en el navegador:

   ```text
   http://127.0.0.1:8000
   ```

## API disponible

- `GET /`: interfaz web.
- `GET /health`: estado de la API.
- `POST /api/generate`: genera los dos bloques de texto desde un JSON de solicitud.
- `POST /api/requests`: guarda una solicitud en SQLite y devuelve el registro creado.
- `GET /api/requests`: lista el historial de solicitudes guardadas.

## Notas

- La base de datos se crea automáticamente en `data/hardblock.db` al iniciar la aplicación.
- El archivo de base de datos local no debe versionarse; solo se mantiene `data/.gitkeep` para conservar la carpeta en el repositorio.
