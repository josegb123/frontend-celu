# Documentación del Proyecto Celuvariedades Frontend

Este documento proporciona una guía detallada para entender, instalar y usar el proyecto frontend de Celuvariedades.

---

## 1. Instalación

Para configurar y ejecutar este proyecto en tu entorno local, sigue los siguientes pasos. Esta guía está diseñada para ser clara, incluso para usuarios sin experiencia previa con Git o el ecosistema de Node.js.

### Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu sistema:

*   **Node.js**: Entorno de ejecución de JavaScript. Se recomienda usar la versión LTS (Long Term Support).
    *   Puedes descargarlo desde la [página oficial de Node.js](https://nodejs.org/).
*   **pnpm**: Un gestor de paquetes rápido y eficiente para Node.js.
    *   Para instalar pnpm globalmente, abre tu terminal y ejecuta:
        ```bash
        npm install -g pnpm
        ```

### Pasos de Instalación

1.  **Obtener el Código Fuente:**
    *   **Opción A (Con Git - Recomendado si tienes Git):**
        Abre tu terminal y clona el repositorio ejecutando el siguiente comando. Esto descargará todo el código del proyecto a tu máquina.
        ```bash
        git clone <URL_DEL_REPOSITORIO> celuvariedades-frontend
        ```
        Reemplaza `<URL_DEL_REPOSITORIO>` con la URL real de tu repositorio Git (por ejemplo, `https://github.com/tu-usuario/celuvariedades-frontend.git`).
    *   **Opción B (Sin Git - Descarga manual):**
        Si no tienes Git o prefieres no usar la línea de comandos para clonar:
        1.  Ve a la página del repositorio en tu navegador.
        2.  Busca un botón que diga "Code" (Código) y haz clic en él.
        3.  Selecciona "Download ZIP" (Descargar ZIP).
        4.  Una vez descargado, descomprime el archivo ZIP en la ubicación deseada de tu computadora. Renombra la carpeta resultante a `celuvariedades-frontend` si es necesario.

2.  **Navegar al Directorio del Proyecto:**
    Abre tu terminal y navega a la carpeta donde descargaste el proyecto:
    ```bash
    cd celuvariedades-frontend
    ```

3.  **Instalar Dependencias:**
    Una vez dentro del directorio del proyecto, instala todas las dependencias necesarias. pnpm leerá el archivo `package.json` y descargará todo lo que el proyecto necesita para funcionar.
    ```bash
    pnpm install
    ```

4.  **Configuración del Entorno (`.env`):**
    Este proyecto puede requerir variables de entorno para funcionar correctamente (por ejemplo, la URL de la API backend).
    *   Crea un archivo llamado `.env` en la raíz del proyecto (al mismo nivel que `package.json`).
    *   Consulta con el desarrollador del backend o revisa la documentación interna para saber qué variables son necesarias y sus valores. Un ejemplo común es:
        ```
        VITE_APP_API_URL=http://localhost:8000/api
        ```

5.  **Ejecutar el Servidor de Desarrollo:**
    Para iniciar la aplicación en modo de desarrollo, con recarga en caliente y herramientas para desarrolladores:
    ```bash
    pnpm dev
    ```
    La aplicación estará disponible en tu navegador, generalmente en `http://localhost:5173` (o el puerto que se indique en la terminal).

6.  **Compilar para Producción:**
    Cuando el proyecto esté listo para ser desplegado, puedes compilarlo para producción. Esto creará una versión optimizada y estática de la aplicación en la carpeta `dist/`.
    ```bash
    pnpm build
    ```

---

## 2. Uso

Una vez que la aplicación esté ejecutándose (generalmente con `pnpm dev` en desarrollo), puedes acceder a ella a través de tu navegador web en la dirección proporcionada por la terminal (ej. `http://localhost:5173`).

Este es el frontend de un sistema de gestión de punto de venta (POS) e inventario, lo que implica funcionalidades para:
*   Autenticación de usuarios.
*   Gestión de productos.
*   Realización de ventas.
*   Administración de cuentas por cobrar.
*   Gestión de proveedores.
*   Visualización de movimientos financieros y estadísticas.

---

## 3. Frontend (Vue.js 3 y TypeScript)

El frontend está construido utilizando:
*   **Vue.js 3**: Framework progresivo para construir interfaces de usuario.
*   **TypeScript**: Superconjunto de JavaScript que añade tipado estático, mejorando la robustez y el mantenimiento del código.
*   **Pinia**: Solución de gestión de estado ligero y flexible para Vue.js.
*   **Vue Router**: Librería oficial para el enrutamiento de la aplicación.
*   **Vite**: Herramienta de construcción rápida para el desarrollo frontend.

---

## 4. Rutas y Vistas

La aplicación utiliza `Vue Router` para gestionar la navegación.

*   **Definición de Rutas**: Todas las rutas de la aplicación se definen en `src/router/index.ts`. Este archivo central mapea las URLs a los componentes de vista correspondientes y puede incluir guardas de navegación (middlewares) para control de acceso (por ejemplo, rutas protegidas que requieren autenticación).

*   **Componentes de Vista (`src/views/`)**: Esta carpeta contiene los componentes de alto nivel que representan páginas completas de la aplicación. Cada archivo `.vue` aquí generalmente corresponde a una ruta específica y actúa como un contenedor para otros componentes más pequeños.
    *   Ejemplos: `HomeView.vue`, `ProductAdminView.vue`, `VentaPOS.vue`.

---

## 5. Tareas por Hacer

*   [ ] Implementar pruebas unitarias y de integración para componentes y servicios clave.
*   [ ] Mejorar la gestión de errores y la retroalimentación al usuario.
*   [ ] Optimizar la carga de datos y el rendimiento general de la aplicación.
*   [ ] Revisar y mejorar la accesibilidad (a11y) de la interfaz de usuario.
*   [ ] Actualizar la documentación con detalles específicos de la API y modelos de datos.

---

## 6. Estructura y Arquitectura

La estructura de carpetas del proyecto sigue una organización modular, facilitando la escalabilidad y el mantenimiento:

*   **`src/`**: Contiene todo el código fuente de la aplicación.
    *   **`assets/`**: Archivos estáticos como imágenes, iconos, y archivos CSS globales (`base.css`, `main.css`).
    *   **`components/`**: Componentes Vue reutilizables. Están organizados en subcarpetas lógicas según su funcionalidad o área de la aplicación (ej., `products/`, `users/`, `shared/`, `forms/`, `VentaPOS/`).
        *   `shared/`: Componentes genéricos que pueden ser usados en cualquier parte de la aplicación (ej., `BaseModal.vue`, `NotificationModal.vue`).
    *   **`http/`**: Configuración y clientes HTTP, como `laravelApi.ts` para interactuar con el backend de Laravel.
    *   **`interfaces/`**: Definiciones de interfaces TypeScript (`.ts`) que tipan los modelos de datos de la aplicación (ej., `IProduct.ts`, `IUser.ts`, `IVenta.ts`). Esto asegura la coherencia de los datos en toda la aplicación.
    *   **`router/`**: Contiene la configuración de `Vue Router` (`index.ts`), que define las rutas de navegación de la aplicación y sus componentes asociados.
    *   **`scss/`**: Archivos SCSS para estilos preprocesados, como `_vars.scss` para variables de diseño.
    *   **`services/`**: Módulos que encapsulan la lógica para interactuar con la API backend. Cada servicio se encarga de las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para una entidad específica (ej., `AuthService.ts`, `ProductoService.ts`, `VentaService.ts`).
    *   **`store/`**: Módulos de estado global utilizando Pinia. Cada "store" gestiona un subconjunto específico del estado de la aplicación (ej., `authStore.ts` para la autenticación, `InventoryStore.ts` para el inventario, `themeStore.ts` para el tema).
    *   **`types/`**: Definiciones de tipos globales o de terceros (`lodash.d.ts`).
    *   **`views/`**: Componentes de nivel superior que representan las "páginas" principales de la aplicación. Estos componentes suelen importar y organizar otros componentes más pequeños para construir la interfaz de usuario completa de una vista.
    *   **`App.vue`**: El componente raíz de la aplicación.
    *   **`main.ts`**: El punto de entrada de la aplicación, donde se inicializan Vue, Pinia, Vue Router y se monta la aplicación.
