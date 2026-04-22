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


PRUEBAS Y DOCUMENTACION DEL SISTEMA 

METODO CREAR PRODUCTOS 

<img width="1919" height="1078" alt="Captura de pantalla 2026-04-22 163930" src="https://github.com/user-attachments/assets/46a05c4f-e2f5-4e92-bbfd-fb9f7019ead6" />

METODO OBTENER TODOS LOS PRODUCTOS 

<img width="1919" height="1076" alt="Captura de pantalla 2026-04-22 164141" src="https://github.com/user-attachments/assets/8ed0a2e5-092c-4dec-aa40-a7e825e4ed0c" />

METODO OBTENER PRODUCTOS ACTIVOS 

<img width="1919" height="1079" alt="Captura de pantalla 2026-04-22 164315" src="https://github.com/user-attachments/assets/fc12476b-f74a-43fc-a7b0-8204124fcdde" />

METODO BUSCAR POR ID 

<img width="1917" height="1078" alt="Captura de pantalla 2026-04-22 164355" src="https://github.com/user-attachments/assets/acb1b6a1-6bc3-4bec-a562-2f36c8abd26b" />

METODO BUSCAR POR NOMBRE 

<img width="1919" height="1077" alt="Captura de pantalla 2026-04-22 164503" src="https://github.com/user-attachments/assets/2dbb427b-1477-4273-b980-bbd461f33148" />


<img width="1919" height="1079" alt="Captura de pantalla 2026-04-22 164543" src="https://github.com/user-attachments/assets/4a8f7d20-2f0c-472a-b409-3b70e0f71f8b" />

METODO BUSCAR POR CATEGORIA 

<img width="1919" height="1079" alt="Captura de pantalla 2026-04-22 164619" src="https://github.com/user-attachments/assets/2054d2b5-a3f6-4688-8ee1-35ff4bc5060b" />

METODO ACTUALIZAR PRODUCTO 

<img width="1918" height="1079" alt="Captura de pantalla 2026-04-22 165133" src="https://github.com/user-attachments/assets/8d690e16-2342-4c68-84f0-ee660113b77f" />

METODO DESACTIVAR PRODUCTO 

<img width="1919" height="1079" alt="Captura de pantalla 2026-04-22 165323" src="https://github.com/user-attachments/assets/42259da0-3579-4c2e-a7e6-b18846a63c5e" />

METODO VERIFICAR PRODUCTO DESACTIVADO 

<img width="1913" height="1079" alt="Captura de pantalla 2026-04-22 165557" src="https://github.com/user-attachments/assets/16076930-f01f-4e47-9051-c00213ed512a" />

METODO ELIMINAR PRODUCTO 

<img width="1918" height="1079" alt="Captura de pantalla 2026-04-22 165647" src="https://github.com/user-attachments/assets/70ff14fd-2866-450b-9dbc-4a25280aa0d2" />




















