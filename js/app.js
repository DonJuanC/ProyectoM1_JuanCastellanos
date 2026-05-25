/**
 * Estado global de la aplicación
 */
let colorCount = 6;
let activeFormat = 'hex';
let lockedColors = [];
let currentPalette = [];

// ==========================================================================
// GENERACIÓN Y CONVERSIÓN DE COLORES
// ==========================================================================

/**
 * Convierte un número decimal (0-255) a su equivalente en hexadecimal de dos dígitos.
 * @param {number} value - El valor decimal del canal de color (R, G o B).
 * @returns {string} El valor hexadecimal de dos caracteres con ceros a la izquierda.
 */
const generateHexChannel = (value) => {
    return value.toString(16).padStart(2, '0');
};

/**
 * Convierte valores de color HSL a su equivalente en formato hexadecimal (HEX).
 * @param {number} h - Tono (Hue) entre 0 y 360.
 * @param {number} s - Saturación (Saturation) entre 0 y 100.
 * @param {number} l - Luminosidad (Lightness) entre 0 y 100.
 * @returns {string} El color en formato hexadecimal '#RRGGBB'.
 */
const hslToHex = (h, s, l) => {
    s /= 100;
    l /= 100;

    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    const r = Math.round(f(0) * 255);
    const g = Math.round(f(8) * 255);
    const b = Math.round(f(4) * 255);

    return `#${generateHexChannel(r)}${generateHexChannel(g)}${generateHexChannel(b)}`;
};

/**
 * Convierte valores RGB a su equivalente en formato HSL como cadena CSS.
 * @param {number} r - Rojo (0-255).
 * @param {number} g - Verde (0-255).
 * @param {number} b - Azul (0-255).
 * @returns {string} El color en formato 'hsl(H, S%, L%)'.
 */
const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
};

/**
 * Genera un color aleatorio en formato Hexadecimal (HEX).
 * @returns {object} Objeto con el valor CSS, el código HEX y el equivalente HSL.
 */
const generateHexColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const hex = `#${generateHexChannel(r)}${generateHexChannel(g)}${generateHexChannel(b)}`;

    return {
        value: hex,
        hex,
        hsl: rgbToHsl(r, g, b)
    };
};

/**
 * Genera un color aleatorio en formato HSL con valores armoniosos.
 * Utiliza saturación alta (50%-100%) y luminosidad controlada (30%-70%) para garantizar
 * que los colores resultantes sean legibles, atractivos y aptos para diseño web.
 * @returns {object} Objeto con el valor HSL, el código HEX equivalente y el formato HSL.
 */
const generateHslColor = () => {
    const h = Math.floor(Math.random() * 361);
    const s = Math.floor(Math.random() * 51) + 50;
    const l = Math.floor(Math.random() * 41) + 30;

    const hslString = `hsl(${h}, ${s}%, ${l}%)`;

    return {
        value: hslString,
        hex: hslToHex(h, s, l),
        hsl: hslString
    };
};

/**
 * Decide y genera un color aleatorio según el formato activo configurado ('hex' o 'hsl').
 * @returns {object} Objeto de color generado.
 */
const generateColor = () => {
    if (activeFormat === 'hex') {
        return generateHexColor();
    } else {
        return generateHslColor();
    }
};

/**
 * Genera una paleta de colores del tamaño solicitado.
 * Si existen colores bloqueados previamente, los mantiene en la misma posición.
 * @param {number} count - Cantidad de colores a generar (6, 8 o 9).
 * @returns {array} Array de objetos de color generados.
 */
const generatePalette = (count) => {
    const palette = [];

    for (let i = 0; i < count; i++) {
        if (lockedColors[i]) {
            palette.push(lockedColors[i]);
        } else {
            palette.push(generateColor());
        }
    }

    return palette;
};

// ==========================================================================
// REFERENCIAS AL DOM
// ==========================================================================
const generateBtn = document.getElementById('btn-generate');
const paletteContainer = document.getElementById('palette-container');
const formatMessage = document.getElementById('active-format');
const sizeButtons = document.querySelectorAll('.size-btn');
const formatRadios = document.querySelectorAll('input[name="format"]');
const usageHint = document.querySelector('.usage-hint');
const saveBar = document.getElementById('save-bar');
const btnSave = document.getElementById('btn-save');
const savedSection = document.getElementById('saved-section');
const savedContainer = document.getElementById('saved-container');

// Elementos de UI unificados para optimización del DOM
const toast = document.getElementById('toast-notification');
const titleColorfly = document.querySelector('.title-colorfly');

// ==========================================================================
// FUNCIONES DE INTERFAZ DE USUARIO (UI)
// ==========================================================================

