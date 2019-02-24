// Dependencies
const users = require( './users' );
const tokens = require( './tokens' );
const menu = require( './menu' );

// Object with all available handlers.
// Each handler returns a promise.
const handlers = {};

handlers.default = data => Promise.resolve([ 404 ]);

// Key-value mapping responsible for the `path` -> `handler` connection
const router = {
   users,
   tokens,
   menu,
};

// Fucntion which returns a promisable handler based on a specific path
const getHandler = path => router[ path ] || handlers.default;

module.exports = getHandler;
