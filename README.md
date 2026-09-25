# Reglas de EQUIPO

1. Ramas develop y main bloqueadas para hacer push (todo se pasa ahí a través de Pull Request) Ruleset en Github
2. no se sube el .env al repositorio (.gitignore)
3. no se suben /migrations al repositorio (.gitignore)
4. documentar siempre en el .env.example y en README con las entradas que necesitemos y qué son

---

## FLUJO de TRABAJO:

| Stage            | Finalidad                                                           | Notas                                                                             |
| ---------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Backlog          | todas las ideas a desarrollar                                       | puede ser solo una idea                                                           |
| Ready to Work    | Tareas aprobadas para realizar                                      | ya hemos aprobado que se hace                                                     |
| Work in progress | Tareas ya empezada y asignada a alguien que está trabajando en ella | aqui es donde te creas la rama para empezar a desarrollar "git switch -c tareaXX" |
| Review           | Hay un Pull Request pendiente de revisar                            | ...                                                                               |
| Done             | Finalizada y Merge en rama Develop                                  | ...                                                                               |

---

## NOTAS (recordatorio):

- git fetch: lista los cambios de la rama
- git pull: descarga los cambios de la rama
- git switch RAMA: cambia de rama
- git add . : añade todo lo modificado al stash de cambios
- git commit -m "mensaje": commit
- git push -u origin tareaXXX: sube la rama

  #integrar los cambios de develop en mi rama

- git checkout develop
- git pull origin develop
- git checkout (nombre de tu rama)
- git pull origin develop

## DIRECTORIOS:

| Tipo   | Ruta                   | Finalidad                                    |
| ------ | ---------------------- | -------------------------------------------- |
| vistas | /public/vistas         | Mockups de las vistas a desarrollar en figma |
| UML    | /docs/database/uml.txt | documento uml del proyecto                   |
| BACKEND | /src/api/data         | almacen de json para seeds, fixtures y mock data                                                                                         |
| BACKEND | /src/api/routes       | ficheros de rutas con los ENDPOINT del API                                                                                               |
| BACKEND | /src/api/models       | modelado de objetos de la base de datos                                                                                                  |
| BACKEND | /src/api/repositories | capa de acceso a datos de la aplicación: encapsula todas las consultas, inserciones, actualizaciones y eliminaciones de la base de datos |
| BACKEND | /src/api/services     | logica de la aplicación: aplica las reglas del sistema                                                                                   |
| ... | ... | ... |
| FRONTEND | /src/front/components | componentes React reutilizables  |
| FRONTEND | /src/front/components/navigation | navbar y menu de enlaces de usuario  |
| FRONTEND | /src/front/hooks | custom hooks y store context  |
| FRONTEND | /src/front/pages | paginas con contenido  |
| FRONTEND | /src/front/routes | routes.jsx y componentes de guardia  |
| FRONTEND | /src/front/services | capa de logica de aplicación JS |
| ... | ... | ... |
| ... | ... | ... |

## MODELO DE DATOS:

- UML en formato texto [Ver UML](/docs/database/uml.txt) adaptado a https://dbdiagram.io/

![UML](/docs/database/UML.png)

---

## LLAMADAS A API EXTERNAS:

  ### 1) IP-API  ➡️ ip-api.com (gratuito, sin api key)

  Geolocaliza de forma aproximada la IP del visitante, para centrar el mapa de inicio cuando el usuario todavía no ha compartido su ubicación del navegador.

  - Implementación: [`geolocation_service.py`](/src/api/services/geolocation_service.py) → `locate_ip(ip)`.
  - Se consume desde `GET /api/data` ([`src/api/routes/data.py`](/src/api/routes/data.py)) y se expone al frontend como `user_location`.
  - Devuelve `"lat,lon"` o `None` si la IP falla o no puede obtenerla o el servicio externo falla
  - Ruta de prueba manual: [`testgeo.py`](/src/api/routes/testip.py) (`GET /api/testip`), con una llamada directa vía `requests` a modo de ejemplo/depuración.

  ### 2) Nominatim ➡️ nominatim.org (gratuito, sin api key)

  Geocodifica una dirección en texto (calle, ciudad...) a sus coordenadas, para calcular el `map_positioning` de usuarios y protectoras.

  - Implementación: [`geolocation_service.py`](/src/api/services/geolocation_service.py) → `locate_address(direccion)`. Requiere un `User-Agent` propio por política de uso de Nominatim.
  - Se consume desde `update_user_profile` ([`users_service.py`](/src/api/services/users_service.py)) y `update_shelter_profile` ([`shelters_service.py`](/src/api/services/shelters_service.py)) cada vez que cambia el campo `address`: si el geocoding falla por cualquier motivo, no bloquea el guardado del resto del perfil, simplemente no actualiza `map_positioning`.
  - Ruta de prueba manual: [`testgeo.py`](/src/api/routes/testgeo.py) (`GET /api/testgeo`), con una llamada directa vía `requests` a modo de ejemplo/depuración.

  ### 3) Cloudinary
