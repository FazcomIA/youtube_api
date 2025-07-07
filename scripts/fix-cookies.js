#!/usr/bin/env node

/**
 * Script para diagnosticar e corrigir problemas com cookies padrão no servidor
 * Força a inicialização dos cookies padrão quando o sistema está corrompido
 */

const fs = require('fs').promises;
const path = require('path');

console.log('🔧 DIAGNÓSTICO E CORREÇÃO DO SISTEMA DE COOKIES');
console.log('================================================');

const cookiesDir = path.join(process.cwd(), 'data', 'cookies');
const cookiesFile = path.join(cookiesDir, 'youtube_cookies.json');

// Cookies padrão funcionais (mesmos do cookieManager.js)
const defaultCookies = [
    {
        name: "VISITOR_INFO1_LIVE",
        value: "fOKvisitODg",
        domain: ".youtube.com",
        path: "/",
        secure: true,
        httpOnly: true
    },
    {
        name: "YSC", 
        value: "dQw4w9WgXcQ",
        domain: ".youtube.com",
        path: "/",
        secure: true,
        httpOnly: false
    },
    {
        name: "CONSENT",
        value: "YES+cb.20210328-17-p0.en+FX+569",
        domain: ".youtube.com",
        path: "/",
        secure: true,
        httpOnly: false
    },
    {
        name: "PREF",
        value: "f6=40000000&hl=pt&gl=BR",
        domain: ".youtube.com",
        path: "/",
        secure: true,
        httpOnly: false
    }
];

async function diagnosticAndFix() {
    try {
        console.log('📋 Etapa 1: Diagnóstico...');
        
        // Verificar se o diretório existe
        try {
            await fs.access(cookiesDir);
            console.log('✅ Diretório de cookies existe:', cookiesDir);
        } catch (error) {
            console.log('❌ Diretório de cookies não existe, criando...');
            await fs.mkdir(cookiesDir, { recursive: true });
            console.log('✅ Diretório criado:', cookiesDir);
        }
        
        // Verificar se o arquivo de cookies existe
        let hasFile = false;
        try {
            await fs.access(cookiesFile);
            hasFile = true;
            console.log('📝 Arquivo de cookies existe:', cookiesFile);
            
            // Verificar conteúdo
            const content = await fs.readFile(cookiesFile, 'utf8');
            try {
                const cookies = JSON.parse(content);
                console.log(`📊 Cookies encontrados: ${cookies.length}`);
                if (cookies.length === 0) {
                    console.log('⚠️ Arquivo vazio detectado');
                }
            } catch (parseError) {
                console.log('❌ Arquivo corrompido detectado');
                hasFile = false; // Força recriação
            }
        } catch (error) {
            console.log('📝 Arquivo de cookies não existe');
        }
        
        // Forçar criação dos cookies padrão
        console.log('\n🔄 Etapa 2: Aplicando correção...');
        
        if (hasFile) {
            console.log('🗑️ Removendo arquivo existente...');
            await fs.unlink(cookiesFile);
        }
        
        console.log('💾 Criando cookies padrão...');
        await fs.writeFile(cookiesFile, JSON.stringify(defaultCookies, null, 2));
        
        console.log('\n✅ CORREÇÃO APLICADA COM SUCESSO!');
        console.log('================================================');
        console.log(`📁 Arquivo: ${cookiesFile}`);
        console.log(`🍪 Cookies: ${defaultCookies.length} cookies padrão`);
        console.log('📋 Detalhes dos cookies:');
        
        defaultCookies.forEach((cookie, index) => {
            console.log(`   ${index + 1}. ${cookie.name} - ${getDescription(cookie.name)}`);
        });
        
        console.log('\n🚀 PRÓXIMOS PASSOS:');
        console.log('1. Reinicie a API no servidor');
        console.log('2. Teste a rota /health primeiro');
        console.log('3. Teste a rota /api/cookies/status');
        console.log('4. Teste uma transcrição');
        
        console.log('\n💡 COMANDOS PARA TESTAR:');
        console.log('curl -X GET https://sua-api.com/health');
        console.log('curl -X GET https://sua-api.com/api/cookies/status');
        
        return true;
        
    } catch (error) {
        console.error('\n❌ ERRO DURANTE A CORREÇÃO:');
        console.error(error.message);
        console.error('\n🔧 AÇÕES MANUAIS:');
        console.error('1. Verifique permissões da pasta data/cookies');
        console.error('2. Verifique se o processo tem acesso de escrita');
        console.error('3. Tente executar como administrador se necessário');
        return false;
    }
}

function getDescription(cookieName) {
    const descriptions = {
        'VISITOR_INFO1_LIVE': 'Identificação do visitante - essencial',
        'YSC': 'Sessão do YouTube - controle anti-bot',
        'CONSENT': 'Consentimento de cookies (GDPR)',
        'PREF': 'Preferências do usuário (PT-BR)'
    };
    return descriptions[cookieName] || 'Cookie funcional';
}

// Executar se for chamado diretamente
if (require.main === module) {
    diagnosticAndFix()
        .then((success) => {
            process.exit(success ? 0 : 1);
        })
        .catch((error) => {
            console.error('Erro fatal:', error.message);
            process.exit(1);
        });
}

module.exports = { diagnosticAndFix, defaultCookies }; 