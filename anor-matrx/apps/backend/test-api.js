const http = require('http');

const baseUrl = '127.0.0.1';
const port = 3002;

function httpGet(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://${baseUrl}:${port}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => reject(new Error('timeout')));
  });
}

function httpPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(`http://${baseUrl}:${port}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: responseData });
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
    req.setTimeout(30000, () => reject(new Error('timeout')));
  });
}

async function runTests() {
  const results = [];
  
  try {
    // Test 1: Settings
    console.log('Test 1: GET /api/settings');
    const t1 = await httpGet('/api/settings');
    results.push({ test: 'settings', ...t1 });
    console.log(JSON.stringify(t1, null, 2));
    
    // Test 2: Logs
    console.log('\nTest 2: GET /api/logs');
    const t2 = await httpGet('/api/logs');
    results.push({ test: 'logs', ...t2 });
    console.log(JSON.stringify(t2, null, 2));
    
    // Test 3: Providers Health
    console.log('\nTest 3: GET /api/providers/health');
    const t3 = await httpGet('/api/providers/health');
    results.push({ test: 'providers health', ...t3 });
    console.log(JSON.stringify(t3, null, 2));
    
    // Test 4: Ollama Health
    console.log('\nTest 4: GET /api/ollama/health');
    const t4 = await httpGet('/api/ollama/health');
    results.push({ test: 'ollama health', ...t4 });
    console.log(JSON.stringify(t4, null, 2));
    
    // Test 5: OpenClaw Health
    console.log('\nTest 5: GET /api/openclw/health');
    const t5 = await httpGet('/api/openclw/health');
    results.push({ test: 'openclaw health', ...t5 });
    console.log(JSON.stringify(t5, null, 2));
    
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));
}

runTests();