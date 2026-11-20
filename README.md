# Trabajo práctico 12 - Reservas de salas: CRUD web con MongoDB

Esta es una actualización de la aplicación de reservas de salas de estudio que venía desarrollando en los TP 06, 07, 08, 09, 10 y 11.

En los trabajos anteriores incorporé las operaciones del CRUD, la conexión con MongoDB Atlas, las consultas con filtros, ordenamiento y paginación desde la API, y las operaciones para crear, consultar y editar reservas desde la interfaz HTML.

En esta entrega continué trabajando sobre la aplicación web. Incorporé un formulario para modificar únicamente el estado de una reserva y una pantalla para confirmar su eliminación.

También trabajé sobre las validaciones y el manejo de errores para evitar modificaciones o eliminaciones cuando los datos enviados no cumplen con las condiciones establecidas.

Las reservas siguen guardándose en MongoDB Atlas, por lo que no se pierden cuando reinicio el servidor. Tanto el sitio HTML como la API utilizan el mismo servicio y trabajan sobre los mismos documentos.

Hecho con Node.js, Express 5, EJS y Mongoose. Alumno: Renato G. Trentini.

---

## 1. Inicio del proyecto

- Arranqué desde el proyecto del TP 11, que ya tenía las operaciones del CRUD, la conexión con MongoDB Atlas y la aplicación web completa.
- Mantuve la estructura general de carpetas y la separación entre rutas, controladores, servicios y modelos.
- Conservé las operaciones anteriores para crear, consultar, modificar y eliminar reservas desde la API.
- Mantuve el listado, el detalle, el formulario de creación y el formulario de edición desde el sitio HTML.
- Incorporé un formulario para modificar únicamente el estado de una reserva.
- Incorporé una pantalla de confirmación antes de eliminar una reserva desde el sitio HTML.
- Trabajé sobre las validaciones para impedir que se envíen campos adicionales o valores incorrectos.
- Incorporé el tratamiento de errores para diferenciar los identificadores inválidos de las reservas inexistentes.
- Mantuve la conexión con MongoDB Atlas y la persistencia de los documentos.
- No copié el historial de Git, ni `node_modules`, ni el archivo `.env`.

## 2. Versiones

Se mantienen las dependencias del proyecto anterior y se conserva la configuración utilizada en los trabajos anteriores.

| Herramienta | Versión |
| --- | --- |
| Node.js | v22.16.0 |
| Express | ^5.2.1 |
| Mongoose | ^9.11.2 |
| EJS | ^6.0.1 |
| express-ejs-layouts | ^2.5.1 |
| morgan | ^1.12.1 |
| dotenv | ^18.0.9 |
| ESLint (dev) | ^10.12.0 |
| @eslint/js (dev) | ^10.0.1 |
| Prettier (dev) | ^3.9.10 |

Las dependencias están declaradas en `package.json`. Las versiones exactas que se instalaron quedan registradas en `package-lock.json`.

Uso **CommonJS** (`require` y `module.exports`).

Se mantiene `dotenv` como dependencia del proyecto.

## 3. Preparar MongoDB Atlas

1. Utilizo un cluster gratuito M0 en MongoDB Atlas.
2. Tengo configurado un usuario de base de datos para conectarme.
3. En Network Access agregué la IP desde la que me conecto.
4. La base de datos se llama `reservas_salas_u12`.
5. La colección se llama `reservas`.
6. La colección se crea automáticamente cuando se guarda el primer documento.

El sitio y la API trabajan sobre esta misma base de datos. Por eso, una modificación realizada desde el navegador también puede consultarse desde Postman, y viceversa.

## 4. Variables de entorno y DNS

El archivo `.env` no se entrega ni se sube al repositorio porque contiene los datos de conexión.

