// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  entorno: 'test',
  autenticacion: true,
  notificaciones: false,
  menuApps: false,
  appname: 'sga',
  appMenu: 'sga',
  OIKOS_SERVICE: 'http://api.intranetoas.udistrital.edu.co:8087/v1/',
  ACADEMICA_JBPM_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/academica_jbpm/v2/',
  HOMOLOGACION_DEP_JBPM_SERVICE:'http://busservicios.intranetoas.udistrital.edu.co:8282/wso2eiserver/services/servicios_homologacion_dependencias/',
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
    CLIENTE_ID: 'e36v1MPQk2jbz9KM4SmKhk8Cyw0a',
    RESPONSE_TYPE: 'id_token token',
    SCOPE: 'openid email',
    REDIRECT_URL: 'http://localhost:4200/',
    SIGN_OUT_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oidc/logout',
    SIGN_OUT_REDIRECT_URL: 'http://localhost:4200/',
    AUTENTICACION_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/autenticacion_mid/v1/token/userRol',
  },
};