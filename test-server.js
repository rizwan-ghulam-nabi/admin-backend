require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

// Import routes directly
const routes = require('./src/routes');

// Debug
console.log('routes type:', typeof routes);
console.log('routes.name:', routes.name);

app.use('/api', routes);

app.listen(5002, () => {
  console.log('Test server running on port 5002');
});