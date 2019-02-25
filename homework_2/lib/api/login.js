/*
 * Login API endpoint handler.
 * Only accepts HTTP POST requests.
 *
 */

// Dependencies
const helpers = require( './../helpers' );
const config = require( './../config' );
const storage = require( './../storage' );

// Create a new token. Will be used for the users login.
// Required fields: email, password
// Optional fields: none
// TODO: Add a check if there doesn't already a token with the generated id
const login = async data => {
   // Extract the required fields from the payload object
   const email = typeof data.payload.email === 'string' && data.payload.email.trim().length ? data.payload.email.trim() : false;
   const password = typeof data.payload.password === 'string' && data.payload.password.trim().length ? data.payload.password.trim() : false;

   // Validate the required fields
   if ( ! email || ! password ) {
      return Promise.resolve([
         400,
         {
            message : 'Some of the required fields are missing. Please provide all of them.',
            data    : null,
         }
      ]);
   };

   // Make a check that a user with this email and password exists
   try {
      var user_data = await storage.read( 'users', email );
   } catch ( error ) {
      return Promise.resolve([
         404,
         {
            message : 'An user with the provided email address doesn\'t exists.',
            data    : null,
         }
      ]);
   }

   // Compare that the passwords in the storage record and in the request params are the same.
   const hashed_password = helpers.createHash( password );
   if ( hashed_password !== user_data.password ) {
      return Promise.resolve([
         400,
         {
            message : 'The password you provided doesn\'t match with the user\'s password.',
            data    : null,
         }
      ]);
   }

   // Generate a token id
   const token_id = helpers.generateTokenId( config.token_length );

   // Construct a token object
   const token_object = {
      id : token_id,
      email,
      expires : Date.now() + 1000 * 60 * 60,
   };

   // Create a record in the tokens storage
   try {
      await storage.create( 'tokens', token_id, token_object );
   } catch ( error ) {
      return Promise.resolve([
         500,
         {
            message : 'The token can\'t be recorded in the storage. Please, try again.',
            data    : null,
         }
      ]);
   }

   // Should returns with a resolved promise
   return Promise.resolve([
      200,
      {
         message : '',
         data    : token_object,
      }
   ]);
};

// Export the object with all acceptable HTTP request methods and their handlers
module.exports = {
   'post' : login,
};
