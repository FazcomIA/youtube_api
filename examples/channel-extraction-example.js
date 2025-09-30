/**
 * Exemplo de uso das novas funcionalidades de extração de vídeos de canais
 * 
 * Este exemplo demonstra como usar os 3 novos endpoints:
 * - /api/channel/videos - Extração completa de vídeos
 * - /api/channel/urls - Apenas URLs dos vídeos
 * - /api/channel/basic - Informações básicas dos vídeos
 */

const API_BASE_URL = 'http://localhost:3000';

async function testChannelExtraction() {
    const channelHandle = 'FazcomIA'; // Pode usar com ou sem @
    
    console.log('🧪 Testando extração de vídeos de canal...\n');
    
    try {
        // 1. Extração completa de vídeos
        console.log('📺 1. Extraindo todos os vídeos do canal...');
        const fullResponse = await fetch(`${API_BASE_URL}/api/channel/videos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channelHandle })
        });
        
        if (!fullResponse.ok) {
            throw new Error(`Erro HTTP: ${fullResponse.status}`);
        }
        
        const fullData = await fullResponse.json();
        console.log(`✅ Encontrados ${fullData.data.totalVideos} vídeos`);
        console.log('📋 Primeiros 3 vídeos:');
        fullData.data.videos.slice(0, 3).forEach((video, index) => {
            console.log(`   ${index + 1}. ${video.title}`);
            console.log(`      URL: ${video.url}`);
            console.log(`      Duração: ${video.duration}`);
            console.log(`      Views: ${video.viewCount}`);
            console.log(`      Publicado: ${video.publishedTime}`);
            console.log('');
        });
        
        // 2. Extração de apenas URLs
        console.log('🔗 2. Extraindo apenas URLs dos vídeos...');
        const urlsResponse = await fetch(`${API_BASE_URL}/api/channel/urls`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channelHandle })
        });
        
        if (!urlsResponse.ok) {
            throw new Error(`Erro HTTP: ${urlsResponse.status}`);
        }
        
        const urlsData = await urlsResponse.json();
        console.log(`✅ Encontradas ${urlsData.data.totalVideos} URLs`);
        console.log('🔗 Primeiras 3 URLs:');
        urlsData.data.urls.slice(0, 3).forEach((url, index) => {
            console.log(`   ${index + 1}. ${url}`);
        });
        console.log('');
        
        // 3. Informações básicas
        console.log('📊 3. Extraindo informações básicas dos vídeos...');
        const basicResponse = await fetch(`${API_BASE_URL}/api/channel/basic`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channelHandle })
        });
        
        if (!basicResponse.ok) {
            throw new Error(`Erro HTTP: ${basicResponse.status}`);
        }
        
        const basicData = await basicResponse.json();
        console.log(`✅ Encontrados ${basicData.data.totalVideos} vídeos com informações básicas`);
        console.log('📊 Primeiros 3 vídeos:');
        basicData.data.videos.slice(0, 3).forEach((video, index) => {
            console.log(`   ${index + 1}. ${video.title}`);
            console.log(`      ID: ${video.id}`);
            console.log(`      URL: ${video.url}`);
            console.log(`      Duração: ${video.duration}`);
            console.log(`      Views: ${video.viewCount}`);
            console.log(`      Publicado: ${video.publishedTime}`);
            console.log('');
        });
        
        console.log('🎉 Todos os testes passaram com sucesso!');
        console.log('\n📝 Resumo das funcionalidades:');
        console.log('   • /api/channel/videos - Extração completa com todas as informações');
        console.log('   • /api/channel/urls - Apenas URLs para processamento em lote');
        console.log('   • /api/channel/basic - Informações essenciais para listagens');
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error.message);
    }
}

// Função para testar com diferentes canais
async function testMultipleChannels() {
    const channels = ['FazcomIA', '@RedCastOficial', 'gabrielcmadureira'];
    
    console.log('\n🧪 Testando múltiplos canais...\n');
    
    for (const channel of channels) {
        try {
            console.log(`📺 Testando canal: ${channel}`);
            
            const response = await fetch(`${API_BASE_URL}/api/channel/basic`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channelHandle: channel })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${data.data.totalVideos} vídeos encontrados`);
                console.log(`   Primeiro vídeo: ${data.data.videos[0]?.title || 'N/A'}`);
            } else {
                console.log(`❌ Erro: ${response.status}`);
            }
            console.log('');
            
        } catch (error) {
            console.error(`❌ Erro ao testar canal ${channel}:`, error.message);
        }
    }
}

// Executar os testes
async function main() {
    await testChannelExtraction();
    await testMultipleChannels();
}

// Executar se este arquivo for executado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testChannelExtraction, testMultipleChannels }; 