Dejé una plantilla `.env.example`:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USUARIO:CLAVE@HOST_DEL_CLUSTER/reservas_salas_u12?retryWrites=true&w=majority
```

- `USUARIO`, `CLAVE` y `HOST_DEL_CLUSTER` son marcadores y se deben reemplazar por los datos de cada conexión.
- Para preparar el entorno se copia `.env.example` y se completa con la URI correspondiente.
- La base de datos indicada en la URI es `reservas_salas_u12`.
- La corrección de DNS está en `src/config/base-datos.js`, donde se utilizan los servidores `8.8.8.8` y `1.1.1.1`, como en los trabajos anteriores.
- Esta configuración permite resolver la dirección `mongodb+srv` de Atlas.
- El archivo `.env` contiene la URI real y debe mantenerse privado.

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

Este último comando no carga automáticamente el archivo `.env`. Por eso, si `MONGODB_URI` no está definida previamente en el entorno, la aplicación muestra el error:

```text
No se pudo iniciar la aplicación: Error: Falta MONGODB_URI en el entorno.
```

Para el desarrollo local utilizo `npm run start:local`.

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
  servicios/       operaciones con MongoDB
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
- Los controladores reciben las solicitudes y devuelven la respuesta correspondiente.
- Las rutas conectan las direcciones con sus controladores.
- Los middlewares validan los datos antes de que lleguen al servicio y permiten centralizar el tratamiento de errores.

En esta entrega también trabajé sobre los controladores y las vistas para completar el cambio parcial de estado y la eliminación con confirmación desde el sitio HTML.

Tanto las rutas HTML como las rutas de la API utilizan el mismo servicio de reservas. De esta manera, no se duplica la lógica de acceso a MongoDB.

### Comandos disponibles

Se mantienen los comandos del proyecto anterior:

| Comando | Qué hace |
| --- | --- |
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
| --- | --- |
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

En el formulario web de esta entrega se incorpora otra forma de modificación: cambiar únicamente el campo `estado`.

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
  "fecha": "2026-11-05",
  "turno": "Mañana",
  "personas": 2,
  "estado": "pendiente"
}
```

El `id` es un texto que sale del `_id` de MongoDB. No se convierte a número.

## 8. Consultas, filtros y paginación

Se mantienen las opciones incorporadas en el TP 10 para consultar las reservas desde la API.

La consulta permite:

- Filtrar por sala.
- Ordenar los resultados.
- Consultar una página determinada.
- Establecer cuántas reservas se muestran por página.
- Conocer la cantidad total de reservas que coinciden con el filtro.
- Calcular cuántas páginas se necesitan.

### Parámetros permitidos

| Parámetro | Función |
| --- | --- |
| `sala` | Filtra las reservas por el nombre de la sala |
| `orden` | Indica cómo se ordenan los resultados |
| `pagina` | Indica qué página se quiere consultar |
| `limite` | Indica cuántas reservas se muestran por página |

Los valores permitidos para `orden` son:

- `estudiante`: ordena por nombre del estudiante.
- `personas-asc`: ordena por cantidad de personas de menor a mayor.
- `personas-desc`: ordena por cantidad de personas de mayor a menor.

Los valores predeterminados son:

- Página: `1`.
- Límite: `2`.
- Orden: `estudiante`.

El límite máximo permitido es 20. Si se envía un valor mayor, la API responde con código 400.

### Ejemplo de consulta

```text
GET http://localhost:3000/api/reservas?sala=Sala%20Norte&orden=personas-asc&pagina=1&limite=2
```

En este caso se buscan las reservas de Sala Norte, ordenadas por cantidad de personas de menor a mayor, mostrando los primeros dos resultados.

### Respuesta de la consulta

La respuesta devuelve un objeto con cinco propiedades:

```json
{
  "datos": [
    {
      "id": "6ae8a31281fd53a85c6e0c0c",
      "estudiante": "Juan Ejemplo",
      "email": "juanjo.ejemplo@example.com",
      "sala": "Sala Norte",
      "fecha": "2026-11-18",
      "turno": "Mañana",
      "personas": 2,
      "estado": "pendiente"
    }
  ],
  "pagina": 1,
  "limite": 2,
  "total": 2,
  "paginas": 1
}
```

