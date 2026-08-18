let colorCount = 6;
let activeFormat = 'hex';
let lockedColors = [];
let currentPalette = [];

// Conversión y generación de colores
const generateHexChannel = (value) => value.toString(16).padStart(2, '0');

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

const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;

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

const generateHexColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const hex = `#${generateHexChannel(r)}${generateHexChannel(g)}${generateHexChannel(b)}`;
    return { value: hex, hex, hsl: rgbToHsl(r, g, b) };
};

const generateHslColor = () => {
    const h = Math.floor(Math.random() * 361);
    const s = Math.floor(Math.random() * 51) + 50;
    const l = Math.floor(Math.random() * 41) + 30;
    const hslString = `hsl(${h}, ${s}%, ${l}%)`;
    return { value: hslString, hex: hslToHex(h, s, l), hsl: hslString };
};

const generateColor = () => activeFormat === 'hex' ? generateHexColor() : generateHslColor();

const generatePalette = (count) => {
    const palette = [];
    for (let i = 0; i < count; i++) {
        palette.push(lockedColors[i] ? lockedColors[i] : generateColor());
    }
    return palette;
};

// Referencias al DOM
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
const toast = document.getElementById('toast-notification');
const titleColorfly = document.querySelector('.title-colorfly');

// Interfaz de usuario (UI)
let toastTimeout;
const showToast = (text) => {
    toast.textContent = text;
    toast.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('visible'), 2000);
};

// Luminancia relativa (WCAG) de un color, usada para calcular contraste real
const relativeLuminance = ([r, g, b]) => {
    const channel = (v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrastRatio = (rgb1, rgb2) => {
    const l1 = relativeLuminance(rgb1) + 0.05;
    const l2 = relativeLuminance(rgb2) + 0.05;
    return l1 > l2 ? l1 / l2 : l2 / l1;
};

// El texto del swatch se apoya sobre el degradado oscuro del footer (rgba(0,0,0,0.6) en la base),
// así que el contraste se calcula contra ese fondo ya oscurecido — no contra el color crudo —
// y se elige el color de texto (casi negro o casi blanco) que da MEJOR contraste real.
// Esto garantiza WCAG AA (4.5:1) para cualquier color que el generador produzca.
const getTextColor = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const overlayAlpha = 0.6;
    const renderedBg = [r * (1 - overlayAlpha), g * (1 - overlayAlpha), b * (1 - overlayAlpha)];

    const darkText = [15, 15, 19];
    const lightText = [240, 240, 240];

    return contrastRatio(darkText, renderedBg) > contrastRatio(lightText, renderedBg)
        ? '#0f0f13'
        : '#f0f0f0';
};

// Copia un código de color al portapapeles, con aviso si el navegador lo bloquea
const copyToClipboard = (text, successMessage) => {
    navigator.clipboard.writeText(text)
        .then(() => showToast(successMessage))
        .catch(() => showToast('⚠ No se pudo copiar el código'));
};

const renderPalette = (colors) => {
    paletteContainer.innerHTML = '';
    formatMessage.textContent = `Paleta generada en formato ${activeFormat.toUpperCase()}`;
    usageHint.classList.remove('hidden');
    usageHint.textContent = 'Haz clic en HEX o HSL para copiar el código · Usa 🔓 para bloquear un color y que no cambie al regenerar';

    colors.forEach(({ value, hex, hsl }, index) => {
        const swatch = document.createElement('div');
        swatch.classList.add('swatch');
        swatch.style.animationDelay = `${index * 0.05}s`;
        const textColor = getTextColor(hex);

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
                    <button type="button" class="code-row swatch-copy-hex" title="Copiar HEX" aria-label="Copiar código HEX ${hex}" style="color: ${textColor};">
                        <span class="swatch-label" style="color: ${textColor};">HEX</span>
                        <span class="copy-indicator">📋</span>
                    </button>
                    <span class="swatch-hex" style="color: ${textColor};">${hex}</span>
                    ${hsl ? `
                    <button type="button" class="code-row swatch-copy-hsl" title="Copiar HSL" aria-label="Copiar código HSL ${hsl}" style="color: ${textColor};">
                        <span class="swatch-label" style="color: ${textColor};">HSL</span>
                        <span class="copy-indicator">📋</span>
                    </button>
                    <span class="swatch-hsl" style="color: ${textColor};">${hsl}</span>
                    ` : ''}
                </div>
            </div>
        `;

        const lockBtn = swatch.querySelector('.swatch-lock-btn');
        const copyHexRow = swatch.querySelector('.swatch-copy-hex');
        const copyHslRow = swatch.querySelector('.swatch-copy-hsl');

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

        copyHexRow.addEventListener('click', (event) => {
            event.stopPropagation();
            copyToClipboard(hex, '✓ Código HEX copiado');
        });

        if (copyHslRow) {
            copyHslRow.addEventListener('click', (event) => {
                event.stopPropagation();
                copyToClipboard(hsl, '✓ Código HSL copiado');
            });
        }

        swatch.addEventListener('mouseover', () => {
            titleColorfly.style.color = hex;
        });

        swatch.addEventListener('mouseout', () => {
            titleColorfly.style.color = '';
        });

        paletteContainer.appendChild(swatch);
    });
};

// Historial y persistencia
const loadSavedPalettes = () => {
    const saved = localStorage.getItem('savedPalettes');
    return saved ? JSON.parse(saved) : [];
};

const savePalettes = (palettes) => {
    localStorage.setItem('savedPalettes', JSON.stringify(palettes));
};

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
            <button type="button" class="saved-swatch" style="background-color: ${colorObj.value};" data-hex="${colorObj.hex}" title="Copiar ${colorObj.hex}" aria-label="Copiar color ${colorObj.hex}"></button>
        `).join('');

        paletteEl.innerHTML = `
            <div class="saved-palette-header">
                <span class="saved-palette-date">${palette.date} · ${palette.colors.length} colores · ${palette.format.toUpperCase()}</span>
                <div class="saved-palette-actions">
                    <button type="button" class="btn-load" data-index="${paletteIndex}" title="Cargar esta paleta en el editor" aria-label="Cargar esta paleta en el editor">↺</button>
                    <button type="button" class="btn-delete" data-index="${paletteIndex}" title="Eliminar paleta" aria-label="Eliminar paleta">✕</button>
                </div>
            </div>
            <div class="saved-palette-colors">
                ${colorsHTML}
            </div>
        `;

        paletteEl.querySelectorAll('.saved-swatch').forEach((swatchBtn) => {
            swatchBtn.addEventListener('click', () => {
                copyToClipboard(swatchBtn.dataset.hex, `✓ ${swatchBtn.dataset.hex} copiado`);
            });
        });

        paletteEl.querySelector('.btn-load').addEventListener('click', (event) => {
            const index = Number(event.currentTarget.dataset.index);
            const palettes = loadSavedPalettes();
            if (palettes[index]) loadPaletteToEditor(palettes[index]);
        });

        paletteEl.querySelector('.btn-delete').addEventListener('click', (event) => {
            const index = Number(event.currentTarget.dataset.index);
            if (!confirm('¿Eliminar esta paleta guardada?')) return;
            const palettes = loadSavedPalettes();
            palettes.splice(index, 1);
            savePalettes(palettes);
            renderSavedPalettes();
            showToast('🗑 Paleta eliminada');
        });

        savedContainer.appendChild(paletteEl);
    });
};

