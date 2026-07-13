# 🎨 Colorfly Studio — Generador de Paletas de Colores

Proyecto Integrador Módulo 1 · Henry Full Stack FT75  
Estudiante: Juan Camilo Castellanos Uribe

---

## ¿Qué es esta app?

Colorfly Studio es una aplicación web que permite la generación de paletas de colores de manera aleatoria. Esto ayuda a explorar combinaciones de colores de una forma rápida, sin tecnicismos.

Entre las funcionalidades, el usuario puede elegir cuántos colores quiere visualizar: 6, 8 o 9; también permite seleccionar el formato (HEX o HSL), bloquear colores a gusto, guardar paletas, y copiar cualquier color al portapapeles del sistema.

---

## ¿Cómo se usa?

1. Selecciona el tamaño de la paleta: **6**, **8** o **9** colores
2. Luego, selecciona el formato: **HEX** o **HSL**
3. Haz clic en **Generar paleta**
4. Los colores aparecen en pantalla — cada uno se llama **swatch** (así se le llama a una muestra de color, es un término estándar en diseño)
5. Puedes hacer clic en el candado (🔓) de un swatch para **bloquearlo** — ese color se mantiene cuando regeneras una nueva paleta
6. Haz clic en la fila del código (HEX o HSL) para **copiarlo** al portapapeles (aparecerá el ícono 📋)
7. Haz clic en el botón **Guardar paleta** para guardarla — puedes guardar hasta 5

---

## Demo en vivo

🔗 https://donjuanc.github.io/ColorFly_Studio/

---

## Cómo ejecutar local

1. Clona el repositorio usando bash:
   ```bash
   git clone https://github.com/DonJuanC/ProyectoM1_JuanCastellanos.git
   ```

2. Entra a la carpeta:
   ```bash
   cd ProyectoM1_JuanCastellanos
   ```

3. Abre el archivo `index.html` directamente en tu navegador

---

## Cómo desplegar en GitHub Pages

1. Asegúrate de que el repositorio sea **público** en GitHub
2. Entra a **Settings** del repositorio
3. En el menú izquierdo selecciona **Pages**
4. En **Branch** selecciona `main` y carpeta `/ (root)`
5. Haz clic en **Save**
6. Espera 1-2 minutos — GitHub genera la URL automáticamente

La URL tendrá este formato:
https://tu-usuario.github.io/nombre-del-repositorio/

Para este proyecto: https://donjuanc.github.io/ProyectoM1_JuanCastellanos/

---

## Por qué esta estructura visual

El proceso inicial fue de planeación de diseño: dibujar y ver cómo se vería aplicado este proyecto según mis preferencias y teniendo una experiencia de usuario fluida pero accesible.

Usé algunos conceptos aplicados en el diseño y en la parte técnica del desarrollo web:

**Los swatches** son tarjetas individuales que se muestran por cada color, ya que cada uno necesita ser operado de manera independiente (código de color, copiar código, bloquear)

**Los controles** decidí agruparlos y centrarlos en una barra o contenedor, para que el usuario los pueda manipular de una manera más sencilla, reduciendo el movimiento visual, dando además una estructura de orden.

**El botón guardar** gana protagonismo debajo de los controles solo cuando se genera una paleta. Ponerlo antes no tendría sentido.

**El mensaje de instrucción** aparece igualmente después de la primera generación de paleta. Esto guía al usuario para no saturar la pantalla de inicio.

**Los mensajes de confirmación (toasts)** van apareciendo en la parte inferior de la pantalla para no obstaculizar la visualización de la paleta.

**Las paletas guardadas** van apareciendo debajo de la paleta activa, y permiten guardar hasta 5 paletas, además de eliminarlas.

---

## Decisiones técnicas

**HTML semántico**  
Según los conceptos aprendidos, utilicé etiquetas como `header`, `main`, `section` y `footer` en lugar de `div` para todo. Esto permite accesibilidad para diferenciar cada elemento de la página, y se hace más legible el código.

**Script con `defer` en el `head`**  
El navegador descarga el JS en paralelo mientras procesa el HTML, y lo ejecuta cuando el DOM está listo.

**CSS con variables**  
Definí los colores y medidas que se repiten como variables en `:root`. Esto me permite cambiar los valores desde un solo lugar, que se pueden aplicar y actualizar en todos lados.

**CSS organizado en bloques**
El CSS se divide en secciones, usando comentarios separadores, con un reset inicial. Todo esto permite encontrar y modificar por segmentos.

**Flexbox y Grid**  
Con Flexbox alineé los controles, y con Grid mostré la paleta. Utilicé herramientas como `auto-fit` y `minmax` para que el diseño sea responsive, ya que los swatches se acomodan solos según cuántos hay y el ancho de la pantalla.

**JavaScript separado del HTML**  
En `app.js` reposa toda la interacción, el código está organizado en bloques: estado, generación de colores, referencias al DOM, funciones de UI y eventos.

**Idioma del código** 
Después de investigar sobre las mejores prácticas y estándares en la industria, la declaración de variables, funciones e IDs se hicieron en inglés.

