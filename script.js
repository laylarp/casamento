// ========== CONFIGURAÇÃO ==========
const SENHA = "casamento2026";
let svgElement = null;
let currentFileName = "convite";
let isLoading = false;
let originalStyles = {};
let originalDimensions = {};

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    // Verificar login salvo
    if (localStorage.getItem('casamento_logado') === 'true') {
        showEditor();
    }
    
    // Atalhos de teclado
    document.addEventListener('keydown', function(e) {
        // Ctrl+Enter para login
        if (e.ctrlKey && e.key === 'Enter' && document.getElementById('loginScreen').classList.contains('active')) {
            checkPassword();
        }
        
        // Ctrl+S para SVG, Ctrl+P para PNG
        if (e.ctrlKey && e.key === 's' && document.getElementById('editorScreen').classList.contains('active')) {
            e.preventDefault();
            downloadSVG();
        }
        if (e.ctrlKey && e.key === 'p' && document.getElementById('editorScreen').classList.contains('active')) {
            e.preventDefault();
            downloadPNGUltraHD();
        }
    });
});

// ========== FUNÇÕES DE LOGIN ==========
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.querySelector('.eye-btn i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        eyeIcon.className = 'fas fa-eye';
    }
}

function checkPassword() {
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('loginError');
    const loginBtn = document.querySelector('.btn-login.premium');
    
    if (isLoading) return;
    
    if (password === SENHA) {
        isLoading = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        loginBtn.disabled = true;
        
        setTimeout(() => {
            localStorage.setItem('casamento_logado', 'true');
            showEditor();
            isLoading = false;
        }, 500);
        
    } else {
        errorMsg.textContent = "❌ Senha incorreta. Por favor, tente novamente.";
        errorMsg.style.animation = 'none';
        setTimeout(() => {
            errorMsg.style.animation = 'pulse 0.5s';
        }, 10);
    }
}

function logout() {
    if (confirm('Tem certeza que deseja sair do editor?')) {
        localStorage.removeItem('casamento_logado');
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('editorScreen').classList.remove('active');
        document.getElementById('password').value = '';
        document.getElementById('loginError').textContent = '';
        
        const loginBtn = document.querySelector('.btn-login.premium');
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Acessar Editor';
        loginBtn.disabled = false;
    }
}

// ========== MOSTRAR EDITOR ==========
function showEditor() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('editorScreen').classList.add('active');
    loadSVGWithPremiumQuality();
}

// ========== CARREGAR SVG COM QUALIDADE PREMIUM ==========
async function loadSVGWithPremiumQuality() {
    try {
        showLoadingState('Carregando convite em qualidade máxima...');
        
        const response = await fetch('convite.svg');
        if (!response.ok) throw new Error('Arquivo convite.svg não encontrado');
        
        const svgText = await response.text();
        document.getElementById('svgContainer').innerHTML = svgText;
        svgElement = document.querySelector('#svgContainer svg');
        
        if (!svgElement) throw new Error('SVG não pôde ser carregado');
        
        // 1. PRESERVAR DIMENSÕES E ESTILOS ORIGINAIS
        preserveOriginalData();
        
        // 2. APLICAR OTIMIZAÇÕES DE QUALIDADE
        applyQualityOptimizations();
        
        // 3. CONFIGURAR EDIÇÃO DE TEXTO
        setupTextEditing();
        
        // 4. MOSTRAR SUCESSO
        hideLoadingState();
        showNotification('🎉 Convite carregado em qualidade premium!', 'success');
        
        console.log('✅ SVG carregado com sucesso:', {
            dimensoes: originalDimensions,
            estilos: originalStyles
        });
        
    } catch (error) {
        console.error('❌ Erro ao carregar SVG:', error);
        showErrorState(`Erro: ${error.message}`);
    }
}

