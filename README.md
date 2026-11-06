# 📦 Sistema de Inventario

<div align="center">

<!-- Aquí puedes colocar el banner o GIF del proyecto -->

<img src="https://i.pinimg.com/1200x/d1/f2/55/d1f25502864c59ebb01e98e044c86a60.jpg" width="40%">

### 🗄️ Sistema de gestión y control de inventario

**Organizando • Administrando • Optimizando**

[![Python](https://img.shields.io/badge/Python-3.x-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?logo=supabase)](https://supabase.com/)

</div>

---

## 📋 Sobre el proyecto

**Sistema de Inventario** es un proyecto desarrollado como parte de la formación en Programación de Software.

Su propósito es desarrollar una aplicación que permita gestionar y controlar el inventario de productos, facilitando su administración mediante una API conectada a una base de datos.

El proyecto se desarrolla utilizando Python y FastAPI para el backend, PostgreSQL como sistema de gestión de bases de datos y Supabase como servicio de alojamiento de la base de datos.

## 🎯 Objetivos

- Gestionar los productos registrados en el inventario.
- Consultar y organizar productos por categorías.
- Administrar la información mediante operaciones CRUD.
- Implementar autenticación y gestión de usuarios.
- Mantener la información almacenada en una base de datos.
- Desarrollar una aplicación organizada y escalable.

## 🛠️ Tecnologías utilizadas

<div align="center">

<img src="https://skillicons.dev/icons?i=python,fastapi,postgresql,git,github,vscode" />

</div>

| Tecnología | Utilización |
|---|---|
| Python | Lenguaje de programación |
| FastAPI | Desarrollo de la API |
| Pydantic | Validación de datos |
| SQLAlchemy | Conexión y gestión de la base de datos |
| PostgreSQL | Sistema de base de datos |
| Supabase | Alojamiento de la base de datos |
| PyJWT | Autenticación mediante tokens |
| Git y GitHub | Control de versiones y trabajo colaborativo |

## 📂 Estructura del proyecto

```text
Proyecto-Final/
│
├── app/
│   ├── api/
│   │   └── routers/
│   │
│   ├── core/
│   │
│   ├── models/
│   │
│   ├── schemas/
│   │
│   ├── database/
│   │
│   └── main.py
│
├── crear_tablas.py
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

## ⚙️ Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/JDavidCF/Proyecto-Final.git
```

Entrar a la carpeta:

```bash
cd Proyecto-Final
```

### 2. Crear el entorno virtual

```bash
python -m venv venv
```

Activar el entorno virtual en Windows:

```bash
venv\Scripts\activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto, tomando como referencia el archivo `.env.example`.

Configurar las credenciales correspondientes de Supabase y la clave secreta para los tokens JWT.

**Importante:** No compartir ni subir el archivo `.env` al repositorio, ya que contiene información privada.

### 5. Ejecutar el proyecto

Desde la carpeta principal:

```bash
uvicorn app.main:app --reload
```

La API estará disponible en:

http://127.0.0.1:8000

## 📖 Documentación de la API

FastAPI proporciona documentación interactiva mediante Swagger UI.

Una vez iniciado el servidor, puedes acceder a:

- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc

Desde estas interfaces es posible consultar los endpoints disponibles, revisar los modelos de datos y probar las peticiones de la API.

## 🌿 Trabajo colaborativo

El desarrollo del proyecto se realiza mediante Git y GitHub, utilizando diferentes ramas para organizar el trabajo de los integrantes.

Repositorio: [JDavidCF/Proyecto-Final](https://github.com/JDavidCF/Proyecto-Final)

## 👨‍💻 Desarrollado por

Proyecto académico realizado por aprendices del programa Programación de Software.

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f0c29,50:302b63,100:24243e&height=100&section=footer"/>

</div>