Las propiedades significan lo siguiente:

- `datos`: contiene las reservas que corresponden a la página solicitada.
- `pagina`: indica la página actual.
- `limite`: indica cuántos resultados se muestran por página.
- `total`: indica la cantidad total de reservas que cumplen el filtro.
- `paginas`: indica la cantidad total de páginas.

Para obtener los datos se utiliza `find()` con el filtro correspondiente, el ordenamiento y la paginación.

Para calcular el total se utiliza `countDocuments()`. Este método cuenta todos los documentos que coinciden con el filtro, sin aplicar la paginación.

Esto es importante porque, aunque una página no tenga resultados, el total debe seguir indicando cuántas reservas existen para ese filtro.

### Validaciones de los parámetros

El controlador solamente acepta los parámetros `sala`, `orden`, `pagina` y `limite`.

También controla que:

- La sala tenga contenido.
- No se repita el parámetro `sala`.
- El orden corresponda a uno de los valores permitidos.
- La página sea un número entero mayor o igual a 1.
- El límite sea un número entero mayor o igual a 1 y no supere 20.
- No se repitan parámetros como `pagina`.
- No se envíen parámetros que no estén permitidos, como `select`.

Si alguna de estas condiciones no se cumple, la consulta responde con código 400.

## 9. Endpoints

### API JSON

Se mantienen los endpoints incorporados en los trabajos anteriores:

| Método y dirección | Resultado |
| --- | --- |
| `GET /api/reservas` | Lista las reservas con paginación |
| `GET /api/reservas?sala=Sala%20Norte` | Lista las reservas de esa sala |
| `GET /api/reservas?orden=personas-asc` | Ordena por cantidad de personas |
| `GET /api/reservas?pagina=2&limite=2` | Consulta una página determinada |
| `GET /api/reservas/estado` | Devuelve la cantidad total de reservas |
| `GET /api/reservas/:id` | Busca una reserva por su ID |
| `POST /api/reservas` | Crea una reserva |
| `PUT /api/reservas/:id` | Reemplaza todos los campos permitidos de una reserva |
| `PATCH /api/reservas/:id` | Modifica `personas`, `estado` o ambos |
| `DELETE /api/reservas/:id` | Elimina físicamente una reserva |

### Ruta de estado

También se mantiene la consulta para conocer cuántas reservas hay guardadas.

La dirección es:

```text
GET http://localhost:3000/api/reservas/estado
```

La respuesta tiene esta estructura:

```json
{
  "totalReservas": 7
}
```

El número depende de la cantidad de documentos que haya guardados en MongoDB.

Para obtenerlo se utiliza `countDocuments()` sin un filtro, por lo que cuenta todas las reservas de la colección.

### Respuestas de la API

| Situación | Código HTTP |
| --- | --- |
| Consulta correcta | 200 |
| Reserva creada correctamente | 201 |
| Eliminación correcta | 204 |
| ID mal formado | 400 |
| Datos inválidos o campos no permitidos | 400 |
| Parámetros de consulta inválidos | 400 |
| ID válido pero reserva inexistente | 404 |
| Ruta de API inexistente | 404 |
| Error inesperado del servidor | 500 |

### Sitio HTML

En esta entrega se amplía el trabajo desde el navegador, incorporando el cambio parcial de estado y la eliminación con confirmación.

| Dirección | Qué hace |
| --- | --- |
| `GET /` | Página de inicio |
| `GET /reservas` | Muestra el listado de reservas |
| `GET /reservas/nueva` | Muestra el formulario de creación |
| `POST /reservas` | Guarda una reserva desde el formulario |
| `GET /reservas/:id` | Muestra el detalle de una reserva |
| `GET /reservas/:id/editar` | Muestra el formulario de edición con los datos cargados |
| `POST /reservas/:id/editar` | Valida y guarda los cambios de una reserva |
| `GET /reservas/:id/estado` | Muestra el formulario para cambiar el estado |
| `POST /reservas/:id/estado` | Modifica únicamente el estado de la reserva |
| `GET /reservas/:id/eliminar` | Muestra la pantalla de confirmación de eliminación |
| `POST /reservas/:id/eliminar` | Procesa la confirmación y elimina la reserva |