let toastTimeout;
/**
 * Muestra una notificación temporal flotante en la interfaz.
 * Cancela cualquier temporizador activo previo para evitar que clics rápidos cierren el toast antes de tiempo.
 * @param {string} text - El mensaje a mostrar en la notificación.
 */
const showToast = (text) => {
    toast.textContent = text;
    toast.classList.add('visible');

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove('visible');
    }, 2000);
};

/**
 * Copia el código hexadecimal de un color al portapapeles del sistema.
 * @param {object} colorObj - El objeto de color a copiar.
 */
const copyColor = (colorObj) => {
    navigator.clipboard.writeText(colorObj.hex);
    showToast('✓ Color copiado al portapapeles');
};

/**
 * Determina el color de texto adecuado según el brillo del color de fondo.
 * Calcula la luminancia relativa del color para garantizar contraste legible.
 * Sugerencia de IA — matemática de accesibilidad de color (WCAG).
 * @param {string} hex - Color en formato hexadecimal '#RRGGBB'.
 * @returns {string} '#0f0f13' para fondos claros, '#f0f0f0' para fondos oscuros.
 */
const getTextColor = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // parseInt con base 16 convierte cada par de caracteres HEX a número decimal

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    // Fórmula estándar de luminancia — pondera cada canal según cómo el ojo humano
    // percibe el brillo: el verde se percibe más brillante que el rojo y el azul

    return luminance > 0.5 ? '#0f0f13' : '#f0f0f0';
    // Si el color es claro → texto oscuro
    // Si el color es oscuro → texto claro
};

/**
 * Crea dinámicamente y dibuja las muestras de color (swatches) en el DOM.
 * Asigna eventos de clic para bloquear/desbloquear, copiar códigos y efectos hover sobre el título.
 * @param {array} colors - Array de objetos de color a renderizar.
 */
const renderPalette = (colors) => {
    paletteContainer.innerHTML = '';

    formatMessage.textContent = `Paleta generada en formato ${activeFormat.toUpperCase()}`;

    // Mostramos la pista de ayuda en la primera generación
    usageHint.classList.remove('hidden');
    usageHint.textContent = 'Haz clic en HEX o HSL para copiar el código · Usa 🔓 para bloquear un color y que no cambie al regenerar';

    colors.forEach(({ value, hex, hsl }, index) => {
        const swatch = document.createElement('div');
        swatch.classList.add('swatch');

        const textColor = getTextColor(hex);
        // Calcula el color de texto adecuado para este swatch

        if (lockedColors[index]) {
            swatch.classList.add('locked');
        }

    swatch.innerHTML = `
    <div class="swatch-color" style="background-color: ${value};"></div>
    <div class="swatch-footer" style="color: ${textColor};">
        <button type="button" class="swatch-lock-btn" title="${lockedColors[index] ? 'Desbloquear color' : 'Bloquear color'}" style="color: ${textColor}; border-color: ${textColor}40;">
            ${lockedColors[index] ? '🔒' : '🔓'}
        </button>
        <div class="swatch-codes">
            <div class="code-row swatch-copy-hex" title="Copiar HEX">
                <span class="swatch-label" style="color: ${textColor};">HEX</span>
                <span class="copy-indicator">📋</span>
            </div>
            <span class="swatch-hex" style="color: ${textColor};">${hex}</span>
            ${hsl ? `
            <div class="code-row swatch-copy-hsl" title="Copiar HSL">
                <span class="swatch-label" style="color: ${textColor};">HSL</span>
                <span class="copy-indicator">📋</span>
            </div>
            <span class="swatch-hsl" style="color: ${textColor};">${hsl}</span>
            ` : ''}
        </div>
    </div>
    `;

        const lockBtn = swatch.querySelector('.swatch-lock-btn');
        const copyHexRow = swatch.querySelector('.swatch-copy-hex');
        const copyHslRow = swatch.querySelector('.swatch-copy-hsl');

        // Evento de clic en el botón de bloqueo/desbloqueo
        lockBtn.addEventListener('click', (event) => {
            event.stopPropagation();

            if (lockedColors[index]) {
                lockedColors[index] = null;
                swatch.classList.remove('locked');
                lockBtn.textContent = '🔓';
                lockBtn.title = 'Bloquear color';
                showToast('🔓 Color desbloqueado');
            } else {
                lockedColors[index] = { value, hex, hsl };
                swatch.classList.add('locked');
                lockBtn.textContent = '🔒';
lockBtn.title = 'Desbloquear color';
                showToast('🔒 Color bloqueado');
            }
        });

        // Evento de clic en la fila de HEX para copiar
        copyHexRow.addEventListener('click', (event) => {
            event.stopPropagation();
            navigator.clipboard.writeText(hex);
            showToast('✓ Código HEX copiado');
        });

        // Evento de clic en la fila de HSL para copiar
        copyHslRow.addEventListener('click', (event) => {
            event.stopPropagation();
            navigator.clipboard.writeText(hsl);
            showToast('✓ Código HSL copiado');
        });

        // Eventos de hover para cambiar el color del título de la marca de la app
        swatch.addEventListener('mouseover', () => {
            titleColorfly.style.color = hex;
        });

        swatch.addEventListener('mouseout', () => {
            titleColorfly.style.color = '';
        });

        paletteContainer.appendChild(swatch);
    });
};

