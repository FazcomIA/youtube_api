#!/usr/bin/env node

/**
 * Health check script para Docker - FCI - API Youtube v1
 * Verifica se a aplicação está respondendo corretamente
 */

const http = require('http');

const port = process.env.PORT || 3000;

const options = {
    hostname: 'localhost',
    port: port,
    path: '/health',
    method: 'GET',
    timeout: 5000
};

const healthCheck = () => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            if (res.statusCode === 200) {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const healthData = JSON.parse(data);
                        if (healthData.status === 'healthy') {
                            resolve(healthData);
                        } else {
                            reject(new Error(`Health check failed: ${healthData.status}`));
                        }
                    } catch (error) {
                        reject(new Error(`Invalid health check response: ${error.message}`));
                    }
                });
            } else {
                reject(new Error(`Health check failed with status: ${res.statusCode}`));
            }
        });

        req.on('error', (error) => {
            reject(new Error(`Health check request failed: ${error.message}`));
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Health check timeout'));
        });

        req.setTimeout(options.timeout);
        req.end();
    });
};

// Executar health check
healthCheck()
    .then((result) => {
        console.log('✅ Health check passed:', result.status);
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Health check failed:', error.message);
        process.exit(1);
    }); 