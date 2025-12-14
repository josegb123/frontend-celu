# Plan de Acción Detallado para Agente IA: Refactorización del Frontend de CeluVariedades

Este documento describe un plan de acción para que un agente IA realice una refactorización integral del frontend de CeluVariedades. El plan se enfoca en la modularización, tipado, manejo de errores, rendimiento y calidad general del código.

## Objetivo General:
Transformar el frontend en una aplicación más escalable, mantenible y organizada, siguiendo las mejores prácticas de desarrollo.

---

## Tareas Específicas del Agente IA:

### **FASE 1: Pre-análisis y Preparación (Realizada por el usuario/sistema, pero el agente debe estar consciente)**
- **1.1. Análisis Inicial del Contexto:** El agente ya recibió el prompt con el código de la vista `ReportesAdminView.vue` y el contexto del proyecto.
- **1.2. Identificación de Dependencias:** El agente ha identificado las interfaces en `src/interfaces/estadisticas.ts` y el servicio `src/services/estadisticasService.ts`.

### **FASE 2: Refactorización de Tipos y Interfaces**
- **2.1. Creación de Directorio para Reportes:**
    - **Acción:** Asegurarse de que el directorio `src/interfaces/reports` exista.
    - **Justificación:** Centralizar interfaces relacionadas con reportes para una mejor organización.
    - **Herramientas:** `run_shell_command('mkdir -p src/interfaces/reports')`.
- **2.2. Migración de Interfaces de Reportes:**
    - **Acción:** Mover todas las interfaces relacionadas con reportes de `src/interfaces/estadisticas.ts` a un nuevo archivo `src/interfaces/reports/report_types.ts`.
    - **Justificación:** Evitar un archivo de interfaces monolítico y mejorar la coherencia por dominio.
    - **Herramientas:** `read_file`, `write_file`.
- **2.3. Limpieza de `src/interfaces/estadisticas.ts`:**
    - **Acción:** Vaciar el contenido de `src/interfaces/estadisticas.ts` si todas las interfaces han sido movidas, o eliminar el archivo si ya no es necesario.
    - **Justificación:** Evitar archivos vacíos o redundantes.
    - **Herramientas:** `write_file`.
- **2.4. Actualización de `src/services/estadisticasService.ts`:**
    - **Acción:** Modificar las importaciones en `src/services/estadisticasService.ts` para que apunten a `src/interfaces/reports/report_types.ts` en lugar del archivo original. Eliminar importaciones de tipos no utilizados si aplican.
    - **Justificación:** Asegurar la correcta referencia a las nuevas ubicaciones de los tipos.
    - **Herramientas:** `read_file`, `write_file`.

### **FASE 3: Modularización de la Lógica de Reportes (Composables)**
- **3.1. Creación de `useReportGenerator.ts`:**
    - **Acción:** Implementar un composable en `src/composables/useReportGenerator.ts` que encapsule la lógica de selección de reportes, gestión de estado reactivo (loading, reportData, error), y el método `generateReport`. Debe incluir las propiedades computadas para el type narrowing.
    - **Justificación:** Centralizar la lógica de generación de reportes, haciéndola reutilizable y desacoplada de la vista.
    - **Herramientas:** `write_file`.
- **3.2. Creación de `useReportExporter.ts`:**
    - **Acción:** Implementar un composable en `src/composables/useReportExporter.ts` que gestione la lógica de exportación a PDF y Excel. Recibirá los datos y parámetros necesarios para la exportación.
    - **Justificación:** Separar la lógica de exportación de la vista principal, mejorando la modularidad.
    - **Herramientas:** `write_file`.

### **FASE 4: Modularización de la Interfaz de Usuario de Reportes (Componentes Vue)**
- **4.1. Creación de `src/components/Reportes`:**
    - **Acción:** Asegurarse de que el directorio `src/components/Reportes` exista.
    - **Justificación:** Agrupar componentes UI relacionados con reportes.
    - **Herramientas:** `run_shell_command('mkdir -p src/components/Reportes')`.
- **4.2. Creación de `ReportFilters.vue`:**
    - **Acción:** Extraer la sección de filtros de `ReportesAdminView.vue` a `src/components/Reportes/ReportFilters.vue`. Este componente debe aceptar los valores de filtro como props (v-model) y emitir eventos para cambios y para disparar la generación del reporte.
    - **Justificación:** Desacoplar la UI de filtros de la vista principal.
    - **Herramientas:** `read_file`, `write_file`.
- **4.3. Creación de Componentes de Visualización Específicos por Reporte:**
    - **Acción:** Para cada tipo de reporte, crear un componente Vue específico en `src/components/Reportes/` (ej. `ReportBajoStockTable.vue`, `ReportVentasAgrupadasTable.vue`, `ReportTicketPromedioDisplay.vue`). Cada uno recibirá sus datos tipados como `props`.
    - **Justificación:** Aislar la lógica de visualización para cada reporte, mejorando la reusabilidad y mantenibilidad.
    - **Herramientas:** `write_file`.
- **4.4. Creación de `ReportDisplayContainer.vue`:**
    - **Acción:** Implementar un componente dinámico en `src/components/Reportes/ReportDisplayContainer.vue` que, basándose en el `selectedReport`, renderice el componente de visualización específico correspondiente.
    - **Justificación:** Centralizar la lógica de conmutación de reportes, manteniendo la vista principal limpia.
    - **Herramientas:** `write_file`.

### **FASE 5: Actualización de la Vista Principal `ReportesAdminView.vue`**
- **5.1. Refactorización de `ReportesAdminView.vue`:**
    - **Acción:** Reescribir `ReportesAdminView.vue` para que utilice los composables `useReportGenerator` y `useReportExporter`, y los componentes `ReportFilters` y `ReportDisplayContainer`.
    - **Justificación:** Simplificar la vista principal, delegando la lógica a los composables y la UI a los componentes hijos.
    - **Herramientas:** `read_file`, `write_file`.

### **FASE 6: Verificación y Correcciones**
- **6.1. Revisión de Formato Numérico y Potenciales Errores de Rango:**
    - **Acción:** Revisar la visualización de datos numéricos en los nuevos componentes. Si se detecta el problema de números fuera de rango, corregirlo (ej. aplicando un `Number()` explícito o validación al parsear). Aplicar formato de moneda (`formatCurrency`) o número (`formatNumber`) donde sea apropiado.
    - **Justificación:** Asegurar la correcta representación de los datos y prevenir errores de visualización.
    - **Herramientas:** `read_file`, `replace`, `write_file`, `src/utils/formatters.ts` (creado si es necesario).
- **6.2. Ejecutar Linting y Formatting:**
    - **Acción:** Asegurar que todos los archivos modificados cumplan con los estándares de ESLint y Prettier.
    - **Justificación:** Mantener la consistencia del código base.
    - **Herramientas:** `run_shell_command('npm run lint -- --fix')`, `run_shell_command('npm run format')`.

---
Este plan busca una refactorización controlada y modular, que no solo resuelve el problema inmediato en `ReportesAdminView.vue`, sino que establece las bases para un desarrollo más robusto en todo el proyecto.
