<p align="center">
  <a href="https://nodejs.org/" target="_blank">
    <img src="https://nodejs.org/static/images/logo.svg" width="140" alt="Node.js Logo" />
  </a>
</p>

<h1 align="center">🎮 Plataforma de Gestión de Torneos E-Sports</h1>

---
## 🏗️ Descripción del Proyecto

Este proyecto es un backend desarrollado con **Node.js + Express + TypeScript**, que utiliza **PostgreSQL (Neon Tech)** como base de datos y **Prisma ORM** para la gestión y modelado de datos.

La aplicación permite:

- 👤 Gestión de usuarios con roles (ADMIN / CAPTAIN)
- 🏆 Gestión de equipos
- 🎮 Administración de torneos
- 📊 Registro de partidos
- 📈 Estadísticas individuales por jugador
- 🏅 Tabla de posiciones automática

Cuenta con autenticación mediante hash de contraseñas, verificación de correo electrónico y control de acceso basado en roles.

---

## 🧰 Stack Tecnológico

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL (Neon Tech)
- Cloudinary (gestión de imágenes)
- Vercel (deploy frontend)

---

## ⚡ Requisitos Previos

- Node.js >= 18
- npm
- PostgreSQL o cuenta en Neon Tech

---

## 🛠️ Instalación del Proyecto

### 1️⃣ Clonar el repositorio

```bash
git clone <repo-url>
cd <project-folder>
```

### 2️⃣ Instalar dependencias

```bash
npm install
```

### 3️⃣ Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://user:password@host:port/db"
NEXT_PUBLIC_API_URL="http://localhost:3001"

EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion

CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
```

---

## 🗄️ Migraciones con Prisma

### Crear migración inicial

```bash
npx prisma migrate dev --name init
```

### Generar Prisma Client

```bash
npx prisma generate
```

### Resetear base de datos (si se modifica el schema)

```bash
npx prisma migrate reset
```

### Visualizar base de datos

```bash
npx prisma studio
```

---

## 🚀 Ejecutar el Servidor

```bash
npm run dev
```

Servidor disponible en:

```bash
http://localhost:3001
```

---

## 🔐 Funcionalidades Implementadas

- Registro y login de usuarios
- Contraseñas hasheadas
- Verificación de email
- Control de acceso por roles
- Gestión de equipos y jugadores
- Registro de resultados de partidos
- Cálculo automático de estadísticas (KDA)
- Tabla de posiciones por torneo

---

## 🧠 Arquitectura del Proyecto

Estructura organizada en capas:

```bash
src/
 ├── controllers
 ├── services
 ├── routes
 ├── middlewares
 ├── prisma
 ├── server.ts
 └── index.ts
```

- **Controllers** → Manejo de requests y responses
- **Services** → Lógica de negocio
- **Middlewares** → Autenticación y autorización
- **Prisma** → Acceso a datos

---

## 🌍 Estado del Proyecto

Proyecto personal en desarrollo activo.
Actualmente desplegado en entorno gratuito y orientado a práctica profesional en backend y arquitectura de sistemas.