El sitio sigue utilizando MongoDB. Por eso, los cambios que se hacen desde la API también se reflejan cuando se consulta el listado o el detalle desde el navegador.

### Cambio parcial de estado desde el sitio HTML

En esta entrega incorporé un formulario que permite modificar únicamente el estado de una reserva.

Los estados permitidos son:

- `pendiente`
- `confirmada`

El flujo funciona de la siguiente manera:

1. Desde el listado o el detalle se accede a la opción para cambiar el estado.
2. La aplicación busca la reserva en MongoDB mediante su identificador.
3. Si existe, muestra el formulario con el estado actual.
4. El usuario selecciona el nuevo estado y envía el formulario.
5. El controlador verifica que se haya enviado únicamente el campo `estado`.
6. También comprueba que el valor sea uno de los estados permitidos.
7. Si los datos son correctos, el controlador prepara un objeto con el cambio y llama al servicio `actualizar`.
8. El servicio modifica únicamente el estado y conserva los demás datos de la reserva.
9. La aplicación responde con una redirección 303 al detalle de la reserva actualizada.

No se reemplaza todo el documento. Se utiliza una actualización parcial para modificar solamente el campo solicitado.

Si se envían campos adicionales, un estado vacío o un valor no permitido, la aplicación responde con código 400 y muestra nuevamente el formulario con el mensaje correspondiente.

También se rechazan los campos repetidos.

Si la reserva no existe, la aplicación responde con código 404.

Si se cancela el formulario, no se envía ninguna modificación y la reserva permanece sin cambios.

### Eliminación desde el sitio HTML

También incorporé una pantalla de confirmación antes de eliminar una reserva.

El flujo funciona de la siguiente manera:

1. Desde el listado o el detalle se accede a la opción de eliminar.
2. La aplicación busca la reserva en MongoDB mediante su identificador.
3. Si existe, muestra una pantalla con los datos principales de la reserva y una advertencia.
4. El usuario puede cancelar o confirmar la eliminación.
5. Si confirma, el formulario envía el campo `confirmar` con el valor `si`.
6. El controlador comprueba que se haya enviado únicamente ese campo y que su valor sea correcto.
7. Si la confirmación es válida, llama al servicio `eliminar`.
8. El servicio elimina físicamente el documento de MongoDB.
9. Si la eliminación se completa, la aplicación responde con una redirección 303 al listado de reservas.

La eliminación requiere una confirmación explícita. Si el campo está ausente, tiene un valor incorrecto, está repetido o se envían campos adicionales, la aplicación responde con código 400 y no elimina la reserva.

La pantalla de confirmación utiliza una solicitud GET que solamente consulta y muestra los datos. La eliminación se realiza mediante POST, después de la confirmación.

Si se cancela la operación, no se modifica ni se elimina el documento.

Si la reserva no existe, la aplicación responde con código 404.

### Manejo de errores

También se trabajó sobre el manejo de errores de la aplicación.

El middleware centralizado permite diferenciar los errores de entrada de los errores inesperados del servidor.

Para las solicitudes de la API se devuelve una respuesta JSON con el mensaje de error y los campos que presentan problemas cuando corresponde.

Para las solicitudes del sitio HTML se muestran las vistas correspondientes con el mensaje de error.

En los formularios de edición y cambio parcial de estado, cuando se produce un error de validación, se conserva el contexto del formulario y los valores enviados para que el usuario pueda corregirlos.

En la eliminación se vuelve a mostrar la pantalla de confirmación cuando los datos enviados no cumplen con las condiciones establecidas.

