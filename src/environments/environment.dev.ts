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
  //OIKOS_SERVICE:'http://pruebasapi.intranetoas.udistrital.edu.co:8087/v2/',
  ACADEMICA_JBPM_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/academica_jbpm/v2/',
  //ACADEMICA_JBPM_SERVICE:'http://busservicios.intranetoas.udistrital.edu.co:8282/wso2eiserver/services/academica_pruebas/',
  HOMOLOGACION_DEP_JBPM_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/dependencias_api/v1/',
  //HOMOLOGACION_DEP_JBPM_SERVICE:'http://busservicios.intranetoas.udistrital.edu.co:8282/wso2eiserver/services/servicios_homologacion_dependencias/',
  SYLLABUS_CRUD: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/syllabus_crud/v1/',
  //SYLLABUS_CRUD:'https://d1bpmwg4t8.execute-api.us-east-1.amazonaws.com/Prod/',
  //SYLLABUS_MID: 'http://localhost:8096/v1/',
  //ADMISIONES_MID:'http://localhost:8095/v1/',
  SYLLABUS_MID: 'http://pruebasapi3.intranetoas.udistrital.edu.co:8555/',
  ADMISIONES_MID: 'http://pruebasapi3.intranetoas.udistrital.edu.co:8547/',
  GESTOR_DOCUMENTAL_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/gestor_documental_mid/v1/',
  //GESTOR_DOCUMENTAL_MID: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8199/v1/',
  DOCUMENTO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/documento_crud/v2/',
  //DOCUMENTO_SERVICE:'http://pruebasapi.intranetoas.udistrital.edu.co:8094/v1/',
  TERCEROS: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/terceros_crud/v1/',
  //TERCEROS:'http://pruebasapi.intranetoas.udistrital.edu.co:8121/v1/',
  IDIOMAS_CRUD: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/idiomas_crud/v2/',

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