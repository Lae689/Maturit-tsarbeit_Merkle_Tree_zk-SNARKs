const snarkjs = require('snarkjs')
const fs = require("fs").promises;

async function verify(){
  //Benötigte Dateien einlesen
  const proof = JSON.parse( await fs.readFile("proof.json",'utf8')); //proof einlesen
  const publicInput = JSON.parse( await fs.readFile("publicSignals_root_and_n.json",'utf8')); //Public Input (Root und Länge der Wählerliste) einlesen
  const verificationKey = JSON.parse( await fs.readFile("verification_key.json",'utf8')); //verification key einlesen

  //Proof kontrollieren
  const res = await snarkjs.groth16.verify(verificationKey, publicInput, proof);
      
  //Ergebnis der Verifikation ausgeben
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