...

---
## SECCIONES / PAGINAS PRINCIPALES:

### — HOME
>  - como usuario invitado o como colaborador, muestra un hero con información sobre la plataforma y enlaces a las secciones principales.
>  - bajo usuario identificado como Protectora mostrará el dashboard con atajos a las principales secciones de su panel
>  - la imagen del hero, rotará entre un set de imagenes locales
### — NECESIDADES
>   - listado de necesidades con representación en un mapa
>   - filtrado básico por tipo 
### — ADOPTAR
>
### — PROTECTORAS
>
### — AYUDA
>
### — TERMINOS DE USO Y PRIVACIDAD
>
### — LOGIN / SIGNUP / LOGOUT
>
### — 
> ...

---
## LÓGICA DE ESTADOS:

## Animal y Adoptar:
Los campos `status` del dominio de adopción tienen su fuente de verdad en el service que "posee" cada entidad — no en el modelo, ni en el repositorio, ni en el frontend. Modelos y repositorios son agnósticos del valor concreto (solo el `default` de columna hardcodea un literal, por ser inevitable); rutas y frontend consumen constantes/mapas importados desde ahí en vez de repetir los strings.

### `Animal.status` — lo controla: [`animals_service.py`](/src/api/services/animals_service.py)

| Valor | Significado |
| --- | --- |
| `activado` | Único estado visible en las vistas públicas (`/adoptar`, `/adoptar/:id`) — `PUBLIC_STATUSES`. |
| `desactivado` | Oculto del catálogo público, reversible desde el panel de la protectora (botón Desactivar/Reactivar). |
| `borrador` | Ficha incompleta, nunca visible públicamente. |



### `AddoptionProcess.status` — lo controla: [`addoption_process_service.py`](/src/api/services/addoption_process_service.py)

| Valor | Significado |
| --- | --- |
| `abierto` | El proceso admite nuevas `AddoptionRequest` (sujeto también al rango de fechas) — ver `is_process_open_for_requests`. |
| `cerrado` | Ya no admite solicitudes nuevas. |

- Punto que cierra un proceso: `close_addoption_process(process)`. Lo invocan tanto el cierre automático al alcanzar el límite de solicitudes simultáneas como la aceptación de una solicitud.
- Abrir/Editar un proceso siempre lo deja en `abierto`, incluso si estaba `cerrado` (permite relanzarlo).

### `AddoptionRequest.status` — lo controla: [`addoption_request_service.py`](/src/api/services/addoption_request_service.py)

| Valor | Significado |
| --- | --- |
| `pendiente` | Recién creada, sin revisar. |
| `aceptada` | La protectora la ha aprobado. |
| `descartada` | Rechazada (individualmente o en bloque). |

- `accept_addoption_request`: marca la solicitud como `aceptada`, cierra el proceso asociado (`close_addoption_process`) y descarta automáticamente (`descartada`) el resto de solicitudes `pendiente` del mismo proceso, para que nunca quede más de una aceptada.
- `discard_addoption_requests`: descarte en bloque, solo afecta a las que siguen `pendiente`.

## Necesidades y Colaborar:

### `Request.status` — lo controla: [`requests_service.py`](/src/api/services/requests_service.py)

| Valor | Significado |
| --- | --- |
| `abierta` | Admite nuevas `UserRequest` (colaboraciones) — ver `is_request_contributable`. |
| `cerrada` | Ya no admite colaboraciones nuevas: se alcanza automáticamente cuando la suma de colaboraciones cubre `amount_needed`. |
| `borrador` | Necesidad incompleta, nunca visible públicamente. |

