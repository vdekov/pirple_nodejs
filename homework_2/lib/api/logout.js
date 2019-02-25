/*
 * Logout API endpoint handler.
 * Only accepts HTTP DELETE requests.
 *
 */

// Dependencies
const config = require( './../config' );
const storage = require( './../storage' );

// Destroy a user-created token.
// Required fields: id
// Optional fields: none
const logout = async data => {
   // Extract the required field from the query params object
   const token_id = typeof data.query_params.id === 'string' && data.query_params.id.trim().length === config.token_length ? data.query_params.id.trim() : false;

   // Validate the required token id field
   if ( ! token_id ) {
      return Promise.resolve([
         400,
         {
            message : 'The token id field is required but it\'s either missing or invalid. Please, provide a token id.',
            data    : null,
         }
      ]);
   }

   // Make a check that a token with the provided token id exists in the storage
   try {
      await storage.read( 'tokens', token_id );
   } catch ( error ) {
      return Promise.resolve([
         404,
         {
            message : 'Can\'t be found a token with this id.',
            data    : null,
         }
      ]);
   }

   // Remove the token record from the storage
   try {
      await storage.delete( 'tokens', token_id );
   } catch ( error ) {
      return Promise.resolve([
         500,
         {
            message : 'An error occurred during the attempt to delete the token.',
            data    : null,
         }
      ]);
   }

   return Promise.resolve([]);
};

// Export the object with all acceptable HTTP request methods and related handlers
module.exports = {
   'delete' : logout,
};
