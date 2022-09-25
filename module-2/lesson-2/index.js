// Import Solana web3 functinalities
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmRawTransaction,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');

const DEMO_FROM_SECRET_KEY = new Uint8Array([
  55, 157, 54, 231, 175, 163, 176, 120, 217, 134, 6, 3, 5, 119, 117, 18, 220,
  114, 245, 10, 155, 45, 16, 57, 104, 232, 51, 37, 20, 23, 121, 106, 71, 14,
  110, 11, 10, 42, 128, 133, 43, 219, 239, 16, 9, 61, 187, 187, 157, 245, 221,
  234, 164, 248, 21, 79, 165, 216, 134, 181, 130, 147, 72, 65,
]);

const getWalletBalanceInLamportsWithPublicKey = async (publicKey) => {
  try {
    // Connect to the Devnet
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    // console.log('Connection object is:', connection);

    // Make a wallet (keypair) from privateKey and get its balance
    const walletBalance = await connection.getBalance(new PublicKey(publicKey));
    return parseInt(walletBalance);
  } catch (err) {
    console.log(err);
  }
};

const displayWalletBalance = async (walletName, publicKey) => {
  const walletBalanceInLamports = await getWalletBalanceInLamportsWithPublicKey(
    publicKey
  );
  const walletBalanceInSol = walletBalanceInLamports / LAMPORTS_PER_SOL;
  console.log(`${walletName} wallet balance: ${walletBalanceInSol} SOL`);
};

const transferSol = async () => {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  // Get Keypair from Secret Key
  const from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

  // Other things to try:
  // 1) Form array from userSecretKey
  // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
  // 2) Make a new Keypair (starts with 0 SOL)
  // const from = Keypair.generate();

  // Generate another Keypair (account we'll be sending to)
  const to = Keypair.generate();
  // updated and newer version of new Keypair()

  await displayWalletBalance('from', from.publicKey);
  await displayWalletBalance('to', to.publicKey);

  // Aidrop 2 SOL to Sender wallet
  console.log('Airdopping some SOL to Sender wallet!');
  const fromAirDropSignature = await connection.requestAirdrop(
    new PublicKey(from.publicKey),
    2 * LAMPORTS_PER_SOL
  );

  // Latest blockhash (unique identifer of the block) of the cluster
  const latestBlockHash = await connection.getLatestBlockhash();

  // Confirm transaction using the last valid block height (refers to its time)
  // to check for transaction expiration
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: fromAirDropSignature,
  });

  console.log('Airdrop completed for the Sender account');

  await displayWalletBalance('from', from.publicKey);
  await displayWalletBalance('to', to.publicKey);

  // Send money from "from" wallet and into "to" wallet
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: LAMPORTS_PER_SOL / 100,
    })
  );

  // Sign transaction
  const signature = await sendAndConfirmTransaction(connection, transaction, [
    from,
  ]);
  console.log('Signature is ', signature);

  await displayWalletBalance('from', from.publicKey);
  await displayWalletBalance('to', to.publicKey);
};

transferSol();
