const fs = require( 'fs' ).promises;
const assert = require( 'assert' );
const storage = require( './../lib/storage' );

const dir_name = 'test';
const file_name = 'test';
const data = {
   name   : 'John Doe',
   email  : 'anonymous@example.com',
   age    : 28,
   active : false,
};

const execute = async () => {
   // Manually create and delete test directory for the test purposes
   const dir_path = `${storage.base_dir}${dir_name}`;
   await fs.mkdir( dir_path );

   try {
      let file_content;

      // Storage entry creation test
      await storage.create( dir_name, file_name, data );

      file_content = await storage.read( dir_name, file_name );
      assert.deepEqual( file_content, data );

      data.active = true;
      await storage.update( dir_name, file_name, data );
      file_content = await storage.read( dir_name, file_name );
      assert.deepEqual( file_content, data );

      // Storage entry removal test
      await storage.delete( dir_name, file_name );

      console.log( '\x1b[32m%s\x1b[0m', 'Storage tests passed' );
   } catch( error ) {
      console.log( '\x1b[31m%s\x1b[0m', error );
   } finally {
      await fs.rmdir( dir_path );
   }
};

execute();
