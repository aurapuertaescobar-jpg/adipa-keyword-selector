# Brief · Selección de KWs

## Problema que resuelve

Hoy el análisis de keywords para determinar si sirven para generar contenido es 100% manual y lento:
1. La Coordinadora SEO busca cada keyword en Google para 4 países (Chile, México, Colombia, Argentina).
2. Copia las 3 URLs top por país (12 URLs totales).
3. Abre cada URL, la lee, juzga si es informativa o comercial, y toma notas sobre su estructura, autoridad y lenguaje.
4. Registra todo en una tabla y decide manualmente si la keyword sirve o no.

Este proceso depende del criterio presente de la coordinadora, no es reproducible, y requiere múltiples búsquedas manuales en Google. La herramienta **automatiza la búsqueda de SERPs, el análisis de contenido y el veredicto**, permitiendo evaluar keywords de forma consistente y documentada.

---

## Usuario principal y roles

**Usuario único en esta versión (v1):** Coordinadora SEO

- **Acciones:** carga keywords, dispara análisis automático, revisa resultados, toma decisión sobre si crear contenido.
- **Permisos:** acceso de lectura/escritura a todo (no hay aprobación de terceros en v1).

---

## Pantallas / piezas (en orden del journey)

1. **Dashboard / Lista de keywords** — Vista principal. Muestra todas las keywords cargadas con su estado actual (Pendiente, Analizando, Sirve, No funciona). Permite filtrar y ordenar.

2. **Formulario: Cargar keyword** — Entrada simple. La coordinadora escribe o pega una keyword (o varias si es lista pegada). Sistema detecta repetidas.

3. **Ejecución automática del análisis** — Proceso en background (no es una pantalla visible, pero sí es una pieza del flujo):
   - Consulta API SERP (proveedor a definir: Semrush es candidato) para traer top 3 URLs por país × 4 países.
   - Extrae contenido de cada URL (scraping).
   - Usa IA para clasificar cada URL (informativa/comercial) y generar observación automatizada.
   - Calcula veredicto agregado.
   - Guarda todo con marca de tiempo.

4. **Tabla de resultados por keyword** — Muestra las 12 URLs (3 × 4 países) en una tabla con:
   - País (columna diferenciadora)
   - Posición en búsqueda
   - Enlace / URL
   - Keywords que posiciona (texto extraído)
   - **Clasificación estructurada:** Dropdown (Informativo / Comercial) — campo que la IA completa automáticamente.
   - **Observación libre:** Texto con detalles sobre tipo de contenido, estructura, idioma, autoridad, etc. (generado por IA).
   - **Alerta:** Indicador visual si esa URL es comercial (alerta individual por fila).

5. **Veredicto de la keyword** — Resultado agregado calculado automáticamente:
   - Texto claro: "✓ Esta keyword sirve para contenido" o "✗ Esta keyword NO sirve para contenido".
   - Muestra el motivo: ej. "5 de 12 URLs son comerciales (umbral: 6)" o "Todas las URLs son informativas".

6. **Historial de versiones** — Acceso a corridas anteriores de la misma keyword (con fecha/hora). Permite ver cómo cambió el análisis de esa keyword en el tiempo. Cada versión es de solo lectura.

---

## Datos por pantalla

### 1. Dashboard / Lista de keywords
**Entrada:** (ninguna, es la pantalla de inicio)  
**Salida:**
- Lista de keywords con:
  - Nombre de la keyword
  - Estado (Pendiente / Analizando / Sirve / No funciona)
  - Fecha de análisis más reciente
  - Botón para ver detalle / editar / reanálizar

### 2. Formulario: Cargar keyword
**Entrada:**
- Campo de texto: keyword (o lista pegada, separada por saltos de línea o comas)

**Salida:**
- Validación: detecta duplicados y avisa.
- Crea registro en estado "Pendiente".
- Redirige a dashboard.

### 3. Ejecución automática (background)
**Entrada:**
- ID de keyword
- Fecha/hora de inicio

**Salida:**
- Para cada una de las 12 URLs (3 × 4 países):
  - `url_id`, `pais`, `posicion`, `enlace`, `clasificacion_estructurada` (Informativo/Comercial), `observacion_libre`, `alerta` (booleano)
- Veredicto agregado: `palabra_clave_sirve` (booleano)
- Metadata: `fecha_analisis`, `version_numero`

### 4. Tabla de resultados por keyword
**Entrada:**
- ID de keyword + versión (por defecto, la más reciente)

**Salida:**
- Tabla de 12 filas (3 URLs × 4 países) con columnas:
  - País, Posición, Enlace, Keywords posicionadas, Clasificación, Observación, Alerta (icono rojo si comercial)