// 1. PRESERVAR DADOS ORIGINAIS
function preserveOriginalData() {
    // Salvar dimensões
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
        const [x, y, width, height] = viewBox.split(' ').map(Number);
        originalDimensions = { x, y, width, height };
    } else {
        originalDimensions = {
            width: parseInt(svgElement.getAttribute('width')) || 800,
            height: parseInt(svgElement.getAttribute('height')) || 1131
        };
    }
    
    // Salvar estilos dos textos
    const nomeEl = svgElement.querySelector('#guestName');
    const countEl = svgElement.querySelector('#guestCount');
    
    if (nomeEl) {
        originalStyles.nome = {
            element: nomeEl,
            fontFamily: getComputedStyle(nomeEl).fontFamily || 'inherit',
            fontSize: parseFloat(getComputedStyle(nomeEl).fontSize) || 28,
            fontWeight: getComputedStyle(nomeEl).fontWeight || 'normal',
            fill: nomeEl.getAttribute('fill') || '#000000',
            textAnchor: nomeEl.getAttribute('text-anchor') || 'middle',
            originalX: nomeEl.getAttribute('x'),
            originalY: nomeEl.getAttribute('y'),
            originalTransform: nomeEl.getAttribute('transform'),
            originalText: nomeEl.textContent || 'NOME_AQUI'
        };
    }
    
    if (countEl) {
        originalStyles.count = {
            element: countEl,
            fontFamily: getComputedStyle(countEl).fontFamily || 'inherit',
            fontSize: parseFloat(getComputedStyle(countEl).fontSize) || 16,
            fill: countEl.getAttribute('fill') || '#000000',
            textAnchor: countEl.getAttribute('text-anchor') || 'middle',
            originalText: countEl.textContent || '0'
        };
    }
}

// 2. APLICAR OTIMIZAÇÕES DE QUALIDADE
function applyQualityOptimizations() {
    // Forçar alta qualidade de renderização
    svgElement.setAttribute('shape-rendering', 'geometricPrecision');
    svgElement.setAttribute('text-rendering', 'optimizeLegibility');
    svgElement.setAttribute('image-rendering', 'optimizeQuality');
    
    // Remover interatividade desnecessária
    svgElement.removeAttribute('onclick');
    svgElement.removeAttribute('onmouseover');
    svgElement.style.pointerEvents = 'none';
    
    // Manter proporções
    svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
}

// 3. CONFIGURAR EDIÇÃO DE TEXTO
function setupTextEditing() {
    const nomeInput = document.getElementById('guestName');
    const countInput = document.getElementById('guestCount');
    
    // Configurar contador de caracteres
    nomeInput.addEventListener('input', function() {
        const length = this.value.length;
        document.getElementById('nameCounter').textContent = `${length}/40`;
        updateNameWithSmartCentering(this.value);
    });
    
    countInput.addEventListener('input', function() {
        updateCount(this.value);
    });
    
    // Valores iniciais
    if (originalStyles.nome) {
        nomeInput.value = originalStyles.nome.originalText;
        updateNameWithSmartCentering(originalStyles.nome.originalText);
    }
    
    if (originalStyles.count) {
        countInput.value = originalStyles.count.originalText.replace(/\D/g, '') || '0';
        updateCount(countInput.value);
    }
}

