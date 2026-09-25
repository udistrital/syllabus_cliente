# syllabus_cliente

Cliente para la gestión de syllabus, parte del Sistema de Gestión Académica. Este proyecto está desarrollado con Angular y se mantiene como cliente independiente, ya preparado para integrarse a la infraestructura de microfrontends (single-spa).

## Especificaciones Técnicas

### Tecnologías Implementadas y Versiones

- [Angular](https://angular.io/docs) 16.2.0
  - Incluye Animations, Common, Compiler, Core, Forms, Platform-Browser, Platform-Browser-Dynamic, Router
- [Angular Material](https://material.angular.io/) 16.2.0
- [Angular CDK](https://material.angular.io/cdk/categories) 16.2.0
- [ngx-translate](https://github.com/ngx-translate/core) 15.0.0
  - Incluye ngx-translate Http Loader
- [Moment.js](https://momentjs.com/docs/) 2.29.4
- [RxJS](https://rxjs.dev/guide/overview) ~7.8.0
- [Single-spa](https://single-spa.js.org/) >=4.0.0
  - Incluye single-spa-angular 9.0.1
- [SweetAlert2](https://sweetalert2.github.io/) 11.7.28
- [spinner-util](https://www.npmjs.com/package/spinner-util) 0.0.3
- [ts-md5](https://github.com/cotag/ts-md5) 1.3.1
- [tslib](https://github.com/Microsoft/tslib) 2.3.0
- [Zone.js](https://github.com/angular/angular/tree/master/packages/zone.js) ~0.13.0

### Variables de Entorno

```javascript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4200/',
  entorno: 'test',
  autenticacion: true,
  notificaciones: false,
  menuApps: false,
  appname: 'sga',
  appMenu: 'sga',
  OIKOS_SERVICE: '',
  ACADEMICA_JBPM_SERVICE: '',
  HOMOLOGACION_DEP_JBPM_SERVICE: '',
  SYLLABUS_CRUD: '',
  GESTOR_DOCUMENTAL_MID: '',
  DOCUMENTO_SERVICE: '',
  TERCEROS: '',
  IDIOMAS_CRUD: '',
  SGA_MID: '',
  CONFIGURACION_SERVICE: '',
  CONF_MENU_SERVICE: '',
  TOKEN: {
    AUTORIZATION_URL: '',
    CLIENTE_ID: '',
    RESPONSE_TYPE: '',
    SCOPE: '',
    REDIRECT_URL: '',
    SIGN_OUT_URL: '',
    SIGN_OUT_REDIRECT_URL: '',
    AUTENTICACION_MID: '',
  },
};
```

## Ejecución del Proyecto

El proyecto se puede ejecutar como cliente independiente con sus propias rutas y autenticación.

1. Instalar las dependencias:

    ```bash
    npm install
    ```

2. Iniciar el proyecto:

    ```bash
    npm start
    ```

### Build de microfrontend

El mismo proyecto genera el bundle para la infraestructura de microfrontends:

```bash
npm run build:single-spa:syllabus-mf
```

### Root

El Root contiene la lógica de Single-SPA. Para ejecutarlo:

1. Clonar el repositorio del Root:

    ```bash
    git clone https://github.com/udistrital/sga_cliente_root
    ```

2. Acceder al directorio del repositorio clonado:

    ```bash
    cd sga_cliente_root
    ```

3. Instalar las dependencias:

    ```bash
    npm install
    ```

4. Iniciar el Root:

    ```bash
    npm start
    ```

### Core

El Core contiene componentes generales que construyen el layout y administran aspectos como la autenticación.

1. Clonar el repositorio del Core:

    ```bash
    git clone https://github.com/udistrital/core_mf_cliente
    ```

2. Acceder al directorio del repositorio clonado:

    ```bash
    cd core_mf_cliente
    ```

3. Instalar las dependencias:

    ```bash
    npm install
    ```

4. Iniciar el Core:

    ```bash
    npm start
    ```

## Ejecución Dockerfile
```bash
# Does not apply
```
## Ejecución docker-compose
```bash
# Does not apply
```
## Ejecución Pruebas

Pruebas unitarias powered by Karma

```bash
# run unit test
npm run test
```

## Estado CI

| Develop | Release 0.0.1 | Master |
| -- | -- | -- |
| [![Build Status](https://hubci.portaloas.udistrital.edu.co/api/badges/udistrital/syllabus_cliente/status.svg?ref=refs/heads/develop)](https://hubci.portaloas.udistrital.edu.co/udistrital/syllabus_cliente) | [![Build Status](https://hubci.portaloas.udistrital.edu.co/api/badges/udistrital/syllabus_cliente/status.svg?ref=refs/heads/release/0.0.1)](https://hubci.portaloas.udistrital.edu.co/udistrital/syllabus_cliente) | [![Build Status](https://hubci.portaloas.udistrital.edu.co/api/badges/udistrital/syllabus_cliente/status.svg)](https://hubci.portaloas.udistrital.edu.co/udistrital/syllabus_cliente) |

## Licencia

[This file is part of syllabus_cliente.](LICENSE)

syllabus_cliente is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

syllabus_cliente is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with syllabus_cliente. If not, see https://www.gnu.org/licenses/.
