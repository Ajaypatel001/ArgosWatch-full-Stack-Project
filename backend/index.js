// This file was created to fix the "Cannot find module 'index'" error.
// The actual server code lives in server.js.
// We just load server.js from here so that "node index" works fine!

console.log("Redirecting 'node index' to 'node server.js'...\n");
require('./server.js');
