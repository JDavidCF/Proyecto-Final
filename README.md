# 📦 StockNova — Sistema de Gestión de Inventario

<div align="center">

<!-- Banner principal del proyecto -->
<img src="https://i.pinimg.com/1200x/d1/f2/55/d1f25502864c59ebb01e98e044c86a60.jpg" width="40%">

### 🗄️ Gestión, administración y control inteligente de inventario

*Organizando • Administrando • Optimizando*

[![Python](https://img.shields.io/badge/Python-3.x-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Frontend-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styles-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## 📋 Sobre el proyecto

*StockNova* es una aplicación web de gestión y control de inventario desarrollada como proyecto final del programa Técnico en Programación de Software.

Su propósito es facilitar la administración de inventarios mediante una plataforma que centraliza la gestión de productos, usuarios, ventas, pedidos y movimientos de inventario, proporcionando información organizada y herramientas para mejorar el control de las operaciones.

La aplicación cuenta con una arquitectura dividida en dos partes principales:

- *Backend:* API REST desarrollada con Python y FastAPI, encargada de la lógica del sistema, autenticación, permisos y comunicación con la base de datos.
- *Frontend:* Interfaz web desarrollada con React y TypeScript, diseñada para ofrecer una experiencia moderna, intuitiva y adaptable.

La información se almacena en PostgreSQL mediante Supabase, mientras que SQLAlchemy y Alembic permiten gestionar los modelos y las migraciones de la base de datos.

## 🎯 Objetivos del proyecto

- Centralizar la administración de productos y existencias.
- Facilitar el registro y seguimiento de ventas.
- Gestionar pedidos y sus respectivos estados.
- Controlar las entradas y ajustes del inventario.
- Implementar autenticación segura y permisos según el rol del usuario.
- Presentar estadísticas e información relevante para la toma de decisiones.
- Incorporar herramientas inteligentes de asistencia mediante inteligencia artificial.
- Desarrollar una plataforma organizada, escalable y de fácil utilización.

## ✨ Funcionalidades principales

| Módulo | Descripción |
|---|---|
| 📊 Dashboard | Resumen general de las operaciones del inventario. |
| 📦 Productos | Registro, consulta, actualización y eliminación de productos. |
| 👥 Usuarios | Administración de usuarios y asignación de roles. |
| 🛒 Ventas | Registro de ventas y actualización automática de existencias. |
| 📋 Pedidos | Gestión y seguimiento de pedidos. |
| 🔄 Movimientos | Control de entradas y ajustes de inventario. |
| 📈 Estadísticas | Visualización de indicadores, ventas y productos más vendidos. |
| 🤖 Asistente IA | Asistente integrado para orientar al usuario sobre el funcionamiento de StockNova. |

### 🔐 Seguridad y permisos

El sistema incorpora autenticación mediante JWT y protección de contraseñas mediante Bcrypt.

Cuenta con tres roles principales:

- *Administrador:* acceso a las funciones administrativas y gestión del sistema.
- *Empleado:* acceso a las operaciones de inventario y gestión permitidas.
- *Cliente:* consulta de productos y gestión de pedidos.

Los permisos se validan desde el backend para proteger las operaciones y restringir el acceso según el rol correspondiente.

### 🎨 Interfaz y experiencia de usuario

El frontend incorpora diferentes elementos para mejorar la interacción con la plataforma:

- Diseño adaptable y moderno.
- Modo claro y oscuro.
- Componentes y animaciones interactivas.
- Gráficas para la visualización de estadísticas.
- Controles de accesibilidad.
- Selector de idioma.
- Asistente integrado.
- Dictado por voz cuando el navegador lo permite.

## 🛠️ Tecnologías utilizadas

<div align="center">

<img src="https://skillicons.dev/icons?i=python,fastapi,react,typescript,tailwind,postgres,supabase,vite,git,github,vscode" />

</div>

### Backend

| Tecnología | Utilización |
|---|---|
| Python | Lenguaje principal del backend. |
| FastAPI | Desarrollo de la API REST. |
| Pydantic | Validación y estructuración de datos. |
| SQLAlchemy | ORM y gestión de la base de datos. |
| PostgreSQL | Sistema de gestión de bases de datos. |
| Supabase | Servicio de alojamiento de PostgreSQL. |
| Alembic | Control de migraciones de la base de datos. |
| PyJWT | Autenticación mediante tokens JWT. |
| Bcrypt | Protección de contraseñas. |
| Gemini API | Servicio de inteligencia artificial del asistente. |

### Frontend

| Tecnología | Utilización |
|---|---|
| React | Construcción de interfaces y componentes. |
| TypeScript | Desarrollo con tipado estático. |
| Tailwind CSS | Diseño y estilos de la aplicación. |
| Vite | Herramienta de desarrollo y compilación. |
| Axios | Comunicación con la API REST. |
| React Router | Navegación entre páginas. |
| Recharts | Visualización de estadísticas y gráficas. |
| GSAP | Animaciones e interacciones visuales. |
| Motion | Animaciones de componentes e interfaz. |
| Lucide React | Iconografía de la aplicación. |

### Herramientas adicionales

- Git y GitHub: control de versiones y trabajo colaborativo.
- Visual Studio Code: entorno de desarrollo.
- Postman / Swagger UI: pruebas y documentación de la API.
- pytest: ejecución de pruebas automatizadas.

## 📂 Estructura del proyecto

text
Proyecto-Final/
│
├── app/
│   ├── api/
│   │   └── routers/
│   │       ├── asistente.py
│   │       ├── estadisticas.py
│   │       ├── movimientos.py
│   │       ├── pedidos.py
│   │       ├── productos.py
│   │       ├── usuarios.py
│   │       └── ventas.py
│   │
│   ├── core/
│   │   ├── dependencies.py
│   │   └── security.py
│   │
│   ├── database/
│   │   ├── base.py
│   │   └── connection.py
│   │
│   ├── models/
│   │   ├── detalle_pedido.py
│   │   ├── movimiento.py
│   │   ├── pedido.py
│   │   ├── producto.py
│   │   ├── rol.py
│   │   ├── usuario.py
│   │   └── venta.py
│   │
│   ├── schemas/
│   │   ├── movimiento.py
│   │   ├── pedido.py
│   │   ├── producto.py
│   │   ├── usuario.py
│   │   └── venta.py
│   │
│   └── main.py
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
├── migrations/
│   ├── versions/
│   └── env.py
│
├── tests/
│   └── test_asistente.py
│
├── alembic.ini
├── crear_tablas.py
├── requirements.txt
├── test.http
├── .env.example
├── .gitignore
└── README.md


## ⚙️ Instalación y configuración

### 1. Clonar el repositorio

bash
git clone https://github.com/JDavidCF/Proyecto-Final.git


Entrar a la carpeta:

bash
cd Proyecto-Final


### 2. Configurar el backend

Crear un entorno virtual:

bash
python -m venv venv


Activarlo en Windows:

powershell
venv\Scripts\activate


Instalar las dependencias:

bash
pip install -r requirements.txt


### 3. Configurar las variables de entorno del backend

Crear un archivo .env en la raíz del proyecto, tomando como referencia .env.example.

Configurar las siguientes variables:

dotenv
# Base de datos Supabase
user=
password=
host=
port=5432
dbname=

# Seguridad JWT
JWT_SECRET_KEY=

# Asistente Gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash-lite


Completar los datos correspondientes con las credenciales de la base de datos y las claves necesarias.

La clave de Gemini es necesaria para habilitar las respuestas del asistente. La variable GEMINI_MODEL es opcional.

*Importante:* nunca compartir ni subir el archivo .env al repositorio, ya que contiene información privada.

### 4. Ejecutar las migraciones

Desde la raíz del proyecto, ejecutar:

bash
alembic upgrade head


Este comando aplica las migraciones disponibles y actualiza la estructura de la base de datos.

### 5. Iniciar el backend

Ejecutar:

bash
uvicorn app.main:app --reload


La API estará disponible en:

http://127.0.0.1:8000

### 6. Configurar el frontend

Abrir una segunda terminal y entrar en la carpeta:

bash
cd frontend


Instalar las dependencias:

bash
npm install


Crear un archivo .env tomando como referencia frontend/.env.example.

Configurar la dirección del backend:

dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000


### 7. Iniciar el frontend

Ejecutar:

bash
npm run dev


Vite mostrará la dirección local de la aplicación. Normalmente estará disponible en:

http://localhost:5173

*Nota:* el backend y el frontend deben estar ejecutándose simultáneamente para que la aplicación funcione correctamente.

## 🧪 Pruebas y compilación

### Backend

Desde la raíz del proyecto:

bash
pytest


### Frontend

Desde la carpeta frontend/, comprobar los tipos de TypeScript:

bash
npm run lint


Generar la versión de producción:

bash
npm run build


## 📖 Documentación de la API

FastAPI proporciona documentación interactiva mediante Swagger UI y ReDoc.

Una vez iniciado el backend, puedes acceder a:

- *Swagger UI:* http://127.0.0.1:8000/docs
- *ReDoc:* http://127.0.0.1:8000/redoc

Estas herramientas permiten consultar los endpoints disponibles, revisar los modelos de datos y realizar pruebas directamente sobre la API.

## 🌿 Trabajo colaborativo

El desarrollo del proyecto se organiza mediante Git y GitHub, utilizando ramas para distribuir el trabajo y Pull Requests para integrar los cambios.

*Repositorio oficial:*

[JDavidCF/Proyecto-Final](https://github.com/JDavidCF/Proyecto-Final)

## 👨‍💻 Desarrollado por

Proyecto académico realizado por aprendices del programa *Técnico en Programación de Software – SENA*.

*StockNova — Organizando, Administrando y Optimizando.*

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f0c29,50:302b63,100:24243e&height=120&section=footer"/>

</div>