// ========== EDIÇÃO INTELIGENTE DE TEXTO ==========
function updateNameWithSmartCentering(nome) {
    if (!nome || !originalStyles.nome) return;
    
    const nomeEl = originalStyles.nome.element;
    const text = nome.trim() || "NOME_AQUI";
    
    // 1. APLICAR ESTILOS ORIGINAIS
    applyOriginalStyles(nomeEl, originalStyles.nome);
    
    // 2. DEFINIR TEXTO
    nomeEl.textContent = text;
    
    // 3. CALCULAR TAMANHO E CENTRALIZAR
    const textWidth = estimateTextWidth(text, originalStyles.nome);
    const maxWidth = originalDimensions.width * 0.8; // 80% da largura do convite
    
    // 4. AJUSTAR TAMANHO DA FONTE SE NECESSÁRIO
    if (textWidth > maxWidth) {
        const scaleFactor = maxWidth / textWidth;
        const newSize = Math.max(originalStyles.nome.fontSize * scaleFactor, 16);
        nomeEl.setAttribute('font-size', `${newSize}px`);
    }
    
    // 5. CENTRALIZAR HORIZONTALMENTE
    nomeEl.setAttribute('text-anchor', 'middle');
    
    // 6. MANTER POSIÇÃO VERTICAL ORIGINAL
    if (originalStyles.nome.originalY) {
        nomeEl.setAttribute('y', originalStyles.nome.originalY);
    }
    
    // 7. ATUALIZAR PREVIEW E NOME DO ARQUIVO
    document.getElementById('previewName').textContent = text;
    currentFileName = `convite_${text.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    
    // 8. ANIMAÇÃO DE ATUALIZAÇÃO
    nomeEl.style.opacity = '0.8';
    setTimeout(() => nomeEl.style.opacity = '1', 150);
}

function updateCount(count) {
    if (!originalStyles.count) return;
    
    const countEl = originalStyles.count.element;
    const num = parseInt(count) || 0; // Alterado para permitir 0
    const text = num === 0 ? "0" : (num === 1 ? "1" : `${num} `); // Adicionado caso para 0
    
    // Aplicar estilos originais
    applyOriginalStyles(countEl, originalStyles.count);
    
    // Definir texto
    countEl.textContent = text;
    
    // Centralizar
    countEl.setAttribute('text-anchor', 'middle');
    
    // Atualizar preview
    document.getElementById('previewCount').textContent = text;
    currentFileName = currentFileName.split('_')[0] + `_${num}p`;
}

function applyOriginalStyles(element, styles) {
    if (styles.fontFamily) element.setAttribute('font-family', styles.fontFamily);
    if (styles.fontSize) element.setAttribute('font-size', `${styles.fontSize}px`);
    if (styles.fontWeight) element.setAttribute('font-weight', styles.fontWeight);
    if (styles.fill) element.setAttribute('fill', styles.fill);
    if (styles.textAnchor) element.setAttribute('text-anchor', styles.textAnchor);
}

function estimateTextWidth(text, styles) {
    // Estimativa aproximada (pode ser ajustada)
    const fontSize = styles.fontSize || 28;
    const avgCharWidth = fontSize * 0.6;
    return text.length * avgCharWidth;
}

// ========== CONTROLES DE NÚMERO ==========
function incrementCount() {
    const input = document.getElementById('guestCount');
    let value = parseInt(input.value) || 0;
    if (value < 10) {
        input.value = value + 1; // Corrigido: era +0, agora é +1
        updateCount(input.value);
    }
}

function decrementCount() {
    const input = document.getElementById('guestCount');
    let value = parseInt(input.value) || 0;
    if (value > 0) { // Alterado de > 1 para > 0
        input.value = value - 1;
        updateCount(input.value);
    }
}

function resetForm() {
    if (confirm('Limpar todos os campos?')) {
        document.getElementById('guestName').value = '';
        document.getElementById('guestCount').value = '0'; // Alterado de '1' para '0'
        document.getElementById('nameCounter').textContent = '0/40';
        
        if (originalStyles.nome) {
            updateNameWithSmartCentering(originalStyles.nome.originalText);
        }
        updateCount('0'); // Alterado de '1' para '0'
        
        showNotification('Formulário limpo com sucesso!', 'info');
    }
}

// ========== DOWNLOAD SVG ==========
function downloadSVG() {
    if (!svgElement) {
        showNotification('SVG não carregado. Aguarde o carregamento.', 'error');
        return;
    }
    
    try {
        showNotification('Preparando SVG para download...', 'info');
        
        // Clonar para não modificar o original
        const svgClone = svgElement.cloneNode(true);
        
        // Restaurar dimensões originais no clone
        svgClone.setAttribute('width', originalDimensions.width);
        svgClone.setAttribute('height', originalDimensions.height);
        
        // Serializar
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svgClone);
        source = '<?xml version="1.0" encoding="UTF-8"?>\n' + source;
        
        // Criar download
        const blob = new Blob([source], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentFileName}_original.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('✅ SVG baixado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro SVG:', error);
        showNotification('❌ Erro ao baixar SVG', 'error');
    }
}

// ========== DOWNLOAD PNG ULTRA HD (TÉCNICA CANVA) ==========
async function downloadPNGUltraHD() {
    if (!svgElement || isLoading) {
        showNotification('Aguarde o carregamento completo.', 'warning');
        return;
    }
    
    showNotification('🔄 Gerando PNG em qualidade ULTRA HD (4x)...', 'info');
    
    const btn = event?.target;
    if (btn) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
        btn.disabled = true;
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }, 5000);
    }
    
    try {
        // 1. CRIAR SVG EM ALTA RESOLUÇÃO (4x)
        const highResSVG = await createHighResolutionSVG(4);
        
        // 2. CONVERTER PARA CANVAS
        const canvas = await convertSVGToCanvas(highResSVG);
        
        // 3. CRIAR PNG COM QUALIDADE MÁXIMA
        const pngData = canvas.toDataURL('image/png', 1.0);
        
        // 4. BAIXAR
        downloadFile(pngData, `${currentFileName}_ULTRA_HD.png`);
        
        showNotification('🎉 PNG ULTRA HD baixado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro PNG ULTRA HD:', error);
        showNotification('❌ Falha ao gerar PNG. Tente o método alternativo.', 'error');
        
        // Método alternativo
        tryAlternativePNG();
    }
}

async function createHighResolutionSVG(scale = 4) {
    return new Promise((resolve) => {
        // Clonar SVG
        const svgClone = svgElement.cloneNode(true);
        
        // Aplicar escala
        const width = originalDimensions.width * scale;
        const height = originalDimensions.height * scale;
        
        svgClone.setAttribute('width', width);
        svgClone.setAttribute('height', height);
        
        if (svgClone.getAttribute('viewBox')) {
            const [x, y, w, h] = svgClone.getAttribute('viewBox').split(' ').map(Number);
            svgClone.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
        }
        
        // Otimizar para renderização
        svgClone.setAttribute('shape-rendering', 'geometricPrecision');
        svgClone.setAttribute('text-rendering', 'optimizeLegibility');
        
        resolve(svgClone);
    });
}

async function convertSVGToCanvas(svgElement) {
    return new Promise((resolve, reject) => {
        // Serializar SVG
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        
        // Criar blob
        const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
        const svgUrl = URL.createObjectURL(svgBlob);
        
        // Criar imagem
        const img = new Image();
        
        img.onload = function() {
            // Criar canvas
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Configurar contexto para máxima qualidade
            const ctx = canvas.getContext('2d', {
                alpha: true,
                desynchronized: false
            });
            
            // Configurações de qualidade
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.textDrawingMode = 'glyph';
            
            // Fundo transparente
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Desenhar SVG
            ctx.drawImage(img, 0, 0);
            
            // Limpar URL
            URL.revokeObjectURL(svgUrl);
            
            resolve(canvas);
        };
        
        img.onerror = function() {
            URL.revokeObjectURL(svgUrl);
            reject(new Error('Falha ao carregar imagem SVG'));
        };
    
        img.src = svgUrl;
        img.crossOrigin = 'anonymous';
    });
}

// ========== MÉTODO ALTERNATIVO PNG ==========
async function tryAlternativePNG() {
    showNotification('Tentando método alternativo...', 'info');
    
    try {
        // Usar html2canvas como fallback
        const canvas = await html2canvas(document.querySelector("#svgContainer svg"), {
            backgroundColor: null,
            scale: 3,
            useCORS: true,
            allowTaint: true,
            logging: false,
            onclone: function(clonedDoc) {
                // Aumentar tamanho no clone
                const clonedSVG = clonedDoc.querySelector('svg');
                if (clonedSVG) {
                    clonedSVG.setAttribute('width', originalDimensions.width * 2);
                    clonedSVG.setAttribute('height', originalDimensions.height * 2);
                }
            }
        });
        
        const pngData = canvas.toDataURL('image/png', 0.95);
        downloadFile(pngData, `${currentFileName}_alta_qualidade.png`);
        
        showNotification('PNG gerado com método alternativo!', 'success');
        
    } catch (error) {
        console.error('Método alternativo falhou:', error);
        showNotification('❌ Todos os métodos falharam. Baixe SVG e converta online.', 'error');
    }
}

// ========== FUNÇÕES AUXILIARES ==========
function downloadFile(data, filename) {
    const link = document.createElement('a');
    link.href = data;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function showLoadingState(message) {
    document.getElementById('svgContainer').innerHTML = `
        <div class="loading-high-quality">
            <div class="spinner">
                <i class="fas fa-palette fa-spin"></i>
            </div>
            <h3>${message}</h3>
            <p>Renderizando em qualidade máxima...</p>
            <div class="progress">
                <div class="progress-bar"></div>
            </div>
        </div>
    `;
}

function hideLoadingState() {
    // Loading já foi removido quando o SVG foi carregado
}

function showErrorState(message) {
    document.getElementById('svgContainer').innerHTML = `
        <div class="error-high-quality">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>${message}</h3>
            <p>Verifique se o arquivo "convite.svg" está na mesma pasta.</p>
            <button onclick="loadSVGWithPremiumQuality()" class="btn-retry">
                <i class="fas fa-redo"></i> Tentar novamente
            </button>
        </div>
    `;
}

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                         type === 'error' ? 'exclamation-circle' : 
                         type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        background: ${type === 'success' ? '#4CAF50' : 
                    type === 'error' ? '#f44336' : 
                    type === 'warning' ? '#ff9800' : '#2196F3'};
        color: white;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 9999;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 4 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ========== FUNÇÕES DE TESTE ==========
function testQuality() {
    const report = `
        <h3><i class="fas fa-chart-line"></i> Relatório de Qualidade</h3>
        <div class="quality-metrics">
            <div class="metric">
                <strong>Dimensões do SVG:</strong>
                <p>${originalDimensions.width} × ${originalDimensions.height}px</p>
            </div>
            <div class="metric">
                <strong>PNG Gerado:</strong>
                <p>${originalDimensions.width * 4} × ${originalDimensions.height * 4}px (4×)</p>
            </div>
            <div class="metric">
                <strong>Resolução:</strong>
                <p>${Math.round((originalDimensions.width * 4) / 96)} DPI (alta)</p>
            </div>
            <div class="metric">
                <strong>Fontes Preservadas:</strong>
                <p>${originalStyles.nome ? '✅' : '❌'} ${originalStyles.nome?.fontFamily || 'N/A'}</p>
            </div>
        </div>
        <div class="quality-tips">
            <h4><i class="fas fa-lightbulb"></i> Dicas:</h4>
            <ul>
                <li>PNG em 4× resolução para impressão profissional</li>
                <li>Transparência preservada</li>
                <li>Anti-aliasing ativado</li>
                <li>Renderização vetorial mantida</li>
            </ul>
        </div>
    `;
    
    document.getElementById('qualityReport').innerHTML = report;
    document.getElementById('qualityModal').style.display = 'flex';
}

function showDimensions() {
    alert(`📐 Dimensões do Convite:\n\nLargura: ${originalDimensions.width}px\nAltura: ${originalDimensions.height}px\n\nPNG será gerado em: ${originalDimensions.width * 4} × ${originalDimensions.height * 4}px`);
}

function closeModal() {
    document.getElementById('qualityModal').style.display = 'none';
}

// ========== CSS DINÂMICO PARA ANIMAÇÕES ==========
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .progress {
        width: 200px;
        height: 6px;
        background: #e0e0e0;
        border-radius: 3px;
        margin: 20px auto;
        overflow: hidden;
    }
    .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #e91e63, #9c27b0);
        width: 0%;
        animation: loadingBar 2s infinite;
    }
    @keyframes loadingBar {
        0% { width: 0%; }
        50% { width: 70%; }
        100% { width: 100%; }
    }
`;
document.head.appendChild(style);