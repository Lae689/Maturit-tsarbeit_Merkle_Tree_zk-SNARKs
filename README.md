# Maturitätsarbeit_Merkle_Tree_zk-SNARKs
Anonyme Authentifizierung mithilfe von zk-SNARKs und Merkle-Tree im Rahmen einer Maturitätsarbeit zu blockchainbasierten Wahlsystemen

Diese Implementation ist Teil einer Maturitätsarbeit zum Thema "Blockchainbasierte Wahlsysteme" und dient der Veranschaulichung des Kernmechanismus einer anonymen Authentifizierung mithilfe von zk-SNARKs. Die Idee basiert auf dem Konzept von Tang, Yang, Tian und Yuan (2023), wurde aber für diese Arbeit vereinfacht.


## Verwendete Tools

- Circom2 - arithmetischer Schaltkreis
- SnarkJS - Erstellen und Verifikation des zk-SNARK-Beweises
- Groth16 - verwendete Beweisverfahren


## Struktur

- build_merkle_tree.js - Erstellt aus einer Wählerliste einen Merkle-Tree
- circuit.circom - Arithmetischer Schaltkreis
- create_proof.js - Erstellt zk-SNARK-Beweis
- verify.js - Verifiziert lokal


## Ausführung (nach Circom, o. D.-a, o. D.-b, o. D.-c)

### 1. Circom-Compiler und snarkjs installieren (Circom, o. D.-b)

```bash
# 1. Rust installieren (falls noch nicht vorhanden)
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh

# 2. Circom-Compiler installieren
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom

# 3. snarkjs installieren
npm install snarkjs circomlibjs core-js
```


### 2. Schaltkreis kompilieren (Circom, o. D.-a)

```bash
circom circuit.circom --r1cs --wasm --sym
```

### 3. Trusted Setup (Circom, o. D.-c)

```bash
snarkjs powersoftau new bn128 12 pot12_0000.ptau
snarkjs powersoftau contribute pot12_0000.ptau pot12_final.ptau
snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit_0000.zkey
snarkjs zkey export verificationkey circuit_0000.zkey verification_key.json
```

### 4. Merkle-Tree erstellen, Beweis generieren und verifizieren

```bash
node build_merkle_tree.js
node create_proof.js
node verify.js
```


## Einschränkungen

Die Implementierung ist bewusst vereinfacht und dient zur Veranschaulichung des Kernmechanismus. 
-	Die Identität steht in unverschlüsselter Form, im Stil „Max Mustermann“.
-	Der Sicherheitsfaktor wird weggelassen. Dadurch könnte man sich also für eine andere Person ausgeben.
-	Es gibt keinen Identifier, da nach einer erfolgreichen Identifizierung keine weiteren Aktionen, wie Stimmabgabe und Speicherung, ausgeführt werden.
-	Die Wahlinformationen sind nicht Teil der Implementation.
-	Der Beweis wird nicht auf einem Smart-Contract, sondern lokal mithilfe eines JavaScript-Skripts verifiziert.


## Referenzen

Circom. (o. D.-a). *Compiling circuits*. Circom 2 Documentation. Internet Archive.  Abgerufen am 21. September 2026, von  https://web.archive.org/web/20250920180853/https://docs.circom.io/getting-started/compiling-circuits/

Circom. (o. D.-b). *Installation*. Circom 2 Documentation. Internet Archive.  Abgerufen am 21. September 2026, von  https://web.archive.org/web/20250903212359/https://docs.circom.io/getting-started/installation/

Circom. (o. D.-c). *Proving circuits*. Circom 2 Documentation. Internet Archive.  Abgerufen am 21. September 2026, von  https://web.archive.org/web/20250904081027/https://docs.circom.io/getting-started/proving-circuits/

Tang, W., Yang, W., Tian, X., & Yuan, S. (2023). Distributed anonymous e-voting method based on smart contract authentication. *Electronics, 12*(9), 1968. https://doi.org/10.3390/electronics12091968
