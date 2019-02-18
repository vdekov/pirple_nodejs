/*
 * Requirements
 * - Create RESTful JSON API on a random port
 * - Each request to the `/hello` route should return a welcome message in JSON format
 */

// Dependencies
const http = require( 'http' );
const url = require( 'url' );
const { port } = require( './config' );
const getHandler = require( './handlers' );

// Server incoming request listener function
const listener = async ( request, response ) => {
   // Get pathname of the current request and trim it (remove frontal and trailing backslashes)
   const pathname = url.parse( request.url ).pathname;
   const trimmed_pathname = pathname.replace( /^\/+|\/+$/g, '');

   // Get a promisable handler based on the path
   const handler = getHandler( trimmed_pathname );
   const { status_code, payload } = await handler();
   response.setHeader( 'Content-Type', 'application/json' );
   response.writeHead( status_code );
   response.end( JSON.stringify( payload ) );
};

// Create and start the HTTP server
const server = http.createServer( listener );
server.listen( port, () => {
   console.log( `HTTP Server is listening on port ${port}` );
});
