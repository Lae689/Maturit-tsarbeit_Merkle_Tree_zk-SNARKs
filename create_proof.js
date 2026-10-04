const snarkjs = require('snarkjs');
const circomlibjs = require("circomlibjs");
const { buildPoseidon } = require('circomlibjs');
const fs = require('fs').promises;
require("core-js/proposals/array-buffer-base64");

async function generateProof(){

	//Merkle-Tree und aktueller Wähler einlesen
	const merkle_tree = JSON.parse(await fs.readFile("merkle_tree.json","utf8"));
	const current_voter = JSON.parse(await fs.readFile("current_voter.json","utf8"))

	//Arrays initialisieren
	let depth = merkle_tree.depth; //Tiefe des Merkle-Trees
	let merkle_root = merkle_tree.root;
	let tree = merkle_tree.tree; //Merkle-Tree
	let path_merkle = new Array(depth).fill(0); //Array für Geschwister auf dem Pfad vom Leaf zu Root
	let dir_merkle = new Array(depth).fill(0); //dir_merkle[i]: 0 -> path_merkle[i] ist links, 1 -> path_merkle[i] ist rechts
	let len_vote_list = merkle_tree.len_vote_list; //Länge der Wählerliste
	
	//Pfad berechnen
	let x = current_voter.x; //Secret Index, Index des Namens in der Liste der Wähler
	let index = x + (Math.pow(2,depth)-1); //Index des gehashten Namens im Merkle-Tree
	for (let i = 0; i < depth; i++) {
		if (index%2==0) { //rechts
			path_merkle[i] = tree[index-1]; //linker Nachbarknoten speichern
			dir_merkle[i] = 0; //der Nachbar ist links

			index = (index-2)/2; //neuer Index, eine Ebene weiter oben
		}
		else{ //links
			path_merkle[i] = tree[index+1]; //rechter Nachbarknoten speichern
			dir_merkle[i] = 1; //der Nachbar ist rechts

			index = (index-1)/2; //neuer Index, eine Ebene weiter oben
		}
	}

	//hash(name) berechnen
	const poseidon = await buildPoseidon();
    const F = poseidon.F;

	const name = current_voter.voter; //Name
	const encoder = new TextEncoder();
	const name_uint8array =  encoder.encode(name); //String -> Uint8Array
	const name_hex =  "0x" + name_uint8array.toHex(); //Uint8Array -> hex
	const name_bigInt = BigInt(name_hex); //hex -> bigInt

	let hash_name = poseidon([name_bigInt]); //Name mit Poseidon-Hashfunktion hashen
	hash_name = F.toObject(hash_name);


	//Proof erstellen
	const{proof} = await snarkjs.groth16.fullProve(
		{
		 hash_name: hash_name, //gehashter Name
		 path: path_merkle, //alle Nachbarknoten des Pfades
		 direction: dir_merkle, //Nachbar links oder rechts
		 root: merkle_root, //Root
		 len_vote_list: len_vote_list //Länge der Wählerliste
		},

		"circuit_js/circuit.wasm",
		"circuit_0000.zkey"
	);

	//Proof speichern
	await fs.writeFile('proof.json',JSON.stringify(proof, null, 2));
}

generateProof().then(() => {
    process.exit(0);
});

