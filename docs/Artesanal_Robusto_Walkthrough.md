# SISCOM: Arquitectura "Artesanal y Robusta" 🚀

Se ha implementado el nuevo stack tecnológico basado en la estética **Glass & Steel** y una infraestructura de datos moderna y segura.

## 🛠️ Stack Implementado
- **Frontend**: React (Vite) + **Styled Components** (CSS-in-JS) + **Framer Motion** (Animaciones).
- **Backend**: Node.js + **Prisma ORM 7** + **SQLite**.
- **Iconografía**: Lucide React.
- **Tipografía**: Outfit / Inter (vía Google Fonts).

## 📂 Componentes Clave
1.  **`GlobalStyle.js`**: Define la paleta de colores premium y el sistema de diseño translúcido.
2.  **`GlassCard.jsx`**: Un componente base reutilizable con `backdrop-filter` y sombras suaves.
3.  **`Layout.jsx`**: Sidebar animada con efecto cristal y navegación fluida.
4.  **`RadicacionStepper.jsx`**: Formulario interactivo por pasos para la radicación de expedientes.

## 🗄️ Base de Datos (Prisma + SQLite)
El esquema ha sido unificado y optimizado para SQLite:
-   **Model `Persona`**: Maneja tanto víctimas como agresores en una sola tabla robusta.
-   **Model `Expediente`**: Relaciona a las personas y almacena el puntaje de riesgo y la carpeta de Drive.
-   **Model `EvaluacionRiesgo`**: Almacena las respuestas detalladas de las evaluaciones.

## 🚀 Cómo empezar
1.  **Frontend**: Los nuevos estilos ya están integrados en `App.jsx`. Puedes ver el flujo de radicación en `http://localhost:4001/radicacion`.
2.  **Backend**: Se ha generado el cliente de Prisma y se ha sincronizado la base de datos (`dev.db`). Puedes usar `require('./lib/prisma')` para interactuar con la base de datos de forma segura.

---
*Este sistema está diseñado para ser visualmente impactante y técnicamente inexpugnable.*
