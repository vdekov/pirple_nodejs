// Object with all available handlers.
// Each handler returns a promise.
const handlers = {};

handlers.hello = data => {
   return new Promise( ( resolve, reject ) => {
      resolve({
         status_code : 200,
         payload     : {
            success : true,
            message : 'Hello, John Doe!',
            data    : null,
         }
      });
   });
};

handlers.default = data => {
   return new Promise( ( resolve, reject ) => {
      resolve({
         status_code : 404,
         payload     : {},
      });
   });
};

// Key-value mapping responsible for the `path` -> `handler` connection
const router = {
   hello : handlers.hello,
};

// Fucntion which returns a promisable handler based on a specific path
const getHandler = path => router[ path ] || handlers.default;

module.exports = getHandler;
