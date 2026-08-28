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
| ...    | ...                    | ...                                          |

## MODELO DE DATOS:

- UML en formato texto [Ver UML](/docs/database/uml.txt) adaptado a https://dbdiagram.io/

![UML](/docs/database/UML.png)

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