**Nombres descriptivos — Clean Code**  
Adicional a lo anterior, lo cual hace parte del Principio de Responsabilidad Única (SRP), lo apliqué para entender que cada función hace una sola cosa. Los nombres describen exactamente qué hace cada función — `generateHexColor`, `renderPalette`, `showToast`, `copyColor`.

**Objetos de color**
Cada color que se genera tiene tres propiedades: `value` (para pintar el fondo), `hex` y `hsl`. Esto permite mostrar siempre ambos códigos (HEX y HSL) en la tarjeta, sin importar qué formato se haya elegido al generar la paleta, ya que el sistema calcula las conversiones automáticamente.

**Accesibilidad básica**  
- `aria-label` en secciones y botones para ser usado en lectores de pantalla
- `aria-live="polite"` en el contenedor de la paleta para anunciar cambios dinámicos
- `label` asociado a cada `input radio` — el radio está oculto visualmente pero accesible por teclado con `position: absolute; opacity: 0`
- Foco visible con `outline` de color acento para navegación con teclado
- Contraste suficiente entre texto y fondo
- Atributo `title` en íconos para usar tooltips en el navegador

**Refactorización y Clean Code (Segunda iteración)**
- **Consolidación del sistema de Notificaciones (Toasts)**: en revisión, se unificó de 6 elementos en HTML individuales a 1 único contenedor dinámico en Javascript, aplicando lo investigado sobre el principio DRY (*Don't Repeat Yourself*). Esto redujo el volumen del código y centralizó los estilos en CSS en una sola clase genérica.
- **Separación de responsabilidades con CSS/JS**: se reemplazó el control directo de visibilidad (`.style.display`) por una clase más útil en CSS (`.hidden`) gestionada mediante `classList.toggle`/`add`/`remove` desde Javascript.
- **Uso del DOM y rendimiento**: por optimización, se guardaron referencias constantes de elementos propensos a consultas repetitivas (como la marca `.title-colorfly` en los efectos de hover) para evitar que el navegador tenga que rastrear constantement el árbol HTML (DOM) en cada interacción.
- **Documentación estándar (JSDoc)**: aprendiendo términos, se integró limpieza de código redundante y se simplificaron los comentarios a su mínima expresión para tener un código ligero, que sea legible y fácil de explorar y mantener.

---

## Funcionalidades extra

**Bloqueo de colores**  
Al hacer clic en el candado de un swatch, se bloquea ese color. Al regenerar la paleta, los colores bloqueados se mantienen en su posición. El ícono cambia entre 🔓 y 🔒 según el estado. Un borde de acento indica visualmente que el color está bloqueado.

**Guardar paletas en localStorage**  
Las paletas se guardan en el navegador y persisten al recargar la página. El límite que establecí es 5 paletas — la más antigua se elimina automáticamente al superar ese límite. Cada paleta guardada muestra la fecha, cantidad de colores y formato, y puede eliminarse individualmente.

**Efecto hover en el título**  
Al pasar el mouse sobre un swatch, el título "Colorfly Studio" cambia al color de ese swatch. Al salir, vuelve al color original.

---

## Uso de IA

Usé Claude como apoyo durante todo el desarrollo. El uso fue en varios niveles:

**Consulta de conceptos y depuración**  
Cuando algo no funcionaba, describía el problema y analizábamos la causa. Varios bugs fueron encontrados y corregidos en este proceso — errores de escritura, IDs que no coincidían, selectores mal escritos.

**Nombres y organización — Clean Code**  
La IA me complementó sugiriendo nombres descriptivos en inglés para funciones, variables y referencias al DOM, aplicando el Principio de Responsabilidad Única desde el inicio del proyecto.

**Estructuración del CSS**  
La IA me entregó la sugerencia de organizar el CSS en bloques con comentarios separadores, empezando por reset y variables, y siguiendo el orden de aparición en el HTML.

**Accesibilidad**  
También le consulté sobre el uso de `aria-label`, `aria-live` y cómo mantener los radio buttons accesibles por teclado sin mostrar el círculo nativo.

**Soluciones puntuales fuera del módulo**  
Los siguientes casos usan código más avanzado, sugerido por la IA e identificado con comentarios en el código:
- `:has(input:checked)` — selector CSS moderno para detectar el radio seleccionado sin JS adicional
- `navigator.clipboard.writeText` — una API del navegador para copiar al portapapeles
- `hslToHex` — un algoritmo matemático de conversión entre espacios de color

**Los créditos extras — acompañado con IA**  
Para la elaboración de estos extras, la lógica de las funcionalidades fue desarrollada con apoyo de IA, pero revisada, ajustada y corregida, tales como su comportamiento y decisiones de diseño tomadas durante el proceso:
- Bloqueo de colores — lógica de `lockedColors[]`, `event.stopPropagation()` y diferenciación de clics en swatch vs ícono
- Guardar paletas en localStorage — estructura de datos, límite de 5 con `unshift`, `splice` y `pop`
- Efecto hover del título en "Colorfly" con color del swatch — `mouseover` y `mouseout`
- Se aplicó el concepto de @keyframes para animaciones

Todo el código fue revisado y entendido antes de integrarlo al proyecto.

---

## Elaborado por:

Juan Camilo Castellanos Uribe  
Full Stack · Henry Full Stack FT75 · Mayo 2026
