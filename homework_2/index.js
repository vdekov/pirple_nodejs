/*
 * Application entry module
 *
 */

// Dependencies
const server = require( './lib/server' );

// Create the module container
const app = {};

// Create the app initialization method
app.init = () => {
   // Run the server
   server.init();
};

// Initialize the application
app.init();

module.exports = app;
