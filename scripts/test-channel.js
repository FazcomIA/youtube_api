const ChannelService = require('../src/services/channelService');

async function testChannelExtraction() {
    const channelService = new ChannelService();
    
    try {
        console.log('🧪 Testando extração de vídeos de canal...\n');
        
        // Teste com um canal conhecido
        const channelHandle = 'FazcomIA';
        
        console.log(`📺 Testando canal: @${channelHandle}`);
        
        // Teste 1: Extrair todos os vídeos
        console.log('\n1️⃣ Testando extração completa de vídeos...');
        const result = await channelService.getChannelVideos(channelHandle);
        console.log(`✅ Sucesso! Encontrados ${result.totalVideos} vídeos`);
        console.log('📋 Primeiros 3 vídeos:');
        result.videos.slice(0, 3).forEach((video, index) => {
            console.log(`   ${index + 1}. ${video.title}`);
            console.log(`      URL: ${video.url}`);
            console.log(`      Duração: ${video.duration || 'N/A'}`);
            console.log(`      Views: ${video.viewCount || 'N/A'}`);
            console.log('');
        });
        
        // Teste 2: Extrair apenas URLs
        console.log('2️⃣ Testando extração de URLs...');
        const urls = await channelService.getChannelVideoUrls(channelHandle);
        console.log(`✅ Sucesso! ${urls.length} URLs extraídas`);
        console.log('🔗 Primeiras 3 URLs:');
        urls.slice(0, 3).forEach((url, index) => {
            console.log(`   ${index + 1}. ${url}`);
        });
        console.log('');
        
        // Teste 3: Extrair informações básicas
        console.log('3️⃣ Testando extração de informações básicas...');
        const basicInfo = await channelService.getChannelVideoBasicInfo(channelHandle);
        console.log(`✅ Sucesso! ${basicInfo.length} vídeos com informações básicas`);
        console.log('📊 Primeiros 3 vídeos:');
        basicInfo.slice(0, 3).forEach((video, index) => {
            console.log(`   ${index + 1}. ${video.title}`);
            console.log(`      ID: ${video.id}`);
            console.log(`      Duração: ${video.duration || 'N/A'}`);
            console.log(`      Views: ${video.viewCount || 'N/A'}`);
            console.log(`      Publicado: ${video.publishedTime || 'N/A'}`);
            console.log('');
        });
        
        console.log('🎉 Todos os testes passaram com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testChannelExtraction(); 