También se diferencia entre un identificador inválido, que produce una respuesta 400, y un identificador válido que no corresponde a ninguna reserva, que produce una respuesta 404.

De esta manera, el sitio y la API mantienen respuestas diferentes según el tipo de solicitud, pero utilizan el mismo servicio de reservas.

## 10. Cómo probar en Postman

Para realizar las pruebas hay que tener el servidor iniciado con:

```bash
npm run start:local
```

La dirección base es:

```text
http://localhost:3000
```

En las solicitudes que llevan datos se utiliza `Body > raw > JSON`, salvo las operaciones que se realizan desde los formularios HTML.

### Ejemplo de consulta con filtros y paginación

**Método:** GET

**URL:**

```text
http://localhost:3000/api/reservas
```

En la pestaña Params se pueden cargar los siguientes valores:

| Key | Value |
| --- | --- |
| sala | Sala Norte |
| orden | personas-asc |
| pagina | 1 |
| limite | 2 |

Postman genera la dirección con los parámetros correspondientes.

La respuesta esperada es un objeto que contiene los resultados y los datos de paginación.

### Ejemplo de POST

**Método:** POST

**URL:**

```text
http://localhost:3000/api/reservas
```

**Body:**

```json
{
  "estudiante": "María Ejemplo",
  "email": "maria.ejemplo@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-11-05",
  "turno": "Mañana",
  "personas": 2
}
```

La respuesta esperada es `201 Created`, con el ID generado por MongoDB y el estado `pendiente`.

### Ejemplo de PUT

**Método:** PUT

**URL:**

```text
http://localhost:3000/api/reservas/ID_DE_LA_RESERVA
```

**Body:**

```json
{
  "estudiante": "María Ejemplo",
  "email": "maria.ejemplo@example.com",
  "sala": "Sala Sur",
  "fecha": "2026-11-11",
  "turno": "Tarde",
  "personas": 3,
  "estado": "pendiente"
}
```

La respuesta esperada es `200 OK`, con la reserva actualizada y el mismo ID.

Para PUT es obligatorio enviar los siete campos. Si falta alguno, la solicitud responde con código 400 y la reserva no se modifica.

### Ejemplo de PATCH

**Método:** PATCH

**URL:**

```text
http://localhost:3000/api/reservas/ID_DE_LA_RESERVA
```

**Body:**

```json
{
  "estado": "confirmada"
}
```

En este caso solamente cambia el estado. Los demás campos se conservan.

### Ejemplo de DELETE

**Método:** DELETE

**URL:**

```text
http://localhost:3000/api/reservas/ID_DE_LA_RESERVA
```

Si la reserva existe, la respuesta es `204 No Content`.

Si se repite la misma solicitud, la respuesta es `404`, porque ya fue eliminada.

**Importante:** para las pruebas de creación, modificación y eliminación conviene utilizar reservas de prueba. El POST crea documentos reales y el DELETE los elimina de la base.

### Pruebas desde el navegador

Para probar las operaciones web no es necesario utilizar Postman.

**Cambio parcial de estado:**

1. Iniciar la aplicación con `npm run start:local`.
2. Abrir el listado de reservas.
3. Seleccionar una reserva existente.
4. Ingresar a la opción para cambiar el estado.
5. Comprobar que se muestre el estado actual.
6. Seleccionar otro estado y guardar.
7. Comprobar que la aplicación redirija al detalle actualizado.
8. Consultar el mismo ID desde Postman para verificar que el cambio también esté guardado en MongoDB.

También se puede cancelar el formulario y comprobar que la reserva no haya cambiado.

**Eliminación con confirmación:**

1. Abrir el listado de reservas.
2. Seleccionar una reserva existente.
3. Ingresar a la opción de eliminar.
4. Comprobar que se muestre la pantalla de confirmación con los datos de la reserva.
5. Cancelar y comprobar que la reserva continúe existiendo.
6. Volver a ingresar a la pantalla de eliminación.
7. Confirmar la operación.
8. Comprobar que la aplicación redirija al listado.
9. Consultar el mismo ID desde Postman para verificar que la reserva ya no exista.

