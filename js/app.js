let colorCount = 6;
let activeFormat = 'hex';
let lockedColors = [];

// GENERACIÓN DE COLORES
const generateHexChannel = (value) => {
    return value.toString(16).padStart(2, '0');
};

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

const generateHexColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    const hex = `#${generateHexChannel(r)}${generateHexChannel(g)}${generateHexChannel(b)}`;

    return {
        value: hex,
        hex: hex,
        hsl: null
    };
};

const generateHslColor = () => {
    const h = Math.floor(Math.random() * 361);
    const s = Math.floor(Math.random() * 51) + 50;
    const l = Math.floor(Math.random() * 41) + 30;

    return {
        value: `hsl(${h}, ${s}%, ${l}%)`,
        hex: hslToHex(h, s, l),
        hsl: `hsl(${h}, ${s}%, ${l}%)`
    };
};

const generateColor = () => {
    if (activeFormat === 'hex') {
        return generateHexColor();
    } else {
        return generateHslColor();
    }
};

const generatePalette = (count) => {
    const palette = [];

    for (let i = 0; i < count; i++) { // Extra
        if (lockedColors[i]) {
            palette.push(lockedColors[i]);
            // Si hay color bloqueado en esta posición lo reutiliza
        } else {
            palette.push(generateColor());
            // Si no, genera uno nuevo
        }
    }

    return palette;
};

// REFERENCIAS AL DOM
const generateBtn = document.getElementById('btn-generate');
const paletteContainer = document.getElementById('palette-container');
const formatMessage = document.getElementById('active-format');
const copyToast = document.getElementById('toast-copy');
const generateToast = document.getElementById('toast-generate');
const formatToast = document.getElementById('toast-format');
const sizeToast = document.getElementById('toast-size');
const sizeButtons = document.querySelectorAll('.size-btn');
const formatRadios = document.querySelectorAll('input[name="format"]');
// Extra
const lockToast = document.getElementById('toast-lock');
const usageHint = document.querySelector('.usage-hint');

// FUNCIONES DE UI
const showToast = (toastElement, text) => {
    if (text) {
        toastElement.textContent = text;
    }

    toastElement.classList.add('visible');

    setTimeout(() => {
        toastElement.classList.remove('visible');
    }, 2000);
};

const copyColor = (colorObj) => {
    navigator.clipboard.writeText(colorObj.hex);
    showToast(copyToast);
};

const renderPalette = (colors) => {
    paletteContainer.innerHTML = '';

    formatMessage.textContent = `Paleta generada en formato ${activeFormat.toUpperCase()}`;

    usageHint.style.display = 'block';
    usageHint.textContent = 'Clic en un color para bloquearlo · Clic en 📋 para copiarlo';
    // Muestra el hint después de la primera generación

    colors.forEach((colorObj, index) => {
        const swatch = document.createElement('div');
        swatch.classList.add('swatch');

        if (lockedColors[index]) {
            swatch.classList.add('locked');
        }

        swatch.innerHTML = `
            <div class="swatch-color" style="background-color: ${colorObj.value};"></div>
            <div class="swatch-footer">
                <div class="swatch-codes">
                    <span class="swatch-hex">${colorObj.hex}</span>
                    ${colorObj.hsl ? `<span class="swatch-hsl">${colorObj.hsl}</span>` : ''}
                </div>
                <span class="swatch-copy-icon" title="Copiar color">
                    ${lockedColors[index] ? '🔒' : '📋'}
                </span>
            </div>
        `;

        // Clic en el swatch — bloquea o desbloquea
        swatch.addEventListener('click', (event) => {
            if (event.target.classList.contains('swatch-copy-icon')) {
                return;
                // Si el clic fue en el ícono, no bloquea
            }

            if (lockedColors[index]) {
                lockedColors[index] = null;
                swatch.classList.remove('locked');
                swatch.querySelector('.swatch-copy-icon').textContent = '📋';
                showToast(lockToast, '🔓 Color desbloqueado');
            } else {
                lockedColors[index] = colorObj;
                swatch.classList.add('locked');
                swatch.querySelector('.swatch-copy-icon').textContent = '🔒';
                showToast(lockToast, '🔒 Color bloqueado');
            }
        });

        // Clic en el ícono — copia el color
        swatch.querySelector('.swatch-copy-icon').addEventListener('click', (event) => {
            event.stopPropagation();
            // Evita que el clic suba al swatch y también bloquee

            if (!lockedColors[index]) {
                copyColor(colorObj);
            }
        });

        swatch.addEventListener('mouseover', () => {
            document.querySelector('.site-title').style.color = colorObj.hex;
        });

        swatch.addEventListener('mouseout', () => {
            document.querySelector('.site-title').style.color = '';
        });

        paletteContainer.appendChild(swatch);
    });
};

// EVENTOS
generateBtn.addEventListener('click', () => {
    const palette = generatePalette(colorCount);
    renderPalette(palette);
    showToast(generateToast);
});

sizeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        sizeButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        colorCount = Number(btn.dataset.size);
        showToast(sizeToast, `Tamaño actualizado a ${colorCount} colores`);
    });
});

formatRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
        activeFormat = radio.value;
        showToast(formatToast, `Formato cambiado a ${activeFormat.toUpperCase()}`);
    });
});