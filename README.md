🏆 E-Sport Tournament Management – Backend API

API REST desarrollada para la gestión de torneos competitivos, equipos y estadísticas individuales.
El foco principal del proyecto está en el modelado de dominio, reglas de negocio y arquitectura backend estructurada.

🚀 Stack Tecnológico

Node.js

TypeScript

Express

Prisma ORM

PostgreSQL (Neon)

Cloudinary (gestión de imágenes)

Servicio SMTP para verificación de email

🧠 Arquitectura

El backend está organizado en capas con separación clara de responsabilidades:
```
src/
 ├── controllers/
 ├── services/
 ├── routes/
 ├── middlewares/
 ├── prismaClient.ts
 ├── server.ts
```
Responsabilidades

Routes → Definición de endpoints.

Controllers → Manejo de request y response.

Services → Lógica de negocio y reglas del dominio.

Middlewares → Autenticación y autorización.

Prisma Client → Acceso y persistencia de datos.

Esta estructura permite mantener el código escalable, mantenible y desacoplado.

🔐 Autenticación y Autorización

Registro con verificación por email.

Contraseñas almacenadas mediante hash seguro.

Control de acceso basado en roles.

Middleware de autorización por endpoint.

Roles implementados

ADMIN

CAPTAIN

Cada rol tiene permisos diferenciados dentro del sistema.

🏗 Modelo de Dominio

El sistema modela un entorno competitivo con reglas propias de torneos.

Entidades principales

Usuario

Equipo

Jugador

Torneo

Partido

EstadisticaJugador

TablaPosiciones

Mapa

Características del dominio

Relación 1-1 entre capitán y equipo.

Gestión de plantilla (titulares, suplentes y coach).

Registro de partidos con equipos A/B y ganador.

Snapshot de estadísticas individuales por partido.

Cálculo de KDA.

Tabla de posiciones por torneo.

Estados controlados mediante enums.

Reglas temporales:

Fecha de cierre de inscripción.

Fecha límite de gestión de equipo.

Restricciones únicas compuestas para garantizar integridad.

📡 API REST

La API expone endpoints para:

Autenticación y verificación de usuarios.

Gestión de equipos.

Gestión de jugadores.

Administración de torneos.

Registro de partidos.

Cálculo y consulta de estadísticas.

La autorización es validada en backend según el rol autenticado.

🗄 Base de Datos

Base de datos relacional en PostgreSQL utilizando Prisma ORM.

Se aplican:

Claves únicas.

Relaciones explícitas.

Restricciones compuestas.

Integridad referencial.

Enums para control de estados.

⚙️ Instalación Local

1️⃣ Clonar el repositorio:
```
git clone <repo-url>
cd <project-folder>
```

2️⃣ Instalar dependencias:
```
npm install
```

3️⃣ Configurar variables de entorno:

DATABASE_URL

EMAIL_USER

EMAIL_PASS

CLOUDINARY_CLOUD_NAME

CLOUDINARY_API_KEY

CLOUDINARY_API_SECRET

4️⃣ Ejecutar en desarrollo:
```
npm run dev
```
📌 Estado del Proyecto

Proyecto personal en desarrollo activo enfocado en:

Robustez de reglas de negocio.

Mejora continua de arquitectura backend.

Evolución hacia una estructura escalable.