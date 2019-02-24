/*
 * File-based storage library
 *
 */

// Depencencies
const path = require( 'path' );
const fs = require( 'fs' ).promises;
const helpers = require( './helpers' );

// Create the storage module container
const storage = {};

// Base directory of the storage files
storage.base_dir = path.join( __dirname, '/../.data/' );

storage.create = async ( dir, file, data ) => {
   let file_descriptor;

   // Create a file in the directory (if doesn't exist such already)
   try {
      file_descriptor = await fs.open( `${storage.base_dir}${dir}/${file}.json`, 'wx' );
   } catch ( error ) {
      return Promise.reject( 'Couldn\'t create a new file. Most probably it may already exists.' );
   }

   // When the file is created successfully - write the stringified data inside
   try {
      await file_descriptor.writeFile( JSON.stringify( data ) );
   } catch ( error ) {
      return Promise.reject( 'An error occured during the attempt to write the file content.' );
   }

   // Close the file descriptor
   try {
      await file_descriptor.close();
   } catch ( error ) {
      return Promise.reject( 'The file cannot be closed as expected.' );
   }

   return Promise.resolve();
};

storage.read = async ( dir, file ) => {
   // Open the file in the directory and get its content
   try {
      const content_str = await fs.readFile( `${storage.base_dir}${dir}/${file}.json`, 'utf8' );
      const content_obj = helpers.parseJsonToObject( content_str );
      return Promise.resolve( content_obj );
   } catch ( error ) {
      return Promise.reject( 'An error occured during the attempt to read a file.' );
   }
};

/*
 * Should fails if the file doesn't exist.
 * Execute the steps in the following order:
 *  1. Open the file for reading and writing.
 *  2. Truncate the content of the file.
 *  3. Write the new data as a string.
 *  4. Close the file descriptor.
 */
storage.update = async ( dir, file, data ) => {
   let file_descriptor;

   // Open the file in the directory and replace the current content with the stringified data.
   try {
      file_descriptor = await fs.open( `${storage.base_dir}${dir}/${file}.json`, 'r+' );
   } catch ( error ) {
      return Promise.reject( 'There was an error during the opening of the file. Most probably the file doesn\'t exist.' );
   }

   // Truncate the file content
   try {
      await file_descriptor.truncate();
   } catch ( error ) {
      return Promise.reject( 'The file content cannot be truncated.' );
   }

   // Write the new data into the file
   try {
      await file_descriptor.writeFile( JSON.stringify( data ) );
   } catch ( error ) {
      return Promise.reject( 'An error occured during the attempt to write the file content.' );
   }

   // Close the file descriptor
   try {
      await file_descriptor.close();
   } catch ( error ) {
      return Promise.reject( 'The file cannot be closed as expected.' );
   }

   return Promise.resolve();
};

storage.delete = async ( dir, file ) => {
   // Delete the file from the directory
   try {
      await fs.unlink( `${storage.base_dir}${dir}/${file}.json` )
   } catch ( error ) {
      return Promise.reject( 'There was an error during the file deletion.' );
   }

   return Promise.resolve();
};

// Export the module
module.exports = storage;
