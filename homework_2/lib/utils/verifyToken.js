// Dependencies
const storage = require( './../storage' );

// Verifies token by token id and email as a parameters.
// Resolve or reject the promise based on the validation status.
const verifyToken = async ( token_id, email ) => {
   // Find the token record and verify that:
   //  1. The email is equal to the passed as a parameter one
   //  2. The token is still valid (not expired)
   try {
      var token_object = await storage.read( 'tokens', token_id );
   } catch ( error ) {
      return false;
   }

   const is_valid = token_object.email === email && token_object.expires > Date.now();
   return is_valid;
};

module.exports = verifyToken;
