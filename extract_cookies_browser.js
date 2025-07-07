/**
 * 🍪 EXTRATOR DE COOKIES DO YOUTUBE
 * 
 * INSTRUÇÕES DE USO:
 * 1. Abra o YouTube (https://www.youtube.com) no seu navegador
 * 2. Faça login na sua conta (recomendado para melhor estabilidade)
 * 3. Abra as ferramentas de desenvolvedor (F12)
 * 4. Vá para a aba "Console"
 * 5. Cole todo este código e pressione Enter
 * 6. Copie o JSON retornado e use na rota POST /api/cookies/upload
 * 
 * IMPORTANTE: Execute este script APENAS no domínio youtube.com
 */

(function() {
    'use strict';
    
    // Verificar se estamos no domínio correto
    if (!window.location.hostname.includes('youtube.com')) {
        console.error('❌ Este script deve ser executado apenas no domínio youtube.com');
        console.error('👉 Acesse https://www.youtube.com primeiro');
        return;
    }
    
    console.log('🍪 EXTRATOR DE COOKIES DO YOUTUBE');
    console.log('================================');
    console.log('🌐 Domínio detectado:', window.location.hostname);
    console.log('👤 Usuário logado:', document.querySelector('ytd-topbar-menu-button-renderer') ? 'Sim' : 'Não');
    console.log('');
    
    // Função para extrair todos os cookies relevantes
    function extractYoutubeCookies() {
        const cookies = [];
        const allCookies = document.cookie.split(';');
        
        console.log('📊 Total de cookies encontrados:', allCookies.length);
        
        // Cookies importantes do YouTube para transcrições
        const importantCookies = [
            'VISITOR_INFO1_LIVE',
            'YSC', 
            'CONSENT',
            'PREF',
            'GPS',
            'LOGIN_INFO',
            'SID',
            'HSID', 
            'SSID',
            'APISID',
            'SAPISID',
            '__Secure-YEC',
            'wide',
            'f6'
        ];
        
        // Extrair e formatar cookies
        for (let cookie of allCookies) {
            const [name, ...valueParts] = cookie.trim().split('=');
            const value = valueParts.join('=');
            
            if (name && value) {
                const cookieObj = {
                    name: name.trim(),
                    value: value.trim(),
                    domain: '.youtube.com',
                    path: '/',
                    secure: true,
                    httpOnly: false // Browser cookies são acessíveis via JS
                };
                
                // Marcar cookies importantes
                if (importantCookies.includes(name.trim())) {
                    cookieObj.important = true;
                }
                
                cookies.push(cookieObj);
            }
        }
        
        return cookies;
    }
    
    // Função para gerar informações adicionais
    function generateCookieInfo(cookies) {
        const important = cookies.filter(c => c.important);
        const optional = cookies.filter(c => !c.important);
        
        return {
            total: cookies.length,
            important: important.length,
            optional: optional.length,
            importantNames: important.map(c => c.name),
            extractedAt: new Date().toISOString(),
            userAgent: navigator.userAgent,
            domain: window.location.hostname
        };
    }
    
    try {
        // Extrair cookies
        const extractedCookies = extractYoutubeCookies();
        
        if (extractedCookies.length === 0) {
            console.error('❌ Nenhum cookie encontrado!');
            console.error('💡 Dica: Certifique-se de estar logado no YouTube');
            return;
        }
        
        // Gerar informações
        const info = generateCookieInfo(extractedCookies);
        
        // Remover a propriedade 'important' dos cookies (apenas para logging)
        const cleanCookies = extractedCookies.map(cookie => {
            const {important, ...cleanCookie} = cookie;
            return cleanCookie;
        });
        
        // JSON final para upload na API
        const uploadPayload = {
            cookies: cleanCookies
        };
        
        // Exibir informações
        console.log('✅ EXTRAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('==================================');
        console.log('📊 Estatísticas:');
        console.log(`   • Total de cookies: ${info.total}`);
        console.log(`   • Cookies importantes: ${info.important}`);
        console.log(`   • Cookies opcionais: ${info.optional}`);
        console.log('');
        console.log('🔑 Cookies importantes encontrados:');
        info.importantNames.forEach(name => {
            console.log(`   ✓ ${name}`);
        });
        console.log('');
        console.log('📋 JSON PARA UPLOAD NA API:');
        console.log('===========================');
        console.log('');
        
        // Mostrar o JSON formatado
        const jsonString = JSON.stringify(uploadPayload, null, 2);
        console.log(jsonString);
        
        console.log('');
        console.log('📤 COMO USAR:');
        console.log('=============');
        console.log('1. Copie o JSON acima (desde { até })');
        console.log('2. Use em uma requisição POST para /api/cookies/upload');
        console.log('');
        console.log('💻 Exemplo com curl:');
        console.log('curl -X POST https://sua-api.com/api/cookies/upload \\');
        console.log('  -H "Content-Type: application/json" \\');
        console.log('  -d \'<COLE_O_JSON_AQUI>\'');
        console.log('');
        console.log('🔄 Para copiar automaticamente (se suportado):');
        
        // Tentar copiar para área de transferência
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(jsonString).then(() => {
                console.log('✅ JSON copiado para área de transferência!');
            }).catch(() => {
                console.log('⚠️ Não foi possível copiar automaticamente');
            });
        } else {
            console.log('⚠️ Cópia automática não suportada - copie manualmente');
        }
        
        console.log('');
        console.log('⚡ DICAS DE SEGURANÇA:');
        console.log('=====================');
        console.log('• Não compartilhe estes cookies publicamente');
        console.log('• Estes cookies têm acesso à sua conta YouTube');
        console.log('• Use apenas em servidores que você controla');
        console.log('• Cookies podem expirar e precisar ser atualizados');
        
        // Retornar para caso alguém queira usar o resultado
        return uploadPayload;
        
    } catch (error) {
        console.error('❌ ERRO DURANTE A EXTRAÇÃO:');
        console.error(error.message);
        console.error('');
        console.error('🔧 POSSÍVEIS SOLUÇÕES:');
        console.error('• Atualize a página e tente novamente');
        console.error('• Certifique-se de estar logado no YouTube');
        console.error('• Verifique se não há extensões bloqueando scripts');
    }
})();

// Adicionar função global para re-extrair se necessário
window.extractYoutubeCookies = function() {
    console.log('🔄 Re-executando extração de cookies...');
    // Re-executar a função principal
    location.reload();
};

console.log('');
console.log('💡 DICA: Se precisar extrair novamente, digite: extractYoutubeCookies()'); 