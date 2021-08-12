require('dotenv').config();
const App = require('./app');

async function main () {
   const address = process.env.CONTRACT_ADDRESS;
   console.log("contract address: " + address);
   var app = await App.create(address);
   server = app.listen(3000, () => {
     console.log("Server is listening on port 3000");
     console.log("Access to http://localhost:3000");
   });
}

main();