## 11. Matriz de resultados de las pruebas

En esta sección anoto los resultados que fui comprobando en Postman, el navegador, MongoDB Compass y la terminal durante las pruebas del TP 12.

### Cambio parcial de estado desde el sitio HTML

| Caso probado | Resultado esperado | Resultado observado |
| --- | --- | --- |
| GET al formulario de estado con ID existente | 200 y formulario con el estado actual | 200. Se mostró el estado actual de la reserva |
| Guardar un estado permitido | 303 y redirección al detalle | 303. Se guardó el cambio y se mostró el detalle actualizado |
| GET por API después del cambio | 200 y estado actualizado | 200. Se comprobó que el nuevo estado estaba guardado |
| Comprobar los demás campos después del cambio | Los demás datos deben conservarse | Se comprobó que los demás campos permanecieron sin modificaciones |
| Cancelar el formulario | No debe guardar cambios | Se volvió al detalle y el estado permaneció igual |
| Enviar un estado no permitido | 400 y mensaje de validación | 400. Se mostró el mensaje correspondiente |
| Enviar un estado vacío | 400 y formulario con error | 400. Se mostró nuevamente el formulario |
| Enviar un campo adicional | 400 y rechazo de la solicitud | 400. Se rechazó la solicitud |
| Enviar el campo estado repetido | 400 y rechazo de la solicitud | 400. Se rechazó la solicitud |
| Intentar acceder con un ID inválido | 400 | 400. Se mostró el mensaje correspondiente |
| Intentar acceder con un ID válido inexistente | 404 | 404. Se mostró la vista de reserva no encontrada |
| Intentar guardar desde un formulario abierto después de eliminar la reserva | 404 y sin crear nuevamente el documento | 404. La reserva continuó eliminada |

### Eliminación desde el sitio HTML

| Caso probado | Resultado esperado | Resultado observado |
| --- | --- | --- |
| GET a la pantalla de confirmación con ID existente | 200 y datos de la reserva | 200. Se mostró la información de la reserva |
| Cancelar la eliminación | La reserva debe permanecer intacta | Se comprobó que la reserva continuaba existiendo |
| Confirmar la eliminación correctamente | 303 y redirección al listado | Se completó la eliminación y se llegó al listado |
| Consultar por API una reserva eliminada | 404 | 404. La API informó que no existe una reserva con ese identificador |
| Enviar una confirmación incorrecta (`no`) | 400 y reserva intacta | 400. Se mostró el mensaje de confirmación |
| Enviar campos adicionales | 400 y reserva intacta | 400. Se rechazó la solicitud y la reserva no se eliminó |
| Repetir el POST de eliminación sobre una reserva ya eliminada | 404 | 404. Se mostró la vista de reserva no encontrada |
| Enviar la confirmación faltante | 400 y reserva intacta | 400. Se volvió a mostrar la pantalla de confirmación |
| Enviar el campo confirmar repetido | 400 y reserva intacta | 400. Se rechazó la solicitud |
| Comprobar la reserva después de los intentos inválidos | 200 y datos sin modificaciones | 200. Se comprobó que la reserva seguía existiendo con sus datos intactos |

### Pruebas de continuidad de la API y de las operaciones anteriores

