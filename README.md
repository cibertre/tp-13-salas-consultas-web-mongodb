# Trabajo práctico 13 - Reservas de salas: búsqueda y consultas web con MongoDB

Esta es una actualización de la aplicación de reservas de salas de estudio que venía desarrollando en los TP 06, 07, 08, 09, 10, 11 y 12.

En los trabajos anteriores incorporé las operaciones del CRUD, la conexión con MongoDB Atlas, las consultas con filtros, ordenamiento y paginación desde la API, y las operaciones para crear, consultar, editar y eliminar reservas desde la interfaz HTML.

En esta entrega amplié las consultas para permitir buscar reservas por fragmentos del nombre del estudiante, filtrar por sala, ordenar los resultados y recorrerlos mediante paginación desde el sitio web y desde un nuevo endpoint de la API.

También incorporé criterios compartidos para las consultas web y API, validaciones de los parámetros recibidos y protección para que los caracteres especiales ingresados en la búsqueda se interpreten como texto literal y no como expresiones regulares.

Las reservas siguen guardándose en MongoDB Atlas, por lo que no se pierden cuando reinicio el servidor. Tanto el sitio HTML como la API utilizan el mismo servicio y trabajan sobre los mismos documentos.

Hecho con Node.js, Express 5, EJS y Mongoose.

**Alumno:** Renato G. Trentini.

---

## 1. Inicio del proyecto

- Arranqué desde el proyecto del TP 12, que ya tenía las operaciones del CRUD, la conexión con MongoDB Atlas y la aplicación web completa.
- Mantuve la estructura general de carpetas y la separación entre rutas, controladores, servicios y modelos.
- Conservé las operaciones anteriores para crear, consultar, modificar y eliminar reservas desde la API.
- Mantuve el listado, el detalle, los formularios de creación y edición, el cambio parcial de estado y la eliminación con confirmación desde el sitio HTML.
- Incorporé la búsqueda por fragmento del nombre del estudiante.
- Incorporé el filtro exacto por sala.
- Incorporé el ordenamiento por estudiante o por cantidad de personas.
- Amplié la consulta con paginación tanto para el sitio web como para la API.
- Incorporé un módulo compartido para leer y validar los criterios de consulta.
- Incorporé el escape de caracteres especiales para que la búsqueda interprete los valores ingresados como texto literal.
- Mantuve la conexión con MongoDB Atlas y la persistencia de los documentos.

No se incluyen en la entrega el historial de Git, la carpeta `node_modules` ni el archivo `.env`.

## 2. Versiones

Las dependencias utilizadas en el proyecto son las siguientes:

| Herramienta | Versión declarada |
|---|---|
| Node.js | v22.16.0 |
| Express | ^5.2.1 |
| Mongoose | ^9.11.2 |
| EJS | ^6.0.1 |
| express-ejs-layouts | ^2.5.1 |
| morgan | ^1.12.1 |
| dotenv | ^18.0.9 |
| ESLint | ^10.12.0 |
| @eslint/js | ^10.0.1 |
| Prettier | ^3.9.10 |

Las dependencias están declaradas en `package.json`. Las versiones exactas instaladas quedan registradas en `package-lock.json`.

El proyecto utiliza **CommonJS**, mediante `require` y `module.exports`.

## 3. Preparar MongoDB Atlas

1. Utilizo un cluster gratuito M0 en MongoDB Atlas.
2. Tengo configurado un usuario de base de datos para conectarme.
3. En Network Access está autorizada la IP desde la que me conecto.
4. La base de datos utilizada para este trabajo se llama `reservas_salas_u13`.
5. La colección se llama `reservas`.
6. La colección se crea automáticamente cuando se guarda el primer documento.

El sitio y la API trabajan sobre esta misma base de datos. Por eso, una modificación realizada desde el navegador también puede consultarse desde Postman, y viceversa.

Para las pruebas de consulta se utilizaron seis reservas ficticias:

| Estudiante | Sala | Personas |
|---|---|---:|
| Ana Alba | Sala Norte | 1 |
| Ana Berta | Sala Norte | 2 |
| Ana Clara | Sala Norte | 3 |
| Ana Diana | Sala Sur | 4 |
| Bruno Ejemplo | Sala Norte | 2 |
| Carla (A+B) | Sala Sur | 1 |

Estos registros permiten comprobar las búsquedas, los filtros, el ordenamiento y la paginación.

