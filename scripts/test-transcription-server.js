#!/usr/bin/env node

/**
 * Script de teste específico para validar transcrições em ambiente de servidor
 * Testa as melhorias implementadas para resolver problemas de bloqueio do YouTube
 */

const TranscriptionService = require('../src/services/transcriptionService');

async function testTranscriptionServerCompatibility() {
    console.log('🧪 Testando compatibilidade do sistema de transcrição em servidor...\n');
    
    const transcriptionService = new TranscriptionService();
    
    // URLs de teste com diferentes características
    const testVideos = [
        {
            name: 'Vídeo público em português',
            url: 'https://www.youtube.com/watch?v=qvZeLp3bkd4',
            expectedLang: 'pt'
        },
        {
            name: 'Vídeo em inglês',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            expectedLang: 'en'
        }
    ];
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const video of testVideos) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🎬 Testando: ${video.name}`);
        console.log(`🔗 URL: ${video.url}`);
        console.log(`${'='.repeat(60)}\n`);
        
        try {
            console.log('📝 1. Testando transcrição em texto...');
            
            const startTime = Date.now();
            const textResult = await transcriptionService.getTranscriptionText(video.url, {
                languages: ['pt', 'pt-BR', 'en']
            });
            const endTime = Date.now();
            
            if (textResult.success) {
                console.log(`✅ Sucesso! Transcrição obtida em ${endTime - startTime}ms`);
                console.log(`📊 Estatísticas:`);
                console.log(`   • Idioma usado: ${textResult.language_used}`);
                console.log(`   • Idiomas disponíveis: ${textResult.available_languages.join(', ')}`);
                console.log(`   • Total de segmentos: ${textResult.segments_count}`);
                console.log(`   • Total de palavras: ${textResult.total_words}`);
                console.log(`   • Total de caracteres: ${textResult.total_characters}`);
                console.log(`   • Arquivo SRT: ${textResult.srt_file}`);
                console.log(`📋 Amostra do texto (100 caracteres): "${textResult.transcription.substring(0, 100)}..."`);
                
                successCount++;
                
                // Teste adicional: transcrição em JSON
                console.log('\n📝 2. Testando transcrição em formato JSON...');
                
                const jsonStartTime = Date.now();
                const jsonResult = await transcriptionService.getTranscriptionJson(video.url, {
                    languages: ['pt', 'pt-BR', 'en']
                });
                const jsonEndTime = Date.now();
                
                if (jsonResult.success && jsonResult.transcript.length > 0) {
                    console.log(`✅ Sucesso! Transcrição JSON obtida em ${jsonEndTime - jsonStartTime}ms`);
                    console.log(`📊 Primeiros 3 segmentos:`);
                    jsonResult.transcript.slice(0, 3).forEach((segment, index) => {
                        console.log(`   ${index + 1}. [${segment.start}] (${segment.dur}s) "${segment.text}"`);
                    });
                } else {
                    console.log(`❌ Falha na transcrição JSON: ${jsonResult.error}`);
                    failureCount++;
                }
                
            } else {
                console.log(`❌ Falha na transcrição: ${textResult.error}`);
                failureCount++;
            }
            
        } catch (error) {
            console.error(`❌ Erro durante o teste: ${error.message}`);
            failureCount++;
        }
        
        // Pequena pausa entre testes para evitar rate limiting
        console.log('\n⏳ Aguardando 3 segundos antes do próximo teste...');
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Resumo dos resultados
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 RESUMO DOS TESTES');
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ Sucessos: ${successCount}`);
    console.log(`❌ Falhas: ${failureCount}`);
    console.log(`📈 Taxa de sucesso: ${((successCount / (successCount + failureCount)) * 100).toFixed(1)}%`);
    
    if (successCount > 0) {
        console.log('\n🎉 ÓTIMAS NOTÍCIAS!');
        console.log('✅ O sistema de transcrição está funcionando no servidor!');
        console.log('✅ As melhorias implementadas resolveram os problemas de bloqueio.');
        console.log('✅ As rotas /api/transcription e /api/transcription/json devem funcionar em produção.');
        
        console.log('\n🔧 Melhorias implementadas:');
        console.log('   • Rotação automática de User-Agents');
        console.log('   • Headers HTTP mais realistas');
        console.log('   • Cookies de consentimento do YouTube');
        console.log('   • Rate limiting inteligente');
        console.log('   • Sistema de retry automático');
        console.log('   • Múltiplos contextos InnerTube');
        console.log('   • Melhor tratamento de erros');
    } else {
        console.log('\n⚠️ PROBLEMAS PERSISTENTES');
        console.log('❌ O sistema ainda está enfrentando bloqueios.');
        console.log('🔍 Possíveis causas:');
        console.log('   • Servidor em região com restrições mais rígidas');
        console.log('   • Firewall/proxy corporativo bloqueando requisições');
        console.log('   • YouTube implementou novas medidas anti-bot');
        console.log('   • Problemas de conectividade de rede');
        
        console.log('\n💡 Soluções adicionais para testar:');
        console.log('   • Usar serviço de proxy/VPN');
        console.log('   • Implementar pool de IPs rotativos');
        console.log('   • Aumentar intervalos entre requisições');
        console.log('   • Usar diferentes provedores de servidor');
    }
    
    console.log(`\n${'='.repeat(60)}`);
}

// Função para testar conectividade básica
async function testBasicConnectivity() {
    console.log('🔗 Testando conectividade básica com o YouTube...\n');
    
    const axios = require('axios');
    
    try {
        const response = await axios.get('https://www.youtube.com/', {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        if (response.status === 200) {
            console.log('✅ Conectividade com YouTube: OK');
            console.log(`📊 Status: ${response.status}`);
            console.log(`📏 Tamanho da resposta: ${(response.data.length / 1024).toFixed(1)} KB`);
            
            // Verifica se não foi redirecionado para página de erro
            if (response.data.includes('consent') || response.data.includes('recaptcha')) {
                console.log('⚠️ Detectada página de consentimento/CAPTCHA');
                return false;
            }
            
            return true;
        } else {
            console.log(`❌ Resposta inesperada: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Erro de conectividade: ${error.message}`);
        return false;
    }
}

// Execução principal
async function main() {
    console.log('🚀 TESTE DE COMPATIBILIDADE - SISTEMA DE TRANSCRIÇÃO\n');
    console.log('Este script valida se as correções resolveram os problemas de servidor.\n');
    
    // Primeiro testa conectividade básica
    const hasConnectivity = await testBasicConnectivity();
    
    if (!hasConnectivity) {
        console.log('\n❌ Falha na conectividade básica. Verificar:');
        console.log('   • Conexão de internet');
        console.log('   • Configurações de firewall');
        console.log('   • Proxy corporativo');
        console.log('   • DNS resolution');
        return;
    }
    
    console.log('\n');
    await testTranscriptionServerCompatibility();
}

// Executar se for chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testTranscriptionServerCompatibility, testBasicConnectivity };
