# Escuela de Pádel — V1 limpia

## Estructura
```
/
├── index.html          ← Inicio (pantalla principal)
├── login.html          ← Login / Registro
├── alumnos.html        ← (próxima versión)
├── grupos.html         ← (próxima versión)
├── ejercicios.html     ← (próxima versión)
├── clases.html         ← (próxima versión)
├── torneos.html        ← (próxima versión)
├── stats.html          ← (próxima versión)
├── pistas.html         ← (próxima versión)
├── cobros.html         ← (próxima versión)
├── manifest.json       ← PWA config
├── css/
│   └── style.css       ← Sistema de diseño completo
├── js/
│   ├── config.js       ← Credenciales Supabase + constantes
│   ├── store.js        ← Capa de datos (todas las queries)
│   └── ui.js           ← Helpers de UI compartidos
└── icons/              ← Copia aquí todos los PNG de iconos
```

## Iconos necesarios en /icons/
Copia los PNG con estos nombres exactos:
- inicio.png, alumnos.png, grupos.png, ejercicios.png
- clases.png, torneos.png, stats.png, pistas.png
- americano.png, escalera.png, mexicano.png, robin.png
- calentamiento.png, carritos.png, situaciones.png, partiditos.png, generico.png
- mensual.png, matricula.png, bono.png, libre.png, particular.png
- todos.png, principiante.png, intermedio.png, avanzado.png
- programada.png, realizada.png, suspendida.png, festivo.png
- semana.png, mes.png, trimestre.png, anio.png

## Tablas Supabase necesarias
Asegúrate de que existen estas tablas con RLS habilitado:
- escuelas (id, usuario_id, nombre, created_at)
- alumnos (id, escuela_id, nombre, nivel, telefono, created_at)
- grupos (id, escuela_id, nombre, nivel, pista, dias, hora_inicio, hora_fin)
- alumno_grupos (id, alumno_id, grupo_id)
- ejercicios (id, escuela_id, nombre, categoria, tipo, nivel, duracion, material, descripcion, usos)
- clases (id, escuela_id, grupo_id, fecha, hora, estado, ejercicios jsonb, asistentes jsonb)
- torneos (id, escuela_id, nombre, tipo, fecha, estado, num_jugadores)
- participantes (id, torneo_id, nombre, pareja)
- partidos (id, torneo_id, jornada, pista, pareja_a, pareja_b, resultado_a, resultado_b)
- cobros (id, escuela_id, alumno_id, tipo, importe, fecha, mes, forma_pago)
- semanas_pista (id, escuela_id, fecha_inicio, num_pistas)
- bloques_pista (id, semana_id, pista, tipo, hora_inicio, hora_fin, grupo_id, actividad)

## Deploy en Netlify
1. Arrastra la carpeta completa a netlify.com/drop
2. O conecta el repo de GitHub y Netlify lo despliega automático

## Credenciales (ya configuradas en js/config.js)
- Project URL: https://tucegjotydqrgxdcboqn.supabase.co
- Anon key: configurada
