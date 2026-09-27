const snarkjs = require('snarkjs')
const fs = require("fs").promises;

async function verify(){
  //Benötigten Dateien einlesen
  const proof = JSON.parse( await fs.readFile("proof.json",'utf8')); //proof einlesen
  const publicSignals = JSON.parse( await fs.readFile("publicSignals_root_and_n.json",'utf8')); //Public Input (Root und Länge der Wählerliste) einlesen
  const vKey = JSON.parse( await fs.readFile("verification_key.json",'utf8')); //verification key einlesen

  //Proof kontrollieren
  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
      
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
