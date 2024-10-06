const express = require('express');
const app = express();
const port = 3000;

// Import the router from src/routes
const {router: apiRoutes, closeRpcClient} = require('./src/routes');

// Built-in middleware to parse JSON
app.use(express.json());

// Use the routes
app.use('/api', apiRoutes);

// Start the server
const server = app.listen(port, () => {
  console.log(`API is listening at http://localhost:${port}`);
});


// Call the shutdown handler and pass the server
// Register the shutdown logic
function handleShutdown(server) {
  process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down gracefully...');
    closeRpcClient();
    server.close(() => {
      console.log('Closed out remaining connections.');
      process.exit(0);
    });

    // Forcefully shut down if not closed in time
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down.');
      process.exit(1);
    }, 10000);
  });

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Shutting down gracefully...');
    server.close(() => {
      console.log('Closed out remaining connections.');
      process.exit(0);
    });
  });
}
handleShutdown(server);