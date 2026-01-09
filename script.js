// CONFIGURAÇÃO
const SENHA = "casamento2026";
let svgElement = null;
let currentFileName = "convite";
let isLoading = false;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está logado
    if (localStorage.getItem('casamento_logado') === 'true') {
        showEditor();
    }
    
    // Mostrar loading ao entrar
    document.getElementById('password').addEventListener('input', function() {
        if (this.value === SENHA) {
            document.querySelector('.btn-login').innerHTML = 
                '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        }
    });
});

// FUNÇÕES DE LOGIN
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
    const loginBtn = document.querySelector('.btn-login');
    
    if (isLoading) return;
    
    if (password === SENHA) {
        isLoading = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
        loginBtn.disabled = true;
        
        // Pequeno delay para mostrar feedback
        setTimeout(() => {
            localStorage.setItem('casamento_logado', 'true');
            showEditor();
            isLoading = false;
        }, 500);
        
    } else {
        errorMsg.textContent = "❌ Senha incorreta. Tente novamente.";
        errorMsg.style.transform = 'scale(1.05)';
        setTimeout(() => errorMsg.style.transform = 'scale(1)', 300);
    }
}

function showEditor() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('editorScreen').classList.add('active');
    loadSVGWithProgress();
}

function logout() {
    localStorage.removeItem('casamento_logado');
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('editorScreen').classList.remove('active');
    document.getElementById('password').value = '';
    document.getElementById('loginError').textContent = '';
    document.querySelector('.btn-login').innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
    document.querySelector('.btn-login').disabled = false;
}

