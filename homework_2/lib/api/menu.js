// Dependencies
const menu_list = require( './menu.json' );
const storage = require( './../storage' );
const config = require( './../config' );

// Create the get menu list handler
const getMenu = async data => {
   // Get the token id from the request headers
   const token_id = typeof data.headers.token === 'string' && data.headers.token.trim().length === config.token_length ? data.headers.token.trim() : false;

   // Validate the user token
   if ( ! token_id ) {
      return Promise.resolve([
         400,
         {
            message : 'You have to provide a valid token in the request headers.',
            data    : null,
         }
      ]);
   }

   // Verify that the provided token exists as a record in the storage
   try {
      var token_object = await storage.read( 'tokens', token_id );
   } catch ( error ) {
      return Promise.resolve([
         404,
         {
            message : 'The provided token can\'t be found. Please, provide a new one.',
            data    : null,
         }
      ]);
   }

   // Verify that the token is still valid (not expired)
   if ( token_object.expires < Date.now() ) {
      return Promise.resolve([
         403,
         {
            message : 'The provided token has already expired. Please, provide a valid one.',
            data    : null,
         }
      ]);
   }

   return Promise.resolve( [ 200, menu_list.products ] );
};

module.exports = {
   'get' : getMenu,
}