## 4. Variables de entorno y DNS

El archivo `.env` contiene los datos reales de conexión y no debe subirse al repositorio.

El proyecto incluye una plantilla `.env.example` con la siguiente estructura:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<USUARIO>:<CLAVE>@<CLUSTER>/reservas_salas_u13?retryWrites=true&w=majority
```

- `PORT=3000`: indica el puerto en el que se inicia la aplicación.
- `NODE_ENV=development`: establece el entorno de desarrollo.
- `MONGODB_URI`: contiene la dirección de conexión con MongoDB Atlas.
- `reservas_salas_u13`: identifica la base de datos utilizada en este trabajo.
- Los valores `<USUARIO>`, `<CLAVE>` y `<CLUSTER>` son marcadores que deben reemplazarse por los datos reales de cada conexión.

Para preparar el entorno se copia `.env.example` y se completa con la URI correspondiente.

La corrección de DNS está en `src/config/base-datos.js`, donde se utilizan los servidores `8.8.8.8` y `1.1.1.1`, como en los trabajos anteriores.

Esta configuración permite resolver la dirección `mongodb+srv` de Atlas.

El archivo `.env` contiene la URI real y debe mantenerse privado.

## 5. Cómo iniciar la aplicación

Primero hay que instalar las dependencias:

```bash
npm install
```

Para iniciar el servidor en el entorno local utilizo:

```bash
npm run start:local
```

Este comando ejecuta:

```bash
node --env-file=.env src/index.js
```

Es importante utilizar `start:local` porque carga las variables del archivo `.env` antes de iniciar la aplicación.

En cambio, `npm start` ejecuta:

```bash
node src/index.js
```

Este último comando no carga automáticamente el archivo `.env`. Por eso, para el desarrollo local utilizo `npm run start:local`.

Después se abre:

```text
http://localhost:3000
```

El arranque se realiza en este orden:

1. Lee la configuración del entorno.
2. Intenta conectarse con MongoDB Atlas.
3. Espera a que la conexión se establezca.
4. Recién después inicia el servidor y abre el puerto.

Si falta la URI o falla la conexión, muestra el error y no inicia el servidor.

Cuando se cierra la aplicación con Ctrl+C (`SIGINT`) o mediante `SIGTERM`, se cierra el servidor y después la conexión con MongoDB.

## 6. Cómo está organizado el proyecto

```text
src/
  config/          configuración del entorno y conexión a MongoDB
  modelos/         esquema de Mongoose
  servicios/       operaciones con MongoDB y criterios de consulta
  controladores/   reciben las solicitudes y preparan las respuestas
  rutas/           rutas HTML y rutas de la API
  middlewares/     validaciones y manejo de solicitudes
  views/           vistas EJS
  app.js           configuración de Express
  index.js         conexión y arranque del servidor

