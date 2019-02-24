/*
 * Helpers library
 *
 */

// Dependencies
const crypto = require( 'crypto' );
const config = require( './config' );

// Create the module contatiner
const helpers = {};

// Method that accepts a JSON string and trying to return a JavaScript object from it
helpers.parseJsonToObject = string => {
   try {
      return JSON.parse( string );
   } catch ( error ) {
      return {};
   }
};

// Create SHA256 hash
helpers.createHash = string => {
   const hash = crypto.createHmac( 'sha256', config.hashSecretKey ).update( string ).digest( 'hex' );
   return hash;
};

// Generate token id with the pointed length (default 20)
helpers.generateTokenId = ( length = 20 ) => {
   const allowed_characters = 'abcdefghijklmnopqrstuvwxyz1234567890';
   const hash_array = [];

   for ( var i = 0; i < length; i++ ) {
      hash_array.push( allowed_characters.charAt( Math.floor( Math.random() * allowed_characters.length ) ) );
   }

   return hash_array.join( '' );
};

// Export the module container
module.exports = helpers;
