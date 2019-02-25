/*
 * Library containing the server-related tasks
 *
 */

// Dependencies
const http = require( 'http' );
const url = require( 'url' );
const StringDecoder = require( 'string_decoder' ).StringDecoder;
const { port } = require( './config' );
const getHandler = require( './api' );
const helpers = require( './helpers' );

// Create the server container
const server = {};

// Server incoming request listener function
const listener = ( request, response ) => {
   // Parse the request URL
   const parsed_url = url.parse( request.url, true );

   // Get pathname of the current request and trim it (remove frontal and trailing backslashes)
   const trimmed_pathname = parsed_url.pathname.replace( /^\/+|\/+$/g, '');

   // Get the payload (if there was such)
   const decoder = new StringDecoder( 'utf8' );
   let buffer = '';

   // Bind the request on `data` event to collect the payload
   request.on( 'data', data => {
      buffer += decoder.write( data );
   });

   request.on( 'end', async () => {
      buffer += decoder.end();

      // Parse the buffer string to object
      const buffer_object = helpers.parseJsonToObject( buffer );
      // Prepare a data object which should be set to the handler
      const data = {
         headers      : request.headers,
         method       : request.method.toLowerCase(),
         query_params : parsed_url.query,
         payload      : buffer_object,
      };

      // Get a promisable handler based on the path
      const handler = getHandler( trimmed_pathname );
      // Get the handler response as a tuple - status code and a payload
      const [ status_code = 200, payload = {} ] = await handler( data );
      response.setHeader( 'Content-Type', 'application/json' );
      response.writeHead( status_code );
      response.end( JSON.stringify( payload ) );

      // If the RESTful API call response with an unsuccessful status code - print the error in the console.
      if ( status_code != 200 && ! payload.success ) {
         console.log( '\x1b[31m%s\x1b[0m', `> Error: ${payload.message}` );
      }
   });
};

server.init = () => {
   // Create and start the HTTP server
   const server = http.createServer( listener );
   server.listen( port, () => {
      console.log( `HTTP Server is listening on port ${port}` );
   });
};

module.exports = server;