// CARREGAR SVG COM FEEDBACK DE PROGRESSO
function loadSVGWithProgress() {
    const container = document.getElementById('svgContainer');
    
    // Mostrar loading
    container.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner">
                <i class="fas fa-ring fa-spin"></i>
            </div>
            <p>Carregando convite...</p>
            <p class="loading-text">Isso pode levar alguns segundos devido ao tamanho do arquivo</p>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        </div>
    `;
    
    // Simular progresso
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 5;
        const progressFill = container.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = Math.min(progress, 90) + '%';
        }
    }, 100);
    
    // Carregar SVG
    fetch('convite.svg')
        .then(response => {
            if (!response.ok) throw new Error('SVG não encontrado');
            return response.text();
        })
        .then(svgText => {
            clearInterval(progressInterval);
            
            // Mostrar que está processando
            container.querySelector('.loading-text').textContent = 'Processando elementos gráficos...';
            container.querySelector('.progress-fill').style.width = '95%';
            
            // Dar tempo para renderizar
            setTimeout(() => {
                container.innerHTML = svgText;
                svgElement = document.querySelector('#svgContainer svg');
                
                if (!svgElement) {
                    throw new Error('Elemento SVG não criado');
                }
                
                // Otimizar para SVG grande
                optimizeSVG();
                
                // Verificar IDs
                const nomeEl = svgElement.querySelector('#guestName');
                const countEl = svgElement.querySelector('#guestCount');
                
                if (!nomeEl || !countEl) {
                    console.warn('IDs não encontrados no SVG. Verifique:');
                    console.log('- guestName:', !!nomeEl);
                    console.log('- guestCount:', !!countEl);
                    
                    // Tentar encontrar alternativas
                    findTextElements();
                }
                
                // Mostrar sucesso
                showNotification('Convite carregado com sucesso!', 'success');
                
                updatePreview();
                
            }, 500);
            
        })
        .catch(error => {
            clearInterval(progressInterval);
            console.error('Erro ao carregar SVG:', error);
            
            container.innerHTML = `
                <div class="error-container">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Erro ao carregar o convite</h3>
                    <p>${error.message}</p>
                    <button onclick="loadSVGWithProgress()" class="btn-retry">
                        <i class="fas fa-redo"></i> Tentar novamente
                    </button>
                </div>
            `;
        });
}

// OTIMIZAR SVG GRANDE
function optimizeSVG() {
    if (!svgElement) return;
    
    // 1. Remover listeners desnecessários
    svgElement.removeAttribute('onload');
    svgElement.removeAttribute('onclick');
    
    // 2. Desabilitar interatividade para melhor performance
    svgElement.style.pointerEvents = 'none';
    
    // 3. Forçar renderização otimizada
    svgElement.style.imageRendering = 'optimizeQuality';
    svgElement.style.shapeRendering = 'geometricPrecision';
    
    console.log('SVG otimizado. Dimensões:', {
        width: svgElement.getAttribute('width'),
        height: svgElement.getAttribute('height'),
        elements: svgElement.querySelectorAll('*').length
    });
}

// BUSCAR ELEMENTOS DE TEXTO ALTERNATIVOS
function findTextElements() {
    if (!svgElement) return;
    
    const allTexts = svgElement.querySelectorAll('text, tspan');
    let nomeFound = false;
    let countFound = false;
    
    allTexts.forEach(el => {
        const text = el.textContent.trim();
        
        // Procurar por "NOME_AQUI" ou similar
        if (text === 'NOME_AQUI' || text === 'NOME' || text.includes('NOME')) {
            el.id = 'guestName';
            nomeFound = true;
            console.log('✅ NOME encontrado e ID adicionado');
        }
        
        // Procurar por número ou "cfd"
        if (text === '1' || text === '(cfd )' || text.includes('cfd')) {
            el.id = 'guestCount';
            countFound = true;
            console.log('✅ Número encontrado e ID adicionado');
        }
    });
    
    if (!nomeFound || !countFound) {
        console.warn('⚠️ Elementos de texto principais não encontrados');
    }
}

// FUNÇÕES DO EDITOR
function updatePreview() {
    if (isLoading) return;
    
    const nome = document.getElementById('guestName').value.trim() || "NOME_AQUI";
    const count = document.getElementById('guestCount').value || "1";
    
    // Atualizar preview de texto
    document.getElementById('previewName').textContent = nome || "NOME_AQUI";
    document.getElementById('previewCount').textContent = count;
    
    // Atualizar SVG se carregado
    if (svgElement) {
        const nomeEl = svgElement.querySelector('#guestName');
        const countEl = svgElement.querySelector('#guestCount');
        
        if (nomeEl) {
            nomeEl.textContent = nome;
        } else {
            console.warn('Elemento guestName não encontrado');
        }
        
        if (countEl) {
            // Manter apenas o número
            const countText = count;
            countEl.textContent = countText;
        } else {
            console.warn('Elemento guestCount não encontrado');
        }
    }
    
    // Atualizar nome do arquivo
    const safeName = nome.replace(/[^a-z0-9áéíóúãõâêôç]/gi, '_').toLowerCase();
    currentFileName = `convite_${safeName}_${count}p`;
}

function incrementCount() {
    const input = document.getElementById('guestCount');
    let value = parseInt(input.value) || 1;
    if (value < 10) {
        input.value = value + 1;
        updatePreview();
    }
}

function decrementCount() {
    const input = document.getElementById('guestCount');
    let value = parseInt(input.value) || 1;
    if (value > 1) {
        input.value = value - 1;
        updatePreview();
    }
}

function resetForm() {
    document.getElementById('guestName').value = '';
    document.getElementById('guestCount').value = '1';
    updatePreview();
}

// FUNÇÕES DE DOWNLOAD (OTIMIZADAS)
function downloadSVG() {
    if (!svgElement || isLoading) {
        alert('Aguarde o SVG carregar completamente.');
        return;
    }
    
    showNotification('Preparando download do SVG...', 'info');
    
    // Desabilitar botão temporariamente
    const btn = event?.target;
    if (btn) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
        btn.disabled = true;
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }, 2000);
    }
    
    setTimeout(() => {
        try {
            const serializer = new XMLSerializer();
            let source = serializer.serializeToString(svgElement);
            source = '<?xml version="1.0" encoding="UTF-8"?>\n' + source;
            
            const blob = new Blob([source], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentFileName}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('SVG baixado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao baixar SVG:', error);
            showNotification('Erro ao baixar SVG. Tente novamente.', 'error');
        }
    }, 500);
}

function downloadPNG() {
    if (!svgElement || isLoading) {
        alert('Aguarde o SVG carregar completamente.');
        return;
    }
    
    showNotification('Gerando PNG (pode levar alguns segundos)...', 'info');
    
    // Desabilitar botão
    const btn = event?.target;
    if (btn) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Convertendo...';
        btn.disabled = true;
    }
    
    // Método 1: Usar canvas nativo (mais confiável)
    generatePNGFromSVG()
        .then(pngData => {
            if (pngData) {
                downloadFile(pngData, `${currentFileName}.png`, 'image/png');
                
                if (btn) {
                    btn.innerHTML = '<i class="fas fa-image"></i> Baixar PNG';
                    btn.disabled = false;
                }
                
                showNotification('PNG baixado com sucesso!', 'success');
            } else {
                // Se falhar, tenta método alternativo
                tryAlternativePNGMethod(btn);
            }
        })
        .catch(error => {
            console.error('Erro ao gerar PNG:', error);
            tryAlternativePNGMethod(btn);
        });
}

// MÉTODO PRINCIPAL: Converter SVG para PNG usando canvas
// MÉTODO PRINCIPAL: Converter SVG para PNG mantendo dimensões originais
function generatePNGFromSVG() {
    return new Promise((resolve, reject) => {
        try {
            // 1. Serializar o SVG
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgElement);
            
            // 2. Criar blob do SVG
            const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
            const svgUrl = URL.createObjectURL(svgBlob);
            
            // 3. Criar imagem
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = function() {
                // 4. Usar as dimensões ORIGINAIS do SVG
                let width, height;
                
                // Tentar obter do atributo viewBox primeiro (mais preciso)
                const viewBox = svgElement.getAttribute('viewBox');
                if (viewBox) {
                    const parts = viewBox.split(' ');
                    width = parseInt(parts[2]);
                    height = parseInt(parts[3]);
                } 
                // Se não tem viewBox, usar atributos width/height
                else if (svgElement.getAttribute('width') && svgElement.getAttribute('height')) {
                    width = parseInt(svgElement.getAttribute('width'));
                    height = parseInt(svgElement.getAttribute('height'));
                }
                // Se não tem nenhum, usar dimensões da imagem carregada
                else {
                    width = img.naturalWidth || img.width;
                    height = img.naturalHeight || img.height;
                }
                
                // Se ainda não tem dimensões, usar padrão
                if (!width || !height || isNaN(width) || isNaN(height)) {
                    width = img.naturalWidth || img.width;
                    height = img.naturalHeight || img.height;
                }
                
                console.log('📐 Dimensões originais do SVG:', { width, height });
                
                // 5. Criar canvas com as dimensões EXATAS do convite
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                // 6. Desenhar imagem no canvas (sem fundo branco!)
                const ctx = canvas.getContext('2d');
                
                // IMPORTANTE: Limpar canvas para transparente
                ctx.clearRect(0, 0, width, height);
                
                // Desenhar SVG mantendo proporções originais
                ctx.drawImage(img, 0, 0, width, height);
                
                // 7. Converter para PNG (com fundo transparente se o SVG tiver)
                const pngData = canvas.toDataURL('image/png', 1.0);
                
                // 8. Limpar URL
                URL.revokeObjectURL(svgUrl);
                
                resolve(pngData);
            };
            
            img.onerror = function() {
                URL.revokeObjectURL(svgUrl);
                reject(new Error('Erro ao carregar imagem SVG'));
            };
            
            // Carregar a imagem
            img.src = svgUrl;
            
        } catch (error) {
            reject(error);
        }
    });
}

// FUNÇÃO PARA OBTER DIMENSÕES PRECISAS DO SVG
function getOriginalSVGDimensions() {
    if (!svgElement) return { width: 800, height: 1131 }; // Default A4
    
    let width, height;
    
    // 1. Tentar viewBox (mais preciso)
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
        const parts = viewBox.split(' ');
        if (parts.length >= 4) {
            width = Math.round(parseFloat(parts[2]));
            height = Math.round(parseFloat(parts[3]));
            console.log('📏 Dimensões do viewBox:', width, 'x', height);
            return { width, height };
        }
    }
    
    // 2. Tentar atributos width/height
    const svgWidth = svgElement.getAttribute('width');
    const svgHeight = svgElement.getAttribute('height');
    
    if (svgWidth && svgHeight) {
        // Remover unidades (px, pt, etc)
        width = parseFloat(svgWidth);
        height = parseFloat(svgHeight);
        console.log('📏 Dimensões dos atributos:', width, 'x', height);
        return { width, height };
    }
    
    // 3. Tentar estilo CSS
    const style = window.getComputedStyle(svgElement);
    if (style.width && style.height) {
        width = parseFloat(style.width);
        height = parseFloat(style.height);
        console.log('📏 Dimensões do estilo:', width, 'x', height);
        return { width, height };
    }
    
    // 4. Usar dimensões padrão do seu convite (ajuste conforme necessário)
    console.log('⚠️ Usando dimensões padrão');
    return { width: 800, height: 1131 }; // Ajuste para o tamanho do SEU convite
}
// MÉTODO ALTERNATIVO: Se o método principal falhar
function tryAlternativePNGMethod(btn) {
    console.log('Tentando método alternativo para PNG...');
    
    // Método 2: Usar html2canvas como fallback
    const svgContainer = document.querySelector('#svgContainer svg');
    
    if (!svgContainer) {
        showNotification('Erro: SVG não encontrado', 'error');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-image"></i> Baixar PNG';
            btn.disabled = false;
        }
        return;
    }
    
    // Salvar estilo original
    const originalStyle = svgContainer.getAttribute('style');
    
    // Aplicar estilos para melhor conversão
    svgContainer.style.width = '100%';
    svgContainer.style.height = 'auto';
    svgContainer.style.display = 'block';
    
    // Dar tempo para renderizar
    setTimeout(() => {
        html2canvas(svgContainer, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            removeContainer: true
        }).then(canvas => {
            // Restaurar estilo original
            if (originalStyle) {
                svgContainer.setAttribute('style', originalStyle);
            } else {
                svgContainer.removeAttribute('style');
            }
            
            // Converter para PNG
            const pngData = canvas.toDataURL('image/png', 1.0);
            downloadFile(pngData, `${currentFileName}.png`, 'image/png');
            
            if (btn) {
                btn.innerHTML = '<i class="fas fa-image"></i> Baixar PNG';
                btn.disabled = false;
            }
            
            showNotification('PNG baixado com sucesso! (Método alternativo)', 'success');
            
        }).catch(error => {
            console.error('Método alternativo também falhou:', error);
            
            // Restaurar estilo em caso de erro
            if (originalStyle) {
                svgContainer.setAttribute('style', originalStyle);
            }
            
            if (btn) {
                btn.innerHTML = '<i class="fas fa-image"></i> Baixar PNG';
                btn.disabled = false;
            }
            
            showNotification('Erro ao gerar PNG. Tente baixar como SVG.', 'error');
            
            // Método 3: Sugerir converter online
            showConversionAlternative();
        });
    }, 500);
}

// ADICIONE no final do loadSVGWithProgress()
function analyzeSVGDimensions() {
    console.log('🔍 ANALISANDO DIMENSÕES DO SVG:');
    console.log('1. viewBox:', svgElement.getAttribute('viewBox'));
    console.log('2. width:', svgElement.getAttribute('width'));
    console.log('3. height:', svgElement.getAttribute('height'));
    console.log('4. style:', svgElement.getAttribute('style'));
    
    // Ver dimensões reais na tela
    const rect = svgElement.getBoundingClientRect();
    console.log('5. Na tela:', rect.width + 'x' + rect.height);
    
    // Sugerir dimensões
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
        const parts = viewBox.split(' ');
        if (parts.length >= 4) {
            const suggestedWidth = parseInt(parts[2]);
            const suggestedHeight = parseInt(parts[3]);
            console.log('💡 SUGESTÃO: Use', suggestedWidth + 'x' + suggestedHeight);
        }
    }
}

// Chame esta função depois de carregar o SVG
analyzeSVGDimensions();

// FUNÇÃO AUXILIAR PARA DOWNLOAD
function downloadFile(data, filename, mimeType) {
    try {
        // Criar link temporário
        const link = document.createElement('a');
        link.href = data;
        link.download = filename;
        
        // Configurar para diferentes tipos de dados
        if (data.startsWith('data:')) {
            // Já está em base64
        } else {
            // Criar blob se necessário
            const blob = new Blob([data], {type: mimeType});
            link.href = URL.createObjectURL(blob);
        }
        
        // Disparar download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpar URL se foi criada
        if (link.href.startsWith('blob:')) {
            setTimeout(() => URL.revokeObjectURL(link.href), 100);
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao criar download:', error);
        return false;
    }
}

// SUGESTÃO DE CONVERSÃO ONLINE SE TUDO FALHAR
function showConversionAlternative() {
    const alternativeDiv = document.createElement('div');
    alternativeDiv.className = 'alternative-solution';
    alternativeDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 500px;
            width: 90%;
            text-align: center;
        ">
            <h3 style="color: #e91e63; margin-bottom: 20px;">
                <i class="fas fa-tools"></i> Alternativa de Conversão
            </h3>
            <p>O PNG não pôde ser gerado automaticamente. Sugestões:</p>
            <ol style="text-align: left; margin: 20px;">
                <li>Baixe o SVG e converta online em:</li>
                <ul>
                    <li><a href="https://convertio.co/svg-png/" target="_blank">Convertio</a></li>
                    <li><a href="https://svgtopng.com/" target="_blank">SVGtoPNG</a></li>
                    <li><a href="https://www.freeconvert.com/svg-to-png" target="_blank">FreeConvert</a></li>
                </ul>
                <li>Ou abra o SVG no navegador e tire um print screen</li>
            </ol>
            <div style="margin-top: 25px;">
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="padding: 10px 25px; background: #e91e63; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Entendi
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(alternativeDiv);
}

// ADICIONE ESTA FUNÇÃO PARA TESTAR O SVG
function testSVGForPNGConversion() {
    console.log('🔍 Testando SVG para conversão PNG...');
    
    if (!svgElement) {
        console.error('SVG não carregado');
        return;
    }
    
    // Verificar características do SVG
    const svgString = new XMLSerializer().serializeToString(svgElement);
    
    console.log('📊 Informações do SVG:');
    console.log('- Tamanho:', svgString.length, 'caracteres');
    console.log('- Tem imagens externas:', svgString.includes('xlink:href="http'));
    console.log('- Tem base64 images:', svgString.includes('base64'));
    console.log('- Tem elementos foreignObject:', svgString.includes('foreignObject'));
    
    // Testar conversão simples
    const img = new Image();
    const svgBlob = new Blob([svgString], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = function() {
        console.log('✅ SVG pode ser carregado como imagem:', img.width, 'x', img.height);
        URL.revokeObjectURL(url);
    };
    
    img.onerror = function() {
        console.error('❌ SVG não pode ser carregado como imagem');
        URL.revokeObjectURL(url);
        
        // Verificar problemas comuns
        if (svgString.includes('<!ENTITY')) {
            console.warn('⚠️ SVG contém entidades XML que podem causar problemas');
        }
    };
    
    img.src = url;
}

// ADICIONE NO FINAL DO loadSVGWithProgress (depois de svgElement = ...)
// Adicione esta linha:
console.log('SVG carregado, testando compatibilidade PNG...');
testSVGForPNGConversion();

function showNotification(message, type) {
    // Remover notificações antigas
    const oldNotifications = document.querySelectorAll('.notification');
    oldNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                         type === 'info' ? 'info-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 4 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Atalhos de teclado
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        downloadSVG();
    }
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        downloadPNG();
    }
});