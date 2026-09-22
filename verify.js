const snarkjs = require('snarkjs')
const fs = require("fs").promises;

async function verify(){

    const proof = JSON.parse( await fs.readFile("proof.json",'utf8')); //proof einlesen
    const publicSignals = JSON.parse( await fs.readFile("publicSignals_root_and_n.json",'utf8')); //Merkle-Root einlesen
    const vKey = JSON.parse( await fs.readFile("verification_key.json",'utf8')); //verification key einlesen

    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof); //proof kontrollieren
      
    if (res === true) //Beweis ist gültig
    {
      console.log("True");
    } 
    else //Beweis ist ungültig
    {
      console.log("False");
    }
}

verify().then(() => {
    process.exit(0);
});
