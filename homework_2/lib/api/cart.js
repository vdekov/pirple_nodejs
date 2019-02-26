/*
 * Cart API endpoint handler.
 *
 */

// Dependencies
const storage = require( './../storage' );
const config = require( './../config' );
const helpers = require( './../helpers' );

const ORDER_STATE = {
   'new'    : 1,
   'placed' : 2,
};

// Initialize the handlers container
const cart = {};

// Required fields: products array
// Optional fields: none
cart.post = async data => {
   // Make a check that all required parameters are passed
   const products =
         typeof data.payload.products === 'object'
         && data.payload.products instanceof Array
         && data.payload.products.length
         && data.payload.products;

   // Return an error if the products parameter isn't valid
   if ( ! products ) {
      return Promise.resolve([
         400,
         {
            message : 'Some of the required fields are missing. Please provide all of them.',
            data    : null,
         }
      ]);
   }

   // Get the token id from the request headers
   const token_id = typeof data.headers.token === 'string' && data.headers.token.trim().length === config.token_length ? data.headers.token.trim() : false;

   // Verify that a valid token has been passed in the headers object
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

   // Get the user's email address from the token object
   const email = token_object.email;

   // Find the user record with this email address from the storage
   try {
      var user_object = await storage.read( 'users', email );
   } catch ( error ) {
      return Promise.resolve([
         403,
         {
            message : 'We can\'t found an user which correspnding to the provided token.',
            data    : null,
         }
      ]);
   }

   // Get the user current order id (if there was such).
   // If missing create a new one.
   try {
      var order_id = user_object.cart || await getEmptyOrderId( user_object );
   } catch ( erorr ) {
      return Promise.resolve([
         500,
         {
            message : 'There was an error occured during the attempt to create a new order. Please, try again later.',
            data    : null,
         }
      ]);
   }

   // Get the existing orders object
   try {
      var order_object = await storage.read( 'orders', order_id );
   } catch ( error ) {
      return Promise.resolve([
         500,
         {
            message : 'We can\'t found an existing order record responding to the user.',
            data    : null,
         }
      ]);
   }

   // Add the passed products into the order
   order_object.products = [
      ...order_object.products,
      ...products,
   ];

   // Update the order record in the storage
   try {
      await storage.update( 'orders', order_id, order_object );
   } catch ( error ) {
      return Promise.resolve([
         500,
         {
            message : 'We are not able to add the products into your cart at the moment. Please, try again.',
            data    : null,
         }
      ]);
   }

   return Promise.resolve([
      200,
      {
         message : null,
         data    : order_object.products,
      }
   ]);
};

// Helper method to create a new empty order.
// Return a promise resolved with the order id.
const getEmptyOrderId = async user_object => {
   // Generate an order id
   const order_id = helpers.generateId( 15 );

   // Set the newly generated order id as a current cart id in the user's object
   user_object.cart = order_id;

   // Write the user object
   try {
      await storage.update( 'users', user_object.email, user_object );
   } catch ( error ) {
      return Promise.reject();
   }

   // Construct the order object
   const order_object = {
      id       : order_id,
      email    : user_object.email,
      state    : ORDER_STATE[ 'new' ],
      products : [],
   };

   // Create a record for the new order in the storage
   try {
      await storage.create( 'orders', order_id, order_object );
   } catch ( error ) {
      return Promise.reject();
   }

   // Resolve the promise with the new order id
   return Promise.resolve( order_id );
};

// Required fields: none
// Optional fields: none
cart.get = async data => {};

// Required fields: none
// Optional fields: none
cart.delete = async data => {};

// Export the object with accepted http methods and their respective handlers
module.exports = {
   'post'   : cart.post,
   'get'    : cart.get,
   'delete' : cart.delete,
};
