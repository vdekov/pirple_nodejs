/*
 * Tokens handler library
 *
 */

// Dependencies
const helpers = require( './../helpers' );
const config = require( './../config' );
const storage = require( './../storage' );

// Create the module container
const tokens = {};

// Module root handler
const handler = data => {
   // List with all acceptable HTTP request methods
   const accepted_methods = [ 'post', 'get', 'put', 'delete' ];

   // If the request method is an acceptable redirect to
   // some of the related sub-handler methods.
   if ( accepted_methods.includes( data.method ) ) {
      return tokens[ data.method ]( data );
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

// Create a new token. Will be used for the users login.
// Required fields: email, password
// Optional fields: none
// TODO: Add a check if there doesn't already a token with the generated id
tokens.post = async data => {
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

// Required fields: id
// Optional fields: none
tokens.get = async data => {
   // Extract the requred field from the query params object
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

   // Get the token data from the storage
   try {
      var token_object = await storage.read( 'tokens', token_id );
   } catch ( error ) {
      return Promise.resolve([
         404,
         {
            message : 'An error occurred during the attempt to read the token data from the storage.',
            data    : null,
         }
      ]);
   }

   return Promise.resolve([
      200,
      {
         message : null,
         data    : token_object,
      }
   ]);
};

// Required fields: id, extend
// Optional fields: none
tokens.put = async data => {
   // Extract the required fields from the payload object
   const token_id = typeof data.payload.id === 'string' && data.payload.id.trim().length === config.token_length ? data.payload.id.trim() : false;
   const should_extend = typeof data.payload.extend === 'boolean' && data.payload.extend;

   // Validate the required fields.
   // Cntinue only if the both fields are provided
   // and the extend parameter is set to true.
   if ( ! token_id || ! should_extend ) {
      return Promise.resolve([
         400,
         {
            message : 'Missing required parameters and/or invalid parameters data.',
            data    : null,
         }
      ]);
   }

   // Find the token record in the storage
   try {
      var token_object = await storage.read( 'tokens', token_id );
   } catch ( error ) {
      return Promise.resolve([
         400,
         {
            message : 'Specified token doesn\'t exist. Please, provide a valid one.',
            data    : null,
         }
      ]);
   }

   // In case the token is still valid (doesn't expired)
   // increase the expiration time with one hour.
   if ( token_object.expires < Date.now() ) {
      return Promise.resolve([
         400,
         {
            message : 'Specified token has already expired and it can\'t be extended.',
            data    : null,
         }
      ]);
   }

   // Extend with one hour from now
   token_object.expires = Date.now() + 1000 * 60 * 60;

   // Update the token record in the storage
   try {
      await storage.update( 'tokens', token_id, token_object );
   } catch ( error ) {
      return Promise.resolve([
         500,
         {
            message : 'An error occurred during the attempt to extend the token expiration time. Please, try again.',
            data    : null,
         }
      ]);
   }

   return Promise.resolve([]);
};

// Required fields: id
// Optional fields: none
tokens.delete = async data => {
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

// Export the root handler
module.exports = handler;
