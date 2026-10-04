pragma circom 2.0.0;
include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/comparators.circom";


template Merkle_Proof(depth){
	signal input hash_name; //schon gehashter Name
	signal input path[depth]; //Geschwister auf dem Pfad zum Root
	signal input direction[depth]; //0: Geschwister ist links, 1: Geschwister ist rechts
	signal input root; //Public input: Root des Merkle-Trees
	signal input len_vote_list; //Länge der Wählerliste

	//Index des gehashten Namens im Merkle-Tree berechnen
	signal index[depth+1];
	index[0] <== 0;
	for(var i = 0; i < depth; i++)
	{
		index[i+1] <== index[i]*2 + (2-direction[depth-1-i]); //direction von Blatt zu Wurzel
	}

	//Kontrollieren, ob der Index innerhalb der Wählerliste ist
	signal first <== 2**depth - 1; //erstes Element in der untersten Ebene des Merkle-Trees
	
	component gr = GreaterEqThan(depth+2);
	gr.in[0] <== index[depth];
	gr.in[1] <== first;
	gr.out === 1; //assert(index >= first)

	component le = LessThan(depth+2);
	le.in[0] <== index[depth];
	le.in[1] <== len_vote_list+first;
	le.out === 1; //assert(index < (len_vote_lists+first))

	//Root nachhashen
	signal a[depth+1];
	a[0] <== hash_name;

	component poseidon[depth];

	for(var i = 0; i < depth; i++) //Root berechnen
	{
		poseidon[i] = Poseidon(2);

		direction[i]*(1 - direction[i]) === 0; //Kontrolle, ob direction 0 oder 1 ist

		poseidon[i].inputs[0] <== path[i] + direction[i]*(a[i] - path[i]);
		poseidon[i].inputs[1] <== a[i] + direction[i]*(path[i]-a[i]);

		a[i+1] <== poseidon[i].out;
	}

	root === a[depth]; //Kontrollieren, ob der berechnete Root identisch zum gegebenen ist
}

component main {public [root, len_vote_list]} = Merkle_Proof(3);