// ==========================================================================
// PERSISTENCIA E HISTORIAL (LOCALSTORAGE)
// ==========================================================================

/**
 * Recupera la lista de paletas guardadas en localStorage.
 * @returns {array} Array de paletas del historial, o array vacío si no hay ninguna.
 */
const loadSavedPalettes = () => {
    const saved = localStorage.getItem('savedPalettes');
    return saved ? JSON.parse(saved) : [];
};

/**
 * Guarda el array de paletas en localStorage serializado como JSON.
 * @param {array} palettes - La lista completa de paletas a guardar.
 */
const savePalettes = (palettes) => {
    localStorage.setItem('savedPalettes', JSON.stringify(palettes));
};

/**
 * Dibuja en la interfaz la sección y los elementos del historial de paletas.
 * Si el historial está vacío, oculta toda la sección agregando la clase hidden.
 */
const renderSavedPalettes = () => {
    const palettes = loadSavedPalettes();

    if (palettes.length === 0) {
        savedSection.classList.add('hidden');
        return;
    }

    savedSection.classList.remove('hidden');
    savedContainer.innerHTML = '';

    palettes.forEach((palette, paletteIndex) => {
        const paletteEl = document.createElement('div');
        paletteEl.classList.add('saved-palette');

        const colorsHTML = palette.colors.map(colorObj => `
            <div class="saved-swatch" style="background-color: ${colorObj.value};" title="${colorObj.hex}"></div>
        `).join('');

        paletteEl.innerHTML = `
            <div class="saved-palette-header">
                <span class="saved-palette-date">${palette.date} · ${palette.colors.length} colores · ${palette.format.toUpperCase()}</span>
                <button type="button" class="btn-delete" data-index="${paletteIndex}" title="Eliminar paleta">✕</button>
            </div>
            <div class="saved-palette-colors">
                ${colorsHTML}
            </div>
        `;

        // Evento para eliminar una paleta individual del historial
        paletteEl.querySelector('.btn-delete').addEventListener('click', (event) => {
            const index = Number(event.target.dataset.index);
            const palettes = loadSavedPalettes();
            palettes.splice(index, 1);
            savePalettes(palettes);
            renderSavedPalettes();
            showToast('🗑 Paleta eliminada');
        });

        savedContainer.appendChild(paletteEl);
    });
};

/**
 * Guarda la paleta activa actual en el historial de localStorage.
 * Inserta la nueva paleta al inicio y limita el almacenamiento a un máximo de 5 paletas (FIFO).
 * @param {array} colors - Array de colores de la paleta actual.
 */
const saveCurrentPalette = (colors) => {
    const palettes = loadSavedPalettes();

    const newPalette = {
        colors: [...colors],
        format: activeFormat,
        date: new Date().toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    };

    palettes.unshift(newPalette);

    if (palettes.length > 5) {
        palettes.pop();
    }

    savePalettes(palettes);
    renderSavedPalettes();
    showToast('✓ Paleta guardada');
};

// ==========================================================================
// ASIGNACIÓN DE EVENTOS PRINCIPALES
// ==========================================================================

// Click en botón Generar Paleta
generateBtn.addEventListener('click', () => {
    currentPalette = generatePalette(colorCount);
    renderPalette(currentPalette);
    showToast('🎨 Paleta generada');
    saveBar.classList.remove('hidden');
});

// Click en selectores de tamaño (6, 8 o 9)
sizeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        sizeButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        colorCount = Number(btn.dataset.size);
        showToast(`Tamaño actualizado a ${colorCount} colores`);
    });
});

// Click en botón Guardar Paleta
btnSave.addEventListener('click', () => {
    saveCurrentPalette(currentPalette);
});

// Cambio de selección en los radios de formato (HEX/HSL)
formatRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
        activeFormat = radio.value;
        showToast(`Formato cambiado a ${activeFormat.toUpperCase()}`);
    });
});

// ==========================================================================
// CARGA INICIAL
// ==========================================================================
renderSavedPalettes();

// El href del contacto se construye en JS para no exponer el email en el HTML
const contactLink = document.getElementById('contact-mail');
if (contactLink) {
    const user = 'tu.nombre';    // ← Reemplaza con tu usuario de correo
    const domain = 'gmail.com';  // ← Reemplaza con tu dominio
    contactLink.href = `mailto:${user}@${domain}`;
}