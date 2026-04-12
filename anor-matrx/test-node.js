const axios = require('axios');
axios.get('http://127.0.0.1:11434/api/tags', { timeout: 5000 })
  .then(r => console.log(JSON.stringify(r.data)))
  .catch(e => console.error(e.message));