- Punto que cierra una necesidad: `_close_request_if_conseguido` en [`user_request_service.py`](/src/api/services/user_request_service.py), invocado tras cada colaboración creada. Solo aplica si la necesidad tiene `amount_needed` definido; sin objetivo (`amount_needed=None`) no hay cierre automático por acumulado.
- A diferencia de `AddoptionProcess`, hoy no existe una vía para que la protectora reabra o cierre una necesidad a mano (`SETTABLE_STATUSES` solo admite `abierta`/`borrador` desde el formulario).

---

## LOGICA DE NEGOCION DE ADOPCIONES:

Restricciones que aplican a (`animal`, `addoption_process`, `addoption_request`) al gestionar animales, procesos y solicitudes de adopción.

**Animales**

- Solo los animales en estado `activado` aparecen en el catálogo público y en su ficha; los que están en `borrador` o `desactivado` quedan ocultos aunque sigan existiendo.
- Una protectora solo puede ver y editar sus propios animales.
- Animales funciona como un catálogo de recursos de la protectora para mostrar tanto animales tanto que pueden ser adoptados como que tienen necesidades vinculadas.

**Procesos de adopción**

- Cada animal solo puede tener un proceso de adopción a la vez.
- Un proceso solo admite solicitudes nuevas mientras está `abierto` y, si tiene fechas configuradas, dentro de ese rango.
- Si se configura un límite de solicitudes simultáneas, el proceso se cierra cuando se alcanza ese número.
- El proceso se cierra solo en dos casos: cuando la protectora acepta una solicitud, o cuando se alcanza el límite de solicitudes simultáneas que ella misma configuró.
- Las fechas del proceso son opcionales y pueden ser configuradas por la protectora. Fuera de esas fechas el proceso sigue abierto pero no puede ser accesible.
- Reabrir o editar un proceso siempre lo deja `abierto`, aunque estuviera cerrado.
- Un proceso solo se puede eliminar si todavía no ha recibido ninguna solicitud; si ya tiene alguna, la única opción es cerrarlo (se conserva el historial).

**Solicitudes de adopción**

- Un usuario solo puede enviar una solicitud por proceso de adopción, y no puede repetirla aunque la anterior haya sido descartada.
- Solo se puede solicitar la adopción de un animal si su proceso está abierto en ese momento.
- Hay que responder todas las preguntas del proceso para poder enviar la solicitud.
- Aprobar una solicitud es una acción individual (no en bloque) y descarta automáticamente el resto de solicitudes pendientes del mismo proceso, para que nunca quede más de una aceptada.
- Descartar en bloque solo afecta a las solicitudes que siguen pendientes; ignora las que ya estaban aprobadas o descartadas.
- Una protectora solo puede ver y gestionar las solicitudes de sus propios procesos de adopción.

---

## LÓGICA DE NEGOCIO DE PETICIONES:

Restricciones que aplican a (`request`, `user_request`) al gestionar necesidades y colaboraciones.

**Necesidades**

- Solo las necesidades en estado `abierta` o `cerrada` son visibles públicamente (`/necesidades`, `/necesidades/:id`); las que están en `borrador` quedan ocultas aunque sigan existiendo.
- Una protectora solo puede ver y editar sus propias necesidades.
- Una necesidad puede tener un objetivo concreto (`amount_needed` definido, en la `unit` que corresponda: €, kg, turnos...) o quedar sin límite (`amount_needed=None`); solo las que tienen objetivo se cierran solas al cubrirse.

**Colaboraciones (`UserRequest`)**

- Solo se puede colaborar con una necesidad mientras está `abierta` y, si tiene fecha límite (`request_deadline`) configurada, dentro de ese plazo — ver `is_request_contributable`.
- Cada colaboración aporta una cantidad (`amount`, obligatoria si la necesidad tiene objetivo) y/o unos detalles en texto libre (`details`, p.ej. cómo o cuándo se va a entregar); hace falta al menos uno de los dos. La transacción no existe en esta parte del proyecto, si continuamos adelante se integraría un sistema de pagos o de transacciones.
- Un mismo usuario puede colaborar varias veces con la misma necesidad (no hay restricción).

---

## LIMPIADO DE LAS MIGRACIONES ANTERIORES Y BBDD ACTUAL:

Usa el [`Makefile`](/Makefile) de la raíz del proyecto (`make help` lista los comandos disponibles):

1. Vacia la bbdd actual, el registro de migraciones de la bbdd y la inicializa de nuevo aplicando el migrate/upgrade:

```sh
$ make reset-db
```
2. Repoblar datos de prueba (y tablas auxiliares): `make seed`. 
Con el backend arrancado (`pipenv run start`), ejecutar make seed llamará a `/api/seed` contra la URL definida en `VITE_BACKEND_URL` (en tu `.env`)
```sh
$ make seed
```
---

## ROLES DE USUARIO:

| Rol            | Tipo |
| ---------------- | ------------------------------------------------------------------- |
| none          | Visitante sin identificar del sitio web                                       |
| shelter_admin    | Rol de Usuario de una Protectora, gestiona todo el inventario y solicitudes de la protectora |
| volunteer | Rol de colaborador, no vinculado a ninguna protectora. Colabora o puede solicitar adoptar animales |

---


---

---

# README original:

# WebApp boilerplate with React JS and Flask API

Build web applications using React.js for the front end and python/flask for your backend API.

- Documentation can be found here: https://4geeks.com/docs/start/react-flask-template
- Here is a video on [how to use this template](https://www.loom.com/share/f37c6838b3f1496c95111e515e83dd9b)
- Integrated with Pipenv for package managing.
- Fast deployment to Render [in just a few steps here](https://4geeks.com/docs/start/deploy-to-render-com).
- Use of .env file.
- SQLAlchemy integration for database abstraction.

### 1) Installation:

> If you use Github Codespaces (recommended) or Gitpod this template will already come with Python, Node and the Posgres Database installed. If you are working locally make sure to install Python 3.10, Node

It is recomended to install the backend first, make sure you have Python 3.10, Pipenv and a database engine (Posgress recomended)

1. Install the python packages: `$ pipenv install`
2. Create a .env file based on the .env.example: `$ cp .env.example .env`
3. Install your database engine and create your database, depending on your database you have to create a DATABASE_URL variable with one of the possible values, make sure you replace the valudes with your database information:

| Engine    | DATABASE_URL                                        |
| --------- | --------------------------------------------------- |
| SQLite    | sqlite:////test.db                                  |
| MySQL     | mysql://username:password@localhost:port/example    |
| Postgress | postgres://username:password@localhost:5432/example |

4. Migrate the migrations: `$ pipenv run migrate` (skip if you have not made changes to the models on the `./src/api/models.py`)
5. Run the migrations: `$ pipenv run upgrade`
6. Run the application: `$ pipenv run start`

> Note: Codespaces users can connect to psql by typing: `psql -h localhost -U gitpod example`

### Undo a migration

You are also able to undo a migration by running

```sh
$ pipenv run downgrade
```

### Backend Populate Table Users

To insert test users in the database execute the following command:

```sh
$ flask insert-test-users 5
```

And you will see the following message:

```
  Creating test users
  test_user1@test.com created.
  test_user2@test.com created.
  test_user3@test.com created.
  test_user4@test.com created.
  test_user5@test.com created.
  Users created successfully!
```

### **Important note for the database and the data inside it**

Every Github codespace environment will have **its own database**, so if you're working with more people eveyone will have a different database and different records inside it. This data **will be lost**, so don't spend too much time manually creating records for testing, instead, you can automate adding records to your database by editing `commands.py` file inside `/src/api` folder. Edit line 32 function `insert_test_data` to insert the data according to your model (use the function `insert_test_users` above as an example). Then, all you need to do is run `pipenv run insert-test-data`.

### Front-End Manual Installation:

- Make sure you are using node version 20 and that you have already successfully installed and runned the backend.

1. Install the packages: `$ npm install`
2. Start coding! start the webpack dev server `$ npm run start`

## Publish your website!

This boilerplate it's 100% read to deploy with Render.com and Heroku in a matter of minutes. Please read the [official documentation about it](https://4geeks.com/docs/start/deploy-to-render-com).

### Contributors

This template was built as part of the 4Geeks Academy [Coding Bootcamp](https://4geeksacademy.com/us/coding-bootcamp) by [Alejandro Sanchez](https://twitter.com/alesanchezr) and many other contributors. Find out more about our [Full Stack Developer Course](https://4geeksacademy.com/us/coding-bootcamps/part-time-full-stack-developer), and [Data Science Bootcamp](https://4geeksacademy.com/us/coding-bootcamps/datascience-machine-learning).

You can find other templates and resources like this at the [school github page](https://github.com/4geeksacademy/).
