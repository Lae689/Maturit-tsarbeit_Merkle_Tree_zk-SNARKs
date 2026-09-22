const fs = require("fs").promises;
const circomlibjs = require("circomlibjs");
const { buildPoseidon } = require('circomlibjs');
require("core-js/proposals/array-buffer-base64");

let poseidon;
let F;

//Merkle-Tree bauen
function build_tree(v, merkle_tree, i, depth,n){

     if(i >= (Math.pow(2, depth)-1)){ //Leaf-Nodes erkenen
        let a = i-(Math.pow(2,depth)-1); //Index in der Wählerliste, der zum Leaf-Node gehört

        if(a<n){
            //Name in eine BigInt Zahl Konvertieren
            const encoder = new TextEncoder();
            const voter_unit8array = encoder.encode(v[a]); //String -> Unit8Array
            const voter_hex = "0x" + voter_unit8array.toHex(); //Unit8Array -> hex
            const voter_bigInt = BigInt(voter_hex); //hex -> bigInt
            
            //Namen Hashen und als Leaf in den Merkle-Tree einfügen
            merkle_tree[i] = poseidon([voter_bigInt]);
        }
        else merkle_tree[i] = poseidon([0]); //lehrer Knoten

        return;
    }

    build_tree(v, merkle_tree, i*2+1, depth, n); //Die linke Seite berechnen
    build_tree(v, merkle_tree, i*2+2, depth, n); //Die rechte Seite berechnen

    merkle_tree[i] = poseidon([merkle_tree[i*2+1], merkle_tree[i*2+2]]); //merkle_tree[i] = hash(child-left, child2-right)
    
    //Format für spätere Speicherung ändern
    merkle_tree[i*2+1] = F.toObject(merkle_tree[i*2+1]).toString();
    merkle_tree[i*2+2] = F.toObject(merkle_tree[i*2+2]).toString();

    return;
}

async function main(){

	poseidon = await buildPoseidon();
    F = poseidon.F;

    //Eingabe einlesen
	const voter_list = JSON.parse(await fs.readFile("voter_input.json", "utf8"));

    let n = voter_list.size;
    let v = voter_list.voters;
    let merkle_tree = new Array(4*n).fill(0);
    let depth = Math.ceil(Math.log2(n));

    //Merkle-Tree bauen
    build_tree(v, merkle_tree, 0, depth, n);

    merkle_tree[0] = F.toObject(merkle_tree[0]).toString(); //Format vom Root ändern

    //Ausgabe erstellen
    const output = {
        size: n,
        depth: depth,
        root: merkle_tree[0],
        tree: merkle_tree,
        len_vote_list: n 
    }

    await fs.writeFile('merkle_tree.json', JSON.stringify(output, null, 2)); 
    await fs.writeFile('publicSignals_root_and_n.json', JSON.stringify([merkle_tree[0], n], null, 2));
}

main();
