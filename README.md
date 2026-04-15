# Backend - Sistema de Papelería

Este es el backend de mi proyecto de papelería.
Aquí es donde manejo la lógica del sistema y todo lo relacionado con los productos.

---

## Tecnologías que usé

* Java
* Spring Boot
* Maven
* Base de datos (MySQL)

---

## ¿Para qué sirve?

Este backend permite:

* Crear productos
* Ver productos
* Editar productos
* Eliminar productos

También se encarga de conectar con el frontend para mostrar la información.

---

## Estructura del proyecto

El proyecto está organizado en varias carpetas:

* controller → donde están las rutas
* service → donde está la lógica
* repository → conexión con la base de datos
* entity → modelos de datos
* dto → datos que se envían

---

## ¿Cómo ejecutarlo?

1. Abrir el proyecto en un IDE (como IntelliJ o VS Code)
2. Ir al archivo principal del proyecto
3. Ejecutar la aplicación

También se puede ejecutar con:

```
./mvnw spring-boot:run
```

---

## Base de datos

La configuración está en el archivo:

```
application.properties
```

Ahí se define la conexión a la base de datos.

---

## Endpoints

El sistema tiene endpoints para manejar productos, por ejemplo:

* GET /productos
* POST /productos
* PUT /productos/{id}
* DELETE /productos/{id}

---

## Autor

Alejx06

---

## Nota

Este proyecto fue hecho como parte de un trabajo académico sobre un sistema de papelería.
