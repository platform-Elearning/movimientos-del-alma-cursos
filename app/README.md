# Movimientos del Alma

## Descripción General
La aplicación "Movimientos del Alma" es una plataforma web diseñada para la gestión de cursos y alumnos. La arquitectura de la aplicación sigue un enfoque modular y está basada en componentes reutilizables.

## Diagrama de Arquitectura
[Diagrama de Arquitectura](../Architecture/Architecture.excalidraw)

## Componentes Principales

### Frontend
- **React**: La interfaz de usuario está construida con React, lo que permite una experiencia de usuario dinámica y reactiva.
- **Vite**: Utilizado como el bundler y servidor de desarrollo para una configuración rápida y eficiente.
- **Axios**: Para realizar solicitudes HTTP a la API backend.

### Backend
- **Node.js**: El servidor backend está construido con Node.js.
- **Express**: Framework utilizado para manejar las rutas y middleware del servidor.
- **MongoDB**: Base de datos NoSQL utilizada para almacenar la información de los cursos y alumnos.


### Estructura de Directorios
```
app/
├── .dev
├── .env
├── .prod
├── src/
│   ├── api/
│   │   ├── alumnos.js
│   │   ├── auth.js
│   │   ├── cursos.js
│   │   ├── profesores.js
│   │   └── axiosInstances.js
│   ├── assets/
│   │   ├── images/
│   │   ├── styles/
│   ├── components/
│   │   ├── button/
│   │   │   └── Button.jsx
│   │   ├── formContacto/
│   │   │   └── FormContacto.jsx
│   │   ├── navbar/
│   │       └── Navbar.jsx
│   ├── main.css
│   ├── main.jsx
│   ├── pages/
│   │   ├── admin/
│   │   │   └── AdminPage.jsx
│   │   ├── alumnos/
│   │   │   └── AlumnosPage.jsx
│   │   ├── changePassword/
│   │   │   └── ChangePasswordPage.jsx
│   │   ├── index/
│   │   │   └── IndexPage.jsx
│   │   ├── login/
│   │   │   └── LoginPage.jsx
│   │   ├── olvideContraseña/
│   │       └── OlvideContraseñaPage.jsx
│   ├── router/
│   │   └── AppRouter.jsx
│   └── services/
│       └── AuthService.js
├── vite.config.js
```

## Flujo de Datos
1. **Usuario**: Interactúa con la interfaz de usuario en el navegador.
2. **Frontend (React)**:
    - Captura las interacciones del usuario (clics, formularios, etc.).
    - Realiza solicitudes HTTP a la API backend utilizando Axios.
    - Actualiza la interfaz de usuario en función de las respuestas del backend.
3. **Backend (Express)**:
    - Recibe las solicitudes HTTP del frontend.
    - Procesa las solicitudes, aplicando lógica de negocio y validaciones.
    - Realiza operaciones en la base de datos (lectura, escritura, actualización, eliminación).
    - Devuelve las respuestas al frontend con los datos solicitados o mensajes de error.
4. **Base de Datos (MongoDB)**:
    - Almacena y recupera datos según las solicitudes del backend.
    - Los datos incluyen información sobre cursos, alumnos, profesores, y autenticación de usuarios.
5. **Respuesta al Frontend**:
    - El backend envía la respuesta al frontend.
    - El frontend procesa la respuesta y actualiza la interfaz de usuario en consecuencia.
6. **Actualización de la Interfaz de Usuario**:
    - La interfaz de usuario se actualiza para reflejar los cambios realizados (nuevos datos, mensajes de error, etc.).
    - El usuario ve los resultados de sus acciones en tiempo real.

### Ejemplo de Flujo de Datos
1. **Inicio de Sesión**:
    - El usuario ingresa sus credenciales en el formulario de inicio de sesión.
    - El frontend envía una solicitud POST a `/api/auth/login` con las credenciales.
    - El backend valida las credenciales y, si son correctas, genera un token JWT.
    - El backend envía el token JWT al frontend.
    - El frontend almacena el token y redirige al usuario a la página principal.

2. **Visualización de Cursos**:
    - El usuario navega a la página de cursos.
    - El frontend envía una solicitud GET a `/api/cursos` para obtener la lista de cursos.
    - El backend consulta la base de datos y devuelve la lista de cursos.
    - El frontend recibe la lista y la muestra en la interfaz de usuario.

Este flujo de datos asegura que la aplicación sea reactiva y que los datos se manejen de manera eficiente entre el frontend y el backend.



## Patrones de Diseño

### MVC (Model-View-Controller)
La aplicación sigue el patrón MVC para separar las responsabilidades de la lógica de negocio, la interfaz de usuario y el control de flujo.
- **Model**: Representa los datos y la lógica de negocio. En este caso, los modelos están representados por los esquemas de MongoDB y las funciones que interactúan con la base de datos.
- **View**: Representa la interfaz de usuario. En esta aplicación, las vistas están construidas con componentes de React que renderizan la UI.
- **Controller**: Maneja la entrada del usuario y actualiza los modelos y las vistas. Los controladores están implementados en el backend con Express, manejando las rutas y las solicitudes HTTP.