scripts/            programas para probar desde la terminal
public/             archivos públicos, como CSS
```

La idea es mantener separadas las responsabilidades:

- El modelo define cómo es una reserva y sus validaciones.
- El servicio se comunica con MongoDB y realiza las operaciones de consulta, creación, modificación y eliminación.
- El módulo `criterios-reservas.js` interpreta y valida los parámetros utilizados en las consultas.
- Los controladores reciben las solicitudes y devuelven la respuesta correspondiente.
- Las rutas conectan las direcciones con sus controladores.
- Los middlewares validan los datos antes de que lleguen al servicio y permiten centralizar el tratamiento de errores.
- Las vistas EJS muestran los resultados y los controles de búsqueda y paginación.

Tanto las rutas HTML como las rutas de la API utilizan el mismo servicio de reservas. De esta manera, no se duplica la lógica de acceso a MongoDB ni se realizan solicitudes HTTP desde el sitio a la propia API.

### Comandos disponibles

Los comandos definidos en el `package.json` son:

| Comando | Qué hace |
|---|---|
| `npm start` | Inicia la aplicación sin cargar automáticamente el `.env` |
| `npm run start:local` | Inicia la aplicación cargando el `.env` |
| `npm run comprobardb` | Comprueba la conexión con MongoDB |
| `npm run validar` | Ejecuta el script de validación de una reserva |
| `npm run crear` | Ejecuta el script para crear una reserva |
| `npm run listar` | Ejecuta el script para listar reservas |
| `npm run format` | Aplica Prettier sobre `src` y `scripts` |
| `npm run format:check` | Comprueba el formato |
| `npm run lint` | Ejecuta ESLint |
| `npm run check` | Ejecuta la comprobación de formato y ESLint |

## 7. Modelo de reserva

Los campos de una reserva son:

| Campo | Regla |
|---|---|
| estudiante | Texto obligatorio, con espacios exteriores eliminados |
| email | Texto obligatorio, debe contener `@` |
| sala | `Sala Norte`, `Sala Sur` o `Sala Multimedia` |
| fecha | Texto obligatorio |
| turno | `Mañana`, `Tarde` o `Noche` |
| personas | Número entero entre 1 y 6 |
| estado | `pendiente` o `confirmada` |

El estado tiene un valor predeterminado: `pendiente`.

### Diferencia entre crear y modificar

Para crear una reserva mediante POST, el cliente solamente puede enviar los seis campos originales:

- estudiante
- email
- sala
- fecha
- turno
- personas

No puede enviar `estado` ni `_id`. Si intenta agregar alguno de esos campos, la solicitud se rechaza con código 400.

El estado se asigna automáticamente como `pendiente` desde el modelo.

En cambio, para reemplazar una reserva mediante PUT se deben enviar los siete campos, incluido `estado`.

Para PATCH solamente se permiten los campos `personas` y `estado`. Se puede enviar uno o los dos, pero no se aceptan otros campos.

El servicio no pasa directamente `req.body` a Mongoose. Utiliza los campos que fueron validados y preparados por los middlewares o por el controlador.

También se rechazan datos ausentes, campos no permitidos y valores incorrectos para `personas`, como booleanos, arreglos u objetos.

Además de las validaciones del middleware, el modelo de Mongoose también tiene sus propias validaciones.

Ejemplo de una reserva (datos ficticios):

```json
{
  "id": "65f0c0ffee0123456789abcd",
  "estudiante": "Ana Ejemplo",
  "email": "ana@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-11-18",
  "turno": "Mañana",
  "personas": 2,
  "estado": "pendiente"
}
```

El `id` es un texto que sale del `_id` de MongoDB. No se convierte a número.

## 8. Consultas, búsqueda, filtros y paginación

En esta entrega amplié las consultas que ya existían en el TP 10.

Ahora se pueden realizar búsquedas desde el sitio web y desde un endpoint específico de la API.

Las dos entradas utilizan los mismos criterios y el mismo servicio de búsqueda.

La consulta permite:

- Buscar reservas por un fragmento del nombre del estudiante.
- Filtrar por el nombre exacto de la sala.
- Ordenar por estudiante.
- Ordenar por cantidad de personas de menor a mayor.
- Ordenar por cantidad de personas de mayor a menor.
- Consultar una página determinada.
- Establecer cuántas reservas se muestran por página.
- Conocer la cantidad total de reservas que coinciden con los filtros.
- Calcular cuántas páginas se necesitan.

### Parámetros permitidos

| Parámetro | Función |
|---|---|
| `q` | Busca un fragmento del nombre del estudiante |
| `sala` | Filtra por coincidencia exacta del nombre de la sala |
| `orden` | Indica cómo se ordenan los resultados |
| `pagina` | Indica qué página se quiere consultar |
| `limite` | Indica cuántas reservas se muestran por página |

### Búsqueda por nombre: parámetro `q`

El parámetro `q` permite buscar una parte del nombre del estudiante.

Por ejemplo:

```text
GET /api/reservas/consulta?q=ana
```

La búsqueda encuentra los nombres que contienen ese fragmento, sin distinguir entre mayúsculas y minúsculas.

El texto se recorta con `trim()` para eliminar espacios al principio y al final.

El máximo permitido es de 60 caracteres.

Si el parámetro está vacío, no se aplica ningún filtro por nombre.

La búsqueda no elimina ni ignora las tildes.

### Filtro exacto por sala

El parámetro `sala` permite filtrar por el nombre exacto de la sala.

Por ejemplo:

```text
GET /api/reservas/consulta?sala=Sala%20Norte
```

Se eliminan los espacios exteriores con `trim()` y se compara el valor completo de la sala.

El máximo permitido es de 80 caracteres.

Si el parámetro está vacío, no se aplica el filtro por sala.

### Ordenamiento

Los valores permitidos para `orden` son:

- `estudiante`: ordena por nombre del estudiante.
- `personas-asc`: ordena por cantidad de personas de menor a mayor.
- `personas-desc`: ordena por cantidad de personas de mayor a menor.

En los tres casos se utiliza `_id` como segundo criterio de ordenamiento para resolver los empates de manera estable.

El valor predeterminado es `estudiante`.

Un valor vacío o diferente de las opciones permitidas se considera inválido.

### Paginación

Los valores predeterminados son:

- Página: `1`.
- Límite: `2`.

Las validaciones permiten:

- Página: entero entre 1 y 1000.
- Límite: entero entre 1 y 20.

La cantidad de páginas se calcula mediante:

```js
Math.ceil(total / limite)
```

Para obtener los registros correspondientes a una página se utiliza el desplazamiento:

```js
(pagina - 1) * limite
```

### Validaciones de los parámetros

El módulo compartido `criterios-reservas.js` se encarga de interpretar y validar los criterios recibidos.

Se controla que:

- Solamente se acepten los parámetros `q`, `sala`, `orden`, `pagina` y `limite`.
- Los parámetros no estén repetidos.
- Los valores recibidos sean textos únicos.
- No se acepten parámetros desconocidos.
- El texto de búsqueda no supere los 60 caracteres.
- La sala no supere los 80 caracteres.
- El orden corresponda a uno de los valores permitidos.
- La página sea un entero entre 1 y 1000.
- El límite sea un entero entre 1 y 20.

Si alguna de estas condiciones no se cumple, la API responde con código 400 y un mensaje de error en formato JSON. Desde el sitio HTML se muestra la respuesta de error correspondiente.

### Protección de la búsqueda literal

Como el parámetro `q` se utiliza para buscar mediante una expresión regular, es necesario escapar los caracteres especiales.

Por ejemplo, los caracteres `+`, `[`, `]`, `.` y `*` pueden tener un significado especial dentro de una expresión regular.

La función `escaparRegex()` permite que esos caracteres se interpreten como texto literal.

De esta manera, una búsqueda como `A+B` encuentra el nombre que contiene exactamente `A+B`, en lugar de interpretar el signo `+` como un operador.

También se evita que el usuario pueda introducir operadores de MongoDB desde los parámetros de la URL.

### Ejemplo de consulta combinada

```text
GET http://localhost:3000/api/reservas/consulta?q=ana&sala=Sala%20Norte&orden=personas-asc&pagina=1&limite=2
```

En este caso se buscan los estudiantes cuyo nombre contiene `ana`, se filtra por `Sala Norte`, se ordena por cantidad de personas de menor a mayor y se muestran los primeros dos resultados.

### Respuesta de la consulta

La respuesta devuelve un objeto con cinco propiedades:

```json
{
  "datos": [
    {
      "id": "6b057f90cb444c40066050fd",
      "estudiante": "Ana Alba",
      "email": "ana.alba@example.com",
      "sala": "Sala Norte",
      "fecha": "2026-11-18",
      "turno": "Mañana",
      "personas": 1,
      "estado": "pendiente"
    },
    {
      "id": "6b057fb7cb444c40066050fe",
      "estudiante": "Ana Berta",
      "email": "ana.berta@example.com",
      "sala": "Sala Norte",
      "fecha": "2026-11-18",
      "turno": "Mañana",
      "personas": 2,
      "estado": "pendiente"
    }
  ],
  "pagina": 1,
  "limite": 2,
  "total": 3,
  "paginas": 2
}
```

Las propiedades significan lo siguiente:

- `datos`: contiene las reservas correspondientes a la página solicitada.
- `pagina`: indica la página actual.
- `limite`: indica cuántos resultados se muestran por página.
- `total`: indica la cantidad total de reservas que cumplen los filtros.
- `paginas`: indica la cantidad total de páginas.

Para calcular el total se utiliza `countDocuments()` con el filtro correspondiente.

Para recuperar los documentos se utiliza `find()`, junto con `sort()`, `skip()` y `limit()`.

El conteo se realiza sin aplicar la paginación. Esto permite conocer cuántos documentos coinciden con los criterios, aunque la página solicitada no contenga resultados.

### Páginas sin resultados

Se contemplan dos situaciones diferentes:

1. Cuando no existen reservas que coincidan con los criterios, la consulta responde con código 200, `total: 0`, `paginas: 0` y `datos: []`.
2. Cuando existen coincidencias, pero se solicita una página superior a la cantidad disponible, la consulta también responde con código 200 y conserva el total real, pero devuelve `datos: []`.

Desde el sitio web se muestran mensajes diferentes para distinguir ambos casos.

Cuando la página solicitada está fuera de los resultados, se ofrece un enlace para volver a la primera página conservando los criterios de búsqueda.

### Navegación desde el sitio HTML

El formulario de búsqueda permite ingresar:

- Fragmento del nombre del estudiante.
- Sala.
- Criterio de ordenamiento.
- Cantidad de reservas por página.

Al realizar una nueva búsqueda, la página vuelve a la primera.

Los enlaces Anterior y Siguiente conservan los criterios de búsqueda, el filtro, el orden y el límite seleccionado.

El botón Limpiar permite volver al listado sin filtros y con los valores predeterminados.

## 9. Endpoints

### API JSON

Se mantienen los endpoints incorporados en los trabajos anteriores y se agrega una nueva ruta de consulta:

| Método y dirección | Resultado |
|---|---|
| `GET /api/reservas` | Lista las reservas con la consulta anterior y su paginación |
| `GET /api/reservas/consulta` | Busca y filtra reservas con los criterios del TP 13 |
| `GET /api/reservas/estado` | Devuelve la cantidad total de reservas |
| `GET /api/reservas/:id` | Busca una reserva por su ID |
| `POST /api/reservas` | Crea una reserva |
| `PUT /api/reservas/:id` | Reemplaza todos los campos permitidos de una reserva |
| `PATCH /api/reservas/:id` | Modifica `personas`, `estado` o ambos |
| `DELETE /api/reservas/:id` | Elimina físicamente una reserva |

La nueva ruta `/consulta` se registra antes de la ruta dinámica `/:id`, para evitar que Express interprete la palabra `consulta` como un identificador.

La ruta anterior `GET /api/reservas` conserva su funcionamiento y su contrato. La nueva búsqueda se realiza mediante `GET /api/reservas/consulta`.

### Ejemplos de consulta desde la API

Consulta sin parámetros:

```text
GET http://localhost:3000/api/reservas/consulta
```

Búsqueda por nombre:

```text
GET http://localhost:3000/api/reservas/consulta?q=ana
```

Búsqueda por nombre y sala:

```text
GET http://localhost:3000/api/reservas/consulta?q=ana&sala=Sala%20Norte
```

Ordenamiento y paginación:

```text
GET http://localhost:3000/api/reservas/consulta?orden=personas-asc&pagina=2&limite=2
```

### Sitio HTML

Se mantienen las rutas web anteriores y se amplía el listado de reservas:

| Dirección | Qué hace |
|---|---|
| `GET /` | Página de inicio |
| `GET /reservas` | Muestra el listado y permite buscar, filtrar, ordenar y paginar |
| `GET /reservas/nueva` | Muestra el formulario de creación |
| `POST /reservas` | Guarda una reserva desde el formulario |
| `GET /reservas/:id` | Muestra el detalle de una reserva |
| `GET /reservas/:id/editar` | Muestra el formulario de edición con los datos cargados |
| `POST /reservas/:id/editar` | Valida y guarda los cambios de una reserva |
| `GET /reservas/:id/estado` | Muestra el formulario para cambiar el estado |
| `POST /reservas/:id/estado` | Modifica únicamente el estado de la reserva |
| `GET /reservas/:id/eliminar` | Muestra la pantalla de confirmación de eliminación |
| `POST /reservas/:id/eliminar` | Procesa la confirmación y elimina la reserva |

La ruta `GET /reservas` recibe los mismos criterios de búsqueda que la nueva consulta de la API.

El sitio no realiza una solicitud HTTP a su propia API. El controlador web utiliza directamente el servicio compartido.

### Respuestas de la API

| Situación | Código HTTP |
|---|---|
| Consulta correcta | 200 |
| Reserva creada correctamente | 201 |
| Eliminación correcta | 204 |
| ID mal formado | 400 |
| Datos inválidos o campos no permitidos | 400 |
| Parámetros de consulta inválidos | 400 |
| ID válido pero reserva inexistente | 404 |
| Ruta de API inexistente | 404 |
| Error inesperado del servidor | 500 |

## 10. Cómo probar en Postman

Para realizar las pruebas hay que tener el servidor iniciado con:

```bash
npm run start:local
```

La dirección base es:

```text
http://localhost:3000
```

En las consultas GET no es necesario utilizar Body. Los criterios se ingresan desde la pestaña Params de Postman o directamente en la URL.

### Ejemplo de búsqueda sin parámetros

**Método:** GET

**URL:**

```text
http://localhost:3000/api/reservas/consulta
```

La respuesta esperada es HTTP 200 y contiene los primeros dos registros, con página 1, límite 2, total 6 y 3 páginas.

### Ejemplo de búsqueda por nombre

**Método:** GET

**URL:**

```text
http://localhost:3000/api/reservas/consulta
```

En Params:

| Key | Value |
|---|---|
| q | ana |

La consulta devuelve los registros cuyo nombre contiene el fragmento `ana`.

### Ejemplo de búsqueda combinada

En Params:

| Key | Value |
|---|---|
| q | ana |
| sala | Sala Norte |
| orden | personas-asc |
| pagina | 1 |
| limite | 2 |

La consulta devuelve los registros que cumplen ambos filtros, ordenados por cantidad de personas de menor a mayor.

### Ejemplo de búsqueda literal

Para comprobar que los caracteres especiales se interpretan como texto literal:

```text
http://localhost:3000/api/reservas/consulta?q=A%2BB
```

Esta consulta encuentra el registro `Carla (A+B)`.

También se puede comprobar que las búsquedas:

```text
?q=%5B
```

y

```text
?q=.%2A
```

no se interpretan como operadores de expresiones regulares.

### Ejemplo de parámetro inválido

```text
http://localhost:3000/api/reservas/consulta?pagina=0
```

La respuesta esperada es HTTP 400 con un mensaje que explica que la página debe estar entre 1 y 1000.

### Pruebas desde el navegador

Para probar las consultas web se puede abrir:

```text
http://localhost:3000/reservas
```

Desde el formulario se puede:

1. Ingresar un fragmento del nombre.
2. Seleccionar o escribir una sala.
3. Elegir el criterio de ordenamiento.
4. Seleccionar cuántas reservas se muestran por página.
5. Presionar Buscar.
6. Utilizar Anterior y Siguiente para recorrer los resultados.
7. Presionar Limpiar para volver al listado sin filtros.

Las nuevas búsquedas comienzan en la primera página y los enlaces de navegación conservan los criterios seleccionados.

## 11. Matriz de resultados de las pruebas

En esta sección registro las comprobaciones realizadas en Postman y en el navegador durante el desarrollo del TP 13.

### Consultas generales y búsqueda

| Caso probado | Resultado esperado | Resultado observado |
|---|---|---|
| Consulta sin parámetros | 200, total 6, página 1, límite 2 y 3 páginas | Correcto. Se obtuvieron Ana Alba y Ana Berta |
| Búsqueda `q=ana` | 200 y 4 coincidencias | Correcto. Total 4 y 2 páginas |
| Búsqueda `q=ana` con `sala=Sala Norte` | 200 y 3 coincidencias | Correcto. Total 3 y 2 páginas |
| Búsqueda con `orden=personas-asc` | Orden ascendente por cantidad de personas | Correcto. Se obtuvieron los registros con 1 y 2 personas |
| Consulta de la segunda página | Mostrar los registros siguientes sin repetir los anteriores | Correcto. Se obtuvo Ana Clara con 3 personas |
| Comparación entre API y navegador | Mostrar los mismos resultados y metadatos | Correcto. Se verificó la equivalencia |
| Nueva búsqueda desde la página 2 | Volver a la página 1 y conservar los criterios | Correcto |
| Botón Limpiar | Quitar los filtros y recuperar valores predeterminados | Correcto |

### Búsquedas literales y resultados vacíos

| Caso probado | Resultado esperado | Resultado observado |
|---|---|---|
| Búsqueda `q=A+B` | Encontrar el registro Carla (A+B) | Correcto. Una coincidencia |
| Búsqueda `q=[` | Interpretar el carácter como texto literal | Correcto. 200 y cero coincidencias |
| Búsqueda `q=.*` | Interpretar los caracteres como texto literal | Correcto. 200 y cero coincidencias |
| Búsqueda sin coincidencias | 200, datos vacío, total 0 y páginas 0 | Correcto. Se mostró el mensaje correspondiente en el navegador |
| Página fuera de los resultados | 200, conservar total y devolver datos vacío | Correcto. Se mostró el enlace para volver a la primera página |

### Validaciones de parámetros

| Caso probado | Resultado esperado | Resultado observado |
|---|---|---|
| `pagina=0` | 400 | Correcto. La API rechazó el valor |
| `pagina=1.5` | 400 | Correcto. La API rechazó el valor |
| `limite=21` | 400 | Correcto. La API rechazó el valor |
| `orden=inventado` | 400 | Correcto. La API rechazó el criterio |
| Parámetro `q` repetido | 400 | Correcto. Se rechazó el parámetro repetido |
| Parámetro desconocido | 400 | Correcto. Se rechazó la solicitud |
| `pagina=0` desde navegador | 400 | Correcto |
| `orden=inventado` desde navegador | 400 | Correcto |
| Parámetro desconocido desde navegador | 400 | Correcto |
| Criterios `q` y `sala` vacíos | 200 y sin restricciones de búsqueda | Correcto. Total 6 |
| Sala inexistente | 200, datos vacío, total 0 y páginas 0 | Correcto |
| `orden` vacío | 400 | Correcto. Se rechazó el criterio |

### Continuidad de la aplicación y persistencia

| Caso probado | Resultado esperado | Resultado observado |
|---|---|---|
| `GET /api/reservas` | Mantener el funcionamiento anterior | 200. Se obtuvo la respuesta paginada anterior |
| `GET /api/reservas/:id` | Obtener una reserva por su identificador | 200. Se obtuvo el objeto individual |
| Reiniciar la aplicación | Conservar los documentos guardados | Correcto. Los seis registros siguieron disponibles |
| Consulta después del reinicio | 200, total 6, página 1, límite 2 y 3 páginas | Correcto. Se obtuvieron Ana Alba y Ana Berta |

Las operaciones de alta, edición completa, modificación parcial y eliminación ya habían sido trabajadas y comprobadas durante los trabajos anteriores. No se repitieron como parte de las pruebas específicas de búsqueda del TP 13.

### Verificaciones de formato, código y conexión

| Comando o prueba | Resultado esperado | Resultado observado |
|---|---|---|
| `npm run format` | Aplicar Prettier | Correcto. Terminó sin errores |
| `npm run check` | Comprobar formato y ejecutar ESLint | Correcto. Terminó sin errores |
| `npm run start:local` | Iniciar la aplicación cargando el `.env` | Correcto. La aplicación quedó disponible en `http://localhost:3000` |
| Reinicio de la aplicación | Volver a iniciar y mantener la conexión | Correcto. Se realizó una nueva consulta después del reinicio |

## 12. Cosas que fallaron durante las pruebas y cómo las arreglé

Durante el desarrollo aparecieron algunas cuestiones que tuve que revisar y corregir.

| Qué pasaba o qué debía controlarse | Qué hice |
|---|---|
| Las consultas web y API debían utilizar los mismos criterios | Incorporé el módulo compartido `criterios-reservas.js` |
| Había que impedir el uso de parámetros desconocidos | Incorporé una lista de parámetros permitidos y rechacé los adicionales |
| Había que impedir parámetros repetidos | Incorporé la comprobación del tipo de valor recibido |
| Los caracteres especiales podían alterar la búsqueda | Incorporé la función `escaparRegex()` |
| La búsqueda debía ignorar mayúsculas y minúsculas | Configuré la expresión regular con la opción `i` |
| La sala debía compararse por igualdad exacta | Utilicé el valor completo del criterio como filtro |
| Los resultados podían tener valores iguales al ordenar | Incorporé `_id` como segundo criterio de ordenamiento |
| La paginación debía conocer el total de coincidencias | Utilicé `countDocuments()` antes de recuperar los resultados paginados |
| Había que diferenciar entre cero coincidencias y una página fuera de rango | Incorporé condiciones diferentes en la vista |
| Los enlaces de navegación debían conservar los filtros | Utilicé los criterios de consulta para generar las URL de navegación |
| Una nueva búsqueda desde otra página debía comenzar desde la primera | El formulario no envía el parámetro `pagina` |
| El reinicio no debía eliminar los datos | Comprobé la persistencia mediante una nueva consulta después del reinicio |

Una cuestión importante de esta entrega fue compartir la lógica de consulta entre la API y el sitio HTML, evitando duplicar operaciones y manteniendo una única forma de interpretar los criterios.

También fue importante proteger la búsqueda por nombre para que los caracteres especiales se interpreten como texto y no como instrucciones de una expresión regular.

## 13. Pequeña decisión de diseño

En esta entrega mantuve la separación entre el controlador, el servicio y el módulo de criterios.

El módulo `criterios-reservas.js` se encarga de interpretar y validar los parámetros recibidos.

El controlador web utiliza esos criterios, llama al servicio y prepara los datos que necesita la vista EJS.

El controlador de la API utiliza el mismo módulo y el mismo servicio, pero devuelve los resultados en formato JSON.

El servicio construye el filtro de MongoDB, cuenta los documentos coincidentes y obtiene los resultados aplicando ordenamiento y paginación.

De esta manera, la búsqueda se implementa una sola vez y puede utilizarse desde dos interfaces diferentes.

No incorporé una nueva colección ni otro modelo porque los criterios de búsqueda trabajan sobre los campos que ya existen en las reservas.

## 14. Lo que todavía no valida mi aplicación

La aplicación tiene las validaciones solicitadas para esta entrega, pero todavía hay cuestiones que no contempla:

- No comprueba que el email sea una dirección real. Solamente verifica que tenga `@`.
- La fecha se guarda como texto obligatorio, pero no se comprueba si es una fecha real o futura.
- No verifica si dos reservas se superponen en el mismo horario.
- No controla disponibilidad real de las salas.
- No tiene autenticación ni permisos de usuarios.
- No comprueba si una reserva ya existe con los mismos datos.
- La búsqueda no elimina ni normaliza tildes.

Estas cuestiones podrían agregarse en futuras versiones, pero no forman parte de lo que implementé en este trabajo.

## 15. Comparación con el TP 12

| Característica | TP 12 | TP 13 |
|---|---|---|
| Base de datos | MongoDB Atlas | Se mantiene MongoDB Atlas |
| Nombre de la base | `reservas_salas_u12` | `reservas_salas_u13` |
| Colección | `reservas` | Se mantiene `reservas` |
| Operaciones API | GET, POST, PUT, PATCH y DELETE | Se mantienen las mismas |
| Crear reserva desde API | Sí | Se mantiene |
| Consultar por ID desde API | Sí | Se mantiene |
| Reemplazar una reserva desde API | Sí, con PUT | Se mantiene |
| Modificar algunos campos desde API | Sí, con PATCH | Se mantiene |
| Eliminar una reserva desde API | Sí, con DELETE | Se mantiene |
| Filtrar por sala | Sí, en la consulta anterior de API | Se mantiene y se incorpora a la nueva consulta |
| Ordenar resultados | Sí, en la consulta anterior de API | Se mantiene y se incorpora a la nueva consulta |
| Paginación | Sí, en la consulta anterior de API | Se amplía a la búsqueda web y API |
| Búsqueda por fragmento del estudiante | No estaba incorporada | Se incorpora |
| Búsqueda literal de caracteres especiales | No estaba incorporada | Se incorpora |
| Validación compartida de criterios | No estaba incorporada | Se incorpora |
| Consulta web con filtros y búsqueda | No estaba incorporada | Se incorpora |
| Navegación entre páginas conservando criterios | No estaba incorporada | Se incorpora |
| Cambio parcial de estado desde HTML | Sí | Se mantiene |
| Eliminación con confirmación desde HTML | Sí | Se mantiene |
| Manejo centralizado de errores | Sí | Se mantiene y se utiliza en las nuevas consultas |
| Persistencia | MongoDB Atlas | Se mantiene y se vuelve a comprobar |

## 16. Calidad del código

Para revisar el formato y los errores de código ejecuté:

```bash
npm run format
npm run check
```

El resultado fue correcto:

- Prettier informó que los archivos cumplen con el formato.
- ESLint terminó sin mostrar errores.

También comprobé el inicio de la aplicación mediante:

```bash
npm run start:local
```

El servidor inició correctamente y quedó disponible en:

```text
http://localhost:3000
```

Además, realicé las pruebas funcionales de búsqueda, filtros, ordenamiento, paginación y validaciones desde Postman y el navegador.

Comprobé que las consultas web y API devuelven los mismos resultados para los mismos criterios, que los parámetros inválidos son rechazados y que la aplicación diferencia correctamente entre una búsqueda sin coincidencias y una página fuera de los resultados.

Finalmente, reinicié la aplicación y repetí una consulta para comprobar que los seis registros de práctica continuaban guardados en MongoDB Atlas.

Los resultados de estas pruebas están detallados en la matriz de esta entrega.

