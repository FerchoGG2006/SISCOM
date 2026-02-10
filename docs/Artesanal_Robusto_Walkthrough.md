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
5.  **`Personas.jsx`**: Vista unificada para el seguimiento de ciudadanos (víctimas/agresores) y su historial.

## 🛡️ Robustez y Recuperación
El sistema incluye mecanismos de fail-safe:
-   **Drive Sync**: Botón de emergencia en el detalle del expediente para crear/reparar carpetas en Google Drive si falló la conexión inicial.
-   **Transacciones Atómicas**: El uso de Prisma asegura que los datos de radicación sean consistentes incluso si fallan servicios externos.

## 🚀 Cómo empezar
1.  **Explorar Personas**: Navega a `/personas` para ver el registro unificado y el conteo de casos por rol.
2.  **Gestión de Expedientes**: En `/expedientes/:id`, puedes generar PDF y reparar la conexión con Drive mediante el botón de sincronización.
3.  **Configuración**: Asegúrate de revisar `driveService.js` para cuando se pase de mock a producción con credenciales reales.


---
*Este sistema está diseñado para ser visualmente impactante y técnicamente inexpugnable.*
