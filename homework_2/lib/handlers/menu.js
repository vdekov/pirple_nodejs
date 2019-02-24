// Dependencies
const menu_list = require( './menu.json' );

// Create the handler container
const menu = {};

const handler = data => {
   // Only accepts GET requests
   const accepted_methods = [ 'get' ];

   // Make a check that the passed request method
   // is an acceptable for the menu handler.
   if ( accepted_methods.includes( data.method ) ) {
      return menu[ data.method ]( data );
   }

   return Promise.resolve( [ 405 ] );
};

// TODO: Only logged users must be able to receive the menu
menu.get = data => {
   return Promise.resolve( [ 200, menu_list.products ] );
};

module.exports = handler;