### 5. Veredicto de la keyword
**Entrada:**
- Recuento de URLs comerciales vs. informativas (totales 12)

**Salida:**
- Veredicto final (texto amigable + lógica)
- Desglose: "X de 12 URLs son comerciales"

### 6. Historial de versiones
**Entrada:**
- ID de keyword

**Salida:**
- Lista de todas las corridas:
  - Fecha/hora, versión #, veredicto de esa versión
  - Botón para ver detalles de esa versión (redirige a Tabla de resultados con esa versión)

---

## Reglas de negocio

### Regla 1: Alerta individual por URL comercial
**Si** una URL es clasificada como "Comercial" (campo estructurado)  
**Entonces** se marca con una alerta visual en esa fila de la tabla.  
*Nota: La alerta es informativa; una sola URL comercial no descalifica la keyword.*

### Regla 2: Veredicto agregado por mayoría
**Si** 6 o más de las 12 URLs analizadas son clasificadas como "Comercial"  
**Entonces** el veredicto final de la keyword es "NO FUNCIONA" (✗).  
**Si** menos de 6 URLs son comerciales  
**Entonces** el veredicto es "SIRVE" (✓).

### Regla 3: Veredicto único global por keyword
**Si** se analizan las 12 URLs (3 × 4 países) en una sola corrida  
**Entonces** se genera un único veredicto para toda la keyword (no hay veredictos separados por país).

### Regla 4: Historial con marca de tiempo
**Si** se re-analiza una keyword que ya existe en el sistema  
**Entonces** se guarda una nueva versión con fecha/hora de ejecución, sin sobrescribir las corridas anteriores.

### Regla 5: Clasificación automática por IA
**Si** se dispara un análisis de keyword  
**Entonces** la herramienta consulta la API SERP, extrae contenido y usa IA para clasificar cada URL como Informativo/Comercial, sin intervención manual de la coordinadora.

---

## Fuera de alcance (v1)

- **Override o edición manual** de la clasificación que genera la IA (si la herramienta se equivoca al clasificar una URL, no hay forma de corregirla en esta versión).
- **Integración con Semrush** para importar keywords de forma automática (la carga es manual en v1).
- **Roles adicionales** (redactores, lead SEO, aprobadores). Solo la Coordinadora SEO usa la herramienta.
- **Notificaciones automáticas** o **archivado automático** cuando una keyword es descartada (el veredicto es solo un estado visible; la coordinadora actúa manualmente fuera de esta herramienta).
- **Países dinámicos** — Los 4 países (Chile, México, Colombia, Argentina) son fijos en v1.
- **Veredicto por país** — El análisis y veredicto son globales, no por país.
- **Proceso de redacción del contenido** — Esta herramienta solo decide si la keyword sirve o no. La escritura del artículo vive en otro flujo/herramienta.

---

## Supuestos pendientes de validación

- El proveedor de SERP (Semrush MCP vs. otra API como SerpApi) será elegido en etapa de diseño técnico.
- El límite de keywords que se pueden analizar en una sola carga (¿1, 10, 100?) no está definido; se asume sin límite inicial, a revisar en testing.
- La clasificación IA de Informativo/Comercial se asume que es confiable en 90%+ de casos; si la tasa de error es mayor, el flujo necesitará revisión manual en v2.

---

## Siguiente paso

Diseñar la arquitectura técnica y definir:
1. Stack de desarrollo (frontend, backend, DB).
2. Proveedor SERP final.
3. Modelo IA para clasificación de URLs (LLM, fine-tune, heurística).
4. Esquema de base de datos (estructura de `keywords`, `urls_analizadas`, `versiones`).

---

# Retrospectiva

1. ¿Qué pregunta de Claude te hizo dar cuenta de algo que no tenías claro del flujo?
La pregunta sobre el umbral de decisión: no había pensado en un número exacto para decidir si una keyword servía o no. Terminé definiendo que si 6 de las 12 URLs analizadas son comerciales, el contenido no funciona — antes solo tenía la idea vaga de "la mayoría".

2. ¿Qué diferencia hubo entre tu mapa inicial y lo que terminaste construyendo?
La columna de país. En mi mapa dibujado a mano era solo una nota al margen ("hay que agregar esto"), pero en la app terminó siendo parte central de cómo se organizan y comparan los datos.

3. Si tuvieras que hacer este flujo de verdad para ADIPA, ¿cuál sería el primer riesgo o pieza faltante?
Dos cosas: el costo y la confiabilidad de depender de APIs reales (Claude y la búsqueda), que pueden fallar o salir caras con uso constante; y que la carga de keywords sigue siendo manual, así que el ahorro real de tiempo es menor de lo que parece a primera vista.