// Restaura una paleta guardada como paleta activa para seguir editándola
const loadPaletteToEditor = (palette) => {
    currentPalette = palette.colors.map((colorObj) => ({ ...colorObj }));
    colorCount = palette.colors.length;
    activeFormat = palette.format;
    lockedColors = [];

    sizeButtons.forEach((btn) => {
        btn.classList.toggle('active', Number(btn.dataset.size) === colorCount);
    });
    formatRadios.forEach((radio) => {
        radio.checked = radio.value === activeFormat;
    });

    renderPalette(currentPalette);
    saveBar.classList.remove('hidden');
    showToast('↺ Paleta cargada en el editor');
    paletteContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const saveCurrentPalette = (colors) => {
    const palettes = loadSavedPalettes();

    const isDuplicate = palettes.some((palette) =>
        palette.colors.length === colors.length &&
        palette.colors.every((colorObj, index) => colorObj.hex === colors[index].hex)
    );
    if (isDuplicate) {
        showToast('ℹ Esta paleta ya está guardada');
        return;
    }

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
    const limitReached = palettes.length > 5;
    if (limitReached) palettes.pop();

    savePalettes(palettes);
    renderSavedPalettes();
    showToast(limitReached ? '✓ Paleta guardada · se eliminó la más antigua (máx. 5)' : '✓ Paleta guardada');
};

// Eventos de controles
generateBtn.addEventListener('click', () => {
    currentPalette = generatePalette(colorCount);
    renderPalette(currentPalette);
    showToast('🎨 Paleta generada');
    saveBar.classList.remove('hidden');
});

sizeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        sizeButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        colorCount = Number(btn.dataset.size);
        showToast(`Tamaño actualizado a ${colorCount} colores`);
    });
});

btnSave.addEventListener('click', () => {
    saveCurrentPalette(currentPalette);
});

formatRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
        activeFormat = radio.value;
        showToast(`Formato cambiado a ${activeFormat.toUpperCase()}`);
    });
});

// Inicialización
renderSavedPalettes();
