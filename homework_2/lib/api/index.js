// Dependencies
const users = require( './users' );
const login = require( './login' );
const logout = require( './logout' );
const menu = require( './menu' );

// Object with all available handlers.
// Each handler returns a promise.
const handlers = {};

handlers.default = data => Promise.resolve([ 404 ]);

// Key-value mapping responsible for the `path` -> `handler` connection
const router = {
   users,
   login,
   logout,
   menu,
};

// Function which returns a promisable handler (function) based on a specific path
const getHandler = path => {
   // If doesn't exist a handler in the router - response with the default one
   if ( ! router[ path ] ) {
      return handlers.default;
   }

   return data => {
      const handler = router[ path ];

      // If the request method is an acceptable proxy the request to the private handler
      if ( handler[ data.method ] ) {
         return handler[ data.method ]( data );
      }

      // Resolve the promise with a not allowed status code and the respective message
      return Promise.resolve([
         405,
         {
            message : 'Used HTTP request type isn\'t allowed.',
            data    : null,
         }
      ]);
   };  
}

module.exports = getHandler;
