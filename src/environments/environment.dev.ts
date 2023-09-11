/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

export const environment = {
    production: false,
    entorno: 'test',
    autenticacion: true,
    notificaciones: false,
    menuApps: false,
    appname: 'sga',
    appMenu: 'sga',
    OIKOS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/oikos_crud_api/v2/',
    ACADEMICA_JBPM_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/academica_jbpm/v2/',
    HOMOLOGACION_DEP_JBPM_SERVICE:'https://autenticacion.portaloas.udistrital.edu.co/apioas/dependencias_api/v1/',
    SYLLABUS_CRUD:'https://autenticacion.portaloas.udistrital.edu.co/apioas/syllabus_crud/v1/',

    CONFIGURACION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/',
    CONF_MENU_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/menu_opcion_padre/ArbolMenus/', 
    TOKEN: {
      AUTORIZATION_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oauth2/authorize',
      CLIENTE_ID: 'e36v1MPQk2jbz9KM4SmKhk8Cyw0a',
      RESPONSE_TYPE: 'id_token token',
      SCOPE: 'openid email role documento',
      REDIRECT_URL: 'http://localhost:4200/',
      SIGN_OUT_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oidc/logout',
      SIGN_OUT_REDIRECT_URL: 'http://localhost:4200/',
      AUTENTICACION_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/autenticacion_mid/v1/token/userRol',
    },
  };