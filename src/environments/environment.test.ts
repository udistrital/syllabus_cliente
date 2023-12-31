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
  GESTOR_DOCUMENTAL_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/gestor_documental_mid/v1/',
  DOCUMENTO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/documento_crud/v2/',
  TERCEROS:'https://autenticacion.portaloas.udistrital.edu.co/apioas/terceros_crud/v1/',
  IDIOMAS_CRUD:'https://autenticacion.portaloas.udistrital.edu.co/apioas/idiomas_crud/v2/',
  SGA_MID:'https://autenticacion.portaloas.udistrital.edu.co/apioas/sga_mid/v1/',

  CONFIGURACION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/',
  CONF_MENU_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/menu_opcion_padre/ArbolMenus/', 
  TOKEN: {
    AUTORIZATION_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oauth2/authorize',
    CLIENTE_ID: 'SyAm2hZXYQh257Qq7g4X8bK7uSQa',
    RESPONSE_TYPE: 'id_token token',
    SCOPE: 'openid email role documento',
    REDIRECT_URL: 'https://pruebassyllabus.portaloas.udistrital.edu.co',
    SIGN_OUT_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oidc/logout',
    SIGN_OUT_REDIRECT_URL: 'https://pruebassyllabus.portaloas.udistrital.edu.co',
    AUTENTICACION_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/autenticacion_mid/v1/token/userRol',
  },
};