| Caso probado | Resultado esperado | Resultado observado |
| --- | --- | --- |
| Crear una reserva desde el formulario web | Reserva creada y estado inicial pendiente | Correcto. Se creó una reserva desde el sitio HTML |
| Realizar una edición completa desde la web | 303 y reserva actualizada | Correcto. Se modificó y guardó la reserva |
| Consultar una reserva por ID desde la API | 200 y datos correctos | 200. Se consultó la reserva y se verificaron sus datos |
| Consultar reservas con filtro por sala y ordenamiento | 200 y resultados correspondientes | 200. Se obtuvo la reserva de Sala Norte ordenada por cantidad de personas |
| Consultar reservas sin filtros | 200 y valores predeterminados | 200. Se comprobó página 1, límite 2 y orden por estudiante |
| Consultar la segunda página | 200 y registros restantes sin repetir los anteriores | 200. Se obtuvo el tercer registro, con total 3 y 2 páginas |
| Consultar el estado general de la API | 200 y cantidad total de reservas | 200. La respuesta informó `totalReservas: 3` |
| Modificar una reserva mediante PATCH | 200 y modificación parcial | 200. Se modificó `personas` de 3 a 5 y se conservó el resto de los campos |
| Comprobar el cambio de PATCH desde el listado web | El listado debe mostrar los datos actualizados | Correcto. Se mostró Bruno Ejemplo con 5 personas y estado confirmada |
| Eliminar una reserva mediante DELETE | 204 y eliminación | Se comprobó la eliminación desde la API |
| Repetir DELETE sobre una reserva eliminada | 404 | Se comprobó que la API informa que la reserva no existe |

**Nota:** en esta entrega se verificaron el alta y la edición completa desde el sitio HTML. Las operaciones POST y PUT de la API no se vuelven a marcar como probadas en esta matriz porque no repetimos esas solicitudes durante las comprobaciones de continuidad de TP12.

### Verificaciones de formato, código y conexión

| Comando o prueba | Resultado esperado | Resultado observado |
| --- | --- | --- |
| `npm run check` | Comprobar formato y ejecutar ESLint | Correcto. Terminó sin errores |
| `npm run start:local` | Iniciar la aplicación cargando el `.env` | Correcto. La aplicación quedó disponible en `http://localhost:3000` |
| Actualización parcial de estado | Modificar el estado sin alterar los demás campos | Correcto. Se comprobó el cambio desde el navegador y la API |
| Actualización con `returnDocument: "after"` | Obtener el documento actualizado | Correcto. La actualización se realizó sin advertencias de Mongoose |
| Pie de página de la aplicación | Mostrar la identificación del TP 12 | Correcto. Se corrigió la referencia en `views/layouts/main.ejs` |

## 12. Cosas que fallaron durante las pruebas y cómo las arreglé

Durante el desarrollo aparecieron algunos problemas que tuve que corregir.

| Qué pasaba | Qué hice |
| --- | --- |
| La vista de detalle no mostraba correctamente todos los datos de la reserva | Revisé la estructura de la vista y completé la presentación de los campos |
| La vista de eliminación tenía una estructura HTML incorrecta | Corregí las etiquetas y los datos que se muestran en la confirmación |
| La vista de error mostraba siempre el código 404, incluso cuando la respuesta era 400 | Modifiqué el middleware para enviar el código HTTP a la vista |
| El pie de página seguía indicando Trabajo práctico 11 | Actualicé el texto en `views/layouts/main.ejs` para identificar el TP 12 |
| Mongoose mostraba una advertencia relacionada con la opción `new` | Reemplacé `new: true` por `returnDocument: "after"` |
| El formulario de estado debía modificar solamente ese campo | Preparé un objeto con el cambio de estado y utilicé el servicio de actualización parcial |
| Al enviar campos adicionales o repetidos había que impedir la modificación | Incorporé las comprobaciones correspondientes antes de llamar al servicio |
| La eliminación debía requerir una confirmación explícita | Incorporé la validación del campo `confirmar` con el valor `si` |
| Al cancelar una eliminación había que evitar que se modificara la reserva | La pantalla de confirmación utiliza GET y la eliminación solamente se realiza mediante POST |
| Al intentar modificar una reserva eliminada desde un formulario que seguía abierto había que evitar que se creara nuevamente | Se comprobó la existencia de la reserva antes de realizar la actualización |
| El comando `npm start` no encontraba `MONGODB_URI` | Para el entorno local utilicé `npm run start:local`, que carga el archivo `.env` |

Una cuestión importante de esta entrega fue completar las operaciones de cambio parcial y eliminación desde el sitio HTML sin duplicar la lógica de acceso a MongoDB.