### Componentes Reutilizables
Los componentes de React están diseñados para ser reutilizables y modulares.
- **Button**: Un componente de botón reutilizable que puede ser utilizado en diferentes partes de la aplicación.
- **FormContacto**: Un formulario de contacto reutilizable que puede ser integrado en varias páginas.
- **Navbar**: Un componente de barra de navegación que se utiliza en toda la aplicación para la navegación.

### Patrones de Diseño Adicionales

#### Singleton
- **Axios Instances**: Utiliza el patrón Singleton para crear una única instancia de Axios que se utiliza en toda la aplicación para realizar solicitudes HTTP.

#### Factory
- **Component Factories**: Se pueden utilizar fábricas de componentes para crear instancias de componentes dinámicamente según las necesidades de la aplicación.

#### Observer
- **State Management**: Utiliza el patrón Observer para la gestión del estado en React, donde los componentes observan los cambios en el estado y se actualizan automáticamente.

#### Dependency Injection
- **Servicios**: Los servicios como `AuthService` se inyectan en los componentes y controladores donde se necesitan, promoviendo la separación de preocupaciones y facilitando las pruebas unitarias.

### Ejemplos de Implementación

#### Componente Reutilizable: Button
~~~
// filepath: /src/components/button/Button.jsx
import React from 'react';


// filepath: /src/components/button/Button.jsx
import React from 'react';

const Button = ({ onClick, label }) => (
  <button onClick={onClick}>
    {label}
  </button>
);

export default Button;
~~~

Singleton: Axios Instance

~~~
// filepath: /src/api/axiosInstances.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
~~~
Estos patrones de diseño ayudan a mantener el código organizado, modular y fácil de mantener, permitiendo una escalabilidad y reutilización eficientes.

## Seguridad

### Autenticación y Autorización
- **JWT (JSON Web Tokens)**: Utilizamos tokens JWT para autenticar y autorizar a los usuarios. Los tokens se generan en el backend al iniciar sesión y se envían al frontend, donde se almacenan de forma segura (por ejemplo, en `localStorage` o `sessionStorage`).
- **Rutas Protegidas**: En el frontend, las rutas que requieren autenticación están protegidas mediante componentes de orden superior (HOC) o hooks que verifican la presencia de un token JWT válido antes de permitir el acceso.
- **Roles y Permisos**: Los usuarios pueden tener diferentes roles (por ejemplo, administrador, alumno, profesor) y permisos asociados. El backend verifica los roles y permisos antes de permitir el acceso a ciertos recursos o ejecutar ciertas acciones.

### Validación de Datos
- **Validación en el Frontend**: Antes de enviar datos al backend, se realizan validaciones en el frontend para asegurar que los datos ingresados por el usuario cumplen con los requisitos esperados (por ejemplo, formato de correo electrónico, longitud de la contraseña).
- **Validación en el Backend**: El backend realiza validaciones adicionales para asegurar que los datos recibidos son válidos y seguros. Esto incluye la validación de esquemas de datos utilizando bibliotecas como Joi o Mongoose para MongoDB.

### Protección contra Ataques Comunes
- **CSRF (Cross-Site Request Forgery)**: Implementamos tokens CSRF para proteger contra ataques de falsificación de solicitudes entre sitios. Estos tokens se generan en el backend y se envían al frontend, donde se incluyen en las solicitudes HTTP.
- **XSS (Cross-Site Scripting)**: Escapamos y sanitizamos todas las entradas del usuario para prevenir la inyección de scripts maliciosos. Utilizamos bibliotecas como DOMPurify para limpiar el HTML generado dinámicamente.
- **SQL Injection**: Aunque utilizamos MongoDB (NoSQL), seguimos las mejores prácticas para prevenir inyecciones, como el uso de consultas parametrizadas y la validación de datos.

### Seguridad en la Comunicación
- **HTTPS**: Todas las comunicaciones entre el frontend y el backend se realizan a través de HTTPS para asegurar que los datos transmitidos estén cifrados y protegidos contra interceptaciones.
- **CORS (Cross-Origin Resource Sharing)**: Configuramos políticas CORS en el backend para controlar qué dominios pueden acceder a los recursos de la API, previniendo accesos no autorizados desde orígenes no confiables.

### Gestión de Sesiones
- **Expiración de Tokens**: Los tokens JWT tienen una fecha de expiración para limitar el tiempo de validez de una sesión. Los usuarios deben volver a autenticarse después de que el token expire.
- **Revocación de Tokens**: Implementamos mecanismos para revocar tokens en caso de que se detecte un uso indebido o si un usuario cierra sesión manualmente.

### Auditoría y Monitoreo
- **Logs de Seguridad**: Registramos eventos de seguridad importantes, como intentos de inicio de sesión fallidos, cambios de contraseña y accesos a recursos protegidos.
- **Monitoreo de Actividades**: Utilizamos herramientas de monitoreo para detectar y responder a actividades sospechosas en tiempo real.

