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
    SINTOMAS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/sintomas_crud/v1/',
    PRUEBA: 'http://localhost:8080/v1/',
    //SERVICES PLANEACIÓN
    PLANES_CRUD: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8523/', //'http://localhost:8070/', 
    PLANES_MID: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8524/v1/',
    PLANES_MID_PROXY: 'https://autenticacion.portaloas.udistrital.edu.co/go_api/planeacion_mid/v1/',
    OIKOS_SERVICE: 'http://api.intranetoas.udistrital.edu.co:8087/v1/',
    PARAMETROS_SERVICE: 'http://pruebasapi.intranetoas.udistrital.edu.co:8510/v1/',
    RESOLUCIONES_DOCENTES_SERVICE: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8529/v1/',
    GESTOR_DOCUMENTAL_MID: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8199/v1/',
    DOCUMENTO_SERVICE: 'https://pruebasapi.intranetoas.udistrital.edu.co:8094/v1/',
   //
   //Autenticacion
   //
    // PLANES_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/planeacion_mid/v1/',
    // PLANES_CRUD: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/planes_crud/',
    // OIKOS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/oikos_crud_api/v2/',
    // PARAMETROS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/parametros/v1/',
    // RESOLUCIONES_DOCENTES_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/resoluciones_docentes_mid/v2/',
    // GESTOR_DOCUMENTAL_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/gestor_documental_mid/v1/',
    // DOCUMENTO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/documento_crud/v2/',
    ///
    KRONOS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/plan_cuentas_mongo_crud/v1/',
    PRUEBAS: 'http://pruebasapi.intranetoas.udistrital.edu.co:8121/v1/',
    TERCEROS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/terceros_crud/v1/',
    ACADEMICA_JBPM_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/academica_jbpm/v1/',
    //PARAMETROS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/parametros/v1/',
    CONFIGURACION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/',
    CONF_MENU_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/menu_opcion_padre/ArbolMenus/',
    NOTIFICACION_SERVICE: 'wss://pruebasapi.portaloas.udistrital.edu.co:8116/ws',
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