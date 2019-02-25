// Dependencies
const storage = require( './../storage' );
const helpers = require( './../helpers' );
const config = require( './../config' );

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

// Create the users handlers container
const users = {};

// Required fields: name, email, password, address
// Optional fields: none
users.post = async data => {
   // Extract the request data
   const name = typeof data.payload.name === 'string' && data.payload.name.trim().length ? data.payload.name.trim() : false;
   const email = typeof data.payload.email === 'string' && data.payload.email.trim().length ? data.payload.email.trim() : false;
   const password = typeof data.payload.password === 'string' && data.payload.password.trim().length ? data.payload.password.trim() : false;
   const address = typeof data.payload.address === 'string' && data.payload.address.trim().length ? data.payload.address.trim() : false;

   // If some of the required fields is missing return an error
   if ( ! name || ! email || ! password || ! address ) {
      return Promise.resolve([
         400,
         {
            message : 'Some of the required fields are missing. Please provide all of them.',
            data    : null,
         }
      ]);
   }

   // Verify that such user isn't already registered
   try {
      await storage.read( 'users', email );

      // In case there was an entry with this email in the storage return an error
      return Promise.resolve([
         400,
         {
            message : 'User with this email address already exists.',
            data    : null,
         }
      ]);
   } catch ( error ) {
      // In case such entry doesn't exist - continue and create it.
      // Hash the password
      const hashed_password = helpers.createHash( password );

      // Construct user data object
      const data = {
         name,
         email,
         password : hashed_password,
         address,
      };

      // Create a record in the storage
      try {
         await storage.create( 'users', email, data );
      } catch ( error ) {
         return Promise.resolve([
            500,
            {
               message : 'An error occurred during the user creation.',
               data    : null,
            }
         ]);
      }
   }

   // Should returns with a resolved promise
   return Promise.resolve( [ 200 ] );
};

// Required fields: email
// Optional fields: none
users.get = async data => {
   // Extract the email from the query parameters object
   const email = typeof data.query_params.email === 'string' && data.query_params.email.trim().length ? data.query_params.email.trim() : false;

   // Validate the email address
   if ( ! email ) {
      return Promise.resolve([
         400,
         {
            message : 'You have to enter a valid email address.',
            data    : null,
         }
      ]);
   }

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

   // Verify that the provided token belongs to the wanted user
   const is_token_valid = await verifyToken( token_id, email );

   if ( ! is_token_valid ) {
      return Promise.resolve([
         403,
         {
            message : 'The provided token is not valid. Please, provide a valid one.',
            data    : null,
         }
      ]);
   }

   // Try to get the user information from the storage
   try {
      var user_data = await storage.read( 'users', email );
   } catch ( error ) {
      return Promise.resolve([
         404,
         {
            message : 'There was an error occurred during the attempt to get the user information.',
            data    : null,
         }
      ]);
   }

   // Exclude the password field
   delete user_data.password;

   return Promise.resolve([
      200,
      {
         message : null,
         data    : user_data,
      }
   ]);
};

// Required fields: email
// Optional fields: name, password, address
users.put = async data => {
   // Extract the required email field from the payload data
   const email = typeof data.payload.email === 'string' && data.payload.email.trim().length ? data.payload.email.trim() : false;

   // Validate the email address
   if ( ! email ) {
      return Promise.resolve([
         400,
         {
            message : 'You have to enter a valid email address.',
            data    : null,
         }
      ]);
   }

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

   // Verify that the provided token belongs to the wanted user
   const is_token_valid = await verifyToken( token_id, email );

   if ( ! is_token_valid ) {
      return Promise.resolve([
         403,
         {
            message : 'The provided token is not valid. Please, provide a valid one.',
            data    : null,
         }
      ]);
   }

   // Extract the optional fields from the payload object
   const name = typeof data.payload.name === 'string' && data.payload.name.trim().length ? data.payload.name.trim() : false;
   const password = typeof data.payload.password === 'string' && data.payload.password.trim().length ? data.payload.password.trim() : false;
   const address = typeof data.payload.address === 'string' && data.payload.address.trim().length ? data.payload.address.trim() : false;

   // Verify that there are at least one optional field passed
   if ( ! name && ! password && ! address ) {
      return Promise.resolve([
         400,
         {
            message : 'You have to enter at least one of the optional fields.',
            data    : null,
         }
      ]);
   }

   // Verify that a user with such email exists in the storage
   try {
      var user_data = await storage.read( 'users', email );
   } catch ( error ) {
      return Promise.resolve([
         404,
         {
            message : 'User with such email address doesn\'t exists.',
            data    : null,
         }
      ]);
   }

   // Modify the user data based on the passed optional fields
   const modified_data = {
      name     : name || user_data.name,
      password : password ? helpers.createHash( password ) : user_data.password,
      address  : address || user_data.address,
   };

   // Concatenate the existina user data with the modified one
   user_data = Object.assign( {}, user_data, modified_data );

   // Update the user information into the storage
   try {
      await storage.update( 'users', email, user_data );
   } catch ( error ) {
      return Promise.resolve([
         500,
         {
            message : 'The user information was not successfully modified.',
            data    : null,
         }
      ]);
   }

   return Promise.resolve([]);
};

// Required fields: email
// Optional fields: none
users.delete = async data => {
   // Extract the required email field from the query params object
   const email = typeof data.query_params.email === 'string' && data.query_params.email.trim().length ? data.query_params.email.trim() : false;

   // Validate the email address
   if ( ! email ) {
      return Promise.resolve([
         400,
         {
            message : 'You have to enter a valid email address.',
            data    : null,
         }
      ]);
   }

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

   // Verify that the provided token belongs to the wanted user
   const is_token_valid = await verifyToken( token_id, email );

   if ( ! is_token_valid ) {
      return Promise.resolve([
         403,
         {
            message : 'The provided token is not valid. Please, provide a valid one.',
            data    : null,
         }
      ]);
   }

   // Make a validation that a user with such email address exists
   try {
      await storage.read( 'users', email );      
   } catch ( error ) {
      return Promise.resolve([
         404,
         {
            message : 'User with such email address doesn\'t exists.',
            data    : null,
         }
      ]);
   }

   // Delete the user record from the storage
   try {
      await storage.delete( 'users', email );
   } catch ( error ) {
      return Promise.resolve([
         500,
         {
            message : 'There was an error occurred during the attempt to remove the user.',
            data    : null,
         }
      ]);
   }

   return Promise.resolve([]);
};

// Export an object with accepted http method types and their respective handlers
module.exports = {
   'post'   : users.post,
   'get'    : users.get,
   'put'    : users.put,
   'delete' : users.delete,
};