Estas medidas de seguridad ayudan a proteger la aplicación y los datos de los usuarios contra una variedad de amenazas y vulnerabilidades.


## Escalabilidad

### Microservicios
- **Separación de Servicios**: La arquitectura está diseñada para ser escalable mediante la separación de servicios en microservicios independientes. Cada microservicio maneja una funcionalidad específica (por ejemplo, gestión de usuarios, gestión de cursos) y puede ser desarrollado, desplegado y escalado de manera independiente.
- **Comunicación entre Microservicios**: Los microservicios se comunican entre sí utilizando APIs RESTful o mensajería asíncrona (por ejemplo, RabbitMQ, Kafka), lo que permite una integración flexible y desacoplada.

### Balanceo de Carga
- **Distribución del Tráfico**: Se puede implementar un balanceador de carga (por ejemplo, Nginx, HAProxy) para distribuir el tráfico entre múltiples instancias del servidor backend. Esto asegura que ninguna instancia individual se sobrecargue y mejora la disponibilidad y la capacidad de respuesta de la aplicación.
- **Autoescalado**: Utilizando plataformas de orquestación de contenedores como Kubernetes, se puede configurar el autoescalado para ajustar automáticamente el número de instancias de los microservicios en función de la carga de trabajo.

### Almacenamiento de Datos
- **Replica Sets en MongoDB**: MongoDB permite la configuración de conjuntos de réplicas (Replica Sets) para asegurar la alta disponibilidad y la redundancia de los datos. Esto permite que la base de datos escale horizontalmente y maneje un mayor volumen de solicitudes.
- **Sharding**: MongoDB también soporta el sharding, que permite dividir los datos en múltiples fragmentos distribuidos en diferentes servidores. Esto mejora el rendimiento y la capacidad de almacenamiento de la base de datos.

### Caché
- **Caché en Memoria**: Implementar una capa de caché en memoria (por ejemplo, Redis, Memcached) para almacenar temporalmente los datos más solicitados. Esto reduce la carga en la base de datos y mejora el tiempo de respuesta de la aplicación.
- **CDN (Content Delivery Network)**: Utilizar una CDN para distribuir el contenido estático (imágenes, archivos CSS y JavaScript) a través de múltiples servidores ubicados geográficamente. Esto mejora la velocidad de carga y la experiencia del usuario.

### Despliegue y Entrega Continua
- **CI/CD (Integración Continua/Entrega Continua)**: Configurar pipelines de CI/CD para automatizar el proceso de construcción, prueba y despliegue de la aplicación. Esto permite realizar despliegues frecuentes y confiables, facilitando la escalabilidad y el mantenimiento de la aplicación.
- **Contenedores y Orquestación**: Utilizar contenedores (por ejemplo, Docker) para empaquetar la aplicación y sus dependencias. Herramientas de orquestación como Kubernetes permiten gestionar y escalar los contenedores de manera eficiente.

### Monitoreo y Alertas
- **Monitoreo en Tiempo Real**: Implementar herramientas de monitoreo (por ejemplo, Prometheus, Grafana) para supervisar el rendimiento y la salud de la aplicación en tiempo real. Esto permite identificar y resolver problemas rápidamente.
- **Alertas Proactivas**: Configurar alertas proactivas para notificar al equipo de desarrollo y operaciones sobre cualquier anomalía o problema de rendimiento, permitiendo una respuesta rápida y efectiva.

Estas estrategias y herramientas permiten que la aplicación "Movimientos del Alma" escale de manera eficiente, manejando un mayor volumen de usuarios y datos sin comprometer el rendimiento o la disponibilidad.

## Conclusión
La arquitectura de "Movimientos del Alma" está diseñada para ser modular, escalable y segura, permitiendo una fácil expansión y mantenimiento a medida que la aplicación crece. 

### Resumen de la Arquitectura:
- **Modularidad**: La aplicación está dividida en componentes reutilizables y microservicios independientes, lo que facilita el desarrollo y la gestión del código.
- **Escalabilidad**: Utiliza técnicas como el balanceo de carga, autoescalado, sharding y caché para manejar un mayor volumen de usuarios y datos sin comprometer el rendimiento.
- **Seguridad**: Implementa medidas robustas de seguridad, incluyendo autenticación y autorización con JWT, validación de datos, protección contra ataques comunes y comunicación segura a través de HTTPS.
- **Patrones de Diseño**: Sigue patrones de diseño como MVC, Singleton, Factory y Observer para mantener el código organizado y fácil de mantener.
- **Monitoreo y Alertas**: Utiliza herramientas de monitoreo y alertas proactivas para asegurar el rendimiento y la disponibilidad de la aplicación en todo momento.

Estas características aseguran que "Movimientos del Alma" pueda crecer y adaptarse a las necesidades cambiantes de los usuarios, proporcionando una plataforma confiable y eficiente para la gestión de cursos y alumnos.