El controlador recibe los datos, realiza las comprobaciones correspondientes y utiliza el servicio para modificar o eliminar la reserva.

De esta manera, tanto la API como el sitio HTML siguen trabajando sobre los mismos documentos.

También fue importante diferenciar los errores de validación de los errores inesperados del servidor, para devolver el código HTTP correspondiente y mostrar una respuesta adecuada según se trate de una solicitud HTML o de una solicitud de API.

## 13. Pequeña decisión de diseño

Si en un futuro incorporáramos información sobre las salas, podríamos guardar datos propios de cada una, como su nombre, capacidad, ubicación y los recursos disponibles.

En cambio, una reserva contiene información relacionada con el estudiante, la fecha, el turno y la cantidad de personas.

Considero que tendría sentido utilizar una referencia entre la reserva y la sala, porque una misma sala puede tener muchas reservas y así evitaríamos repetir sus datos en cada registro. También podrían utilizarse datos embebidos si necesitáramos guardar información pequeña y específica de la sala dentro de la reserva. La elección dependería de cómo necesitemos consultar y mantener esa información.

No implementé otro modelo ni utilicé `populate`, porque el ejercicio solamente pide explicar esta decisión de diseño.

## 14. Lo que todavía no valida mi aplicación

La aplicación tiene las validaciones solicitadas para esta entrega, pero todavía hay cuestiones que no contempla:

- No comprueba que el email sea una dirección real. Solamente verifica que tenga `@`.
- La fecha se guarda como texto obligatorio, pero no se comprueba si es una fecha real o futura.
- No verifica si dos reservas se superponen en el mismo horario.
- No controla disponibilidad real de las salas.
- No tiene autenticación ni permisos de usuarios.
- No comprueba si una reserva ya existe con los mismos datos.

Estas cuestiones podrían agregarse en futuras versiones, pero no forman parte de lo que implementé en este trabajo.

## 15. Comparación con el TP 11

| | TP 11 | TP 12 |
| --- | --- | --- |
| Base de datos | MongoDB Atlas | MongoDB Atlas |
| Colección | `reservas` | `reservas` |
| Operaciones API | GET, POST, PUT, PATCH y DELETE | Se mantienen las mismas |
| Crear reserva desde API | Sí | Se mantiene |
| Consultar por ID desde API | Sí | Se mantiene |
| Reemplazar una reserva desde API | Sí, con PUT | Se mantiene |
| Modificar algunos campos desde API | Sí, con PATCH | Se mantiene |
| Eliminar una reserva desde API | Sí, con DELETE | Se mantiene |
| Filtrar por sala | Sí | Se mantiene |
| Ordenar resultados | Sí | Se mantiene |
| Paginación | Sí | Se mantiene |
| Conteo de reservas | Sí | Se mantiene |
| Interfaz HTML | Listado, detalle, creación y edición | Se amplía con cambio parcial de estado y eliminación con confirmación |
| Formulario de edición | Sí | Se mantiene |
| Cambio parcial de estado desde HTML | No estaba incorporado | Se incorpora |
| Eliminación con confirmación desde HTML | No estaba incorporada | Se incorpora |
| Validaciones de formularios web | Sí | Se amplían |
| Manejo centralizado de errores | Sí | Se amplía para los nuevos formularios |
| Persistencia | MongoDB Atlas | Se mantiene y se vuelve a comprobar |

## 16. Calidad del código

Para revisar el formato y los errores de código ejecuté:

```bash
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

Además, realicé pruebas funcionales del cambio parcial de estado y de la eliminación desde el sitio HTML, comprobando las respuestas HTTP y los datos guardados en MongoDB.

También comprobé la continuidad de varias operaciones anteriores: alta y edición completa desde la web, consultas de la API, filtros, ordenamiento, paginación, conteo, PATCH y DELETE.

Los resultados de estas pruebas están detallados en la matriz de esta entrega.

