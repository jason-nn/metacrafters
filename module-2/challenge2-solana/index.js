// Import Solana web3 functinalities
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
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
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

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
  console.log(`${walletName} Wallet Balance: ${walletBalanceInSol} SOL`);
};

const transferSol = async () => {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  const from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);
  const to = Keypair.generate();

  await displayWalletBalance('Sender', from.publicKey);
  await displayWalletBalance('Receiver', to.publicKey);

  console.log('Airdopping 2 SOL to Sender wallet');
  const fromAirDropSignature = await connection.requestAirdrop(
    new PublicKey(from.publicKey),
    2 * LAMPORTS_PER_SOL
  );

  const latestBlockHash = await connection.getLatestBlockhash();

  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: fromAirDropSignature,
  });

  console.log('Airdrop successful');

  await displayWalletBalance('Sender', from.publicKey);
  await displayWalletBalance('Receiver', to.publicKey);

  console.log('Sending 50% of Sender wallet balance to Receiver wallet');
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports:
        (await getWalletBalanceInLamportsWithPublicKey(from.publicKey)) / 2,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [
    from,
  ]);
  console.log('Transaction successful');
  console.log('Transaction signature is', signature);

  await displayWalletBalance('Sender', from.publicKey);
  await displayWalletBalance('Receiver', to.publicKey);
};

transferSol();
