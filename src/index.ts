import { AccountState, TOKEN_2022_PROGRAM_ID, getAccount, mintTo, thawAccount, transfer, createAccount } from "@solana/spl-token";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { createTokenExtensionMintWithDefaultState } from "./mint-helper";
import { initializeKeypair, makeKeypairs } from '@solana-developers/helpers';

(async () => {
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const payer = await initializeKeypair(connection, {
    airdropAmount: 1 * LAMPORTS_PER_SOL
  });

  const [mintKeypair, ourTokenAccountKeypair, otherTokenAccountKeypair] = makeKeypairs(3)
  const mint = mintKeypair.publicKey;
  const decimals = 2;
  const defaultState = AccountState.Frozen;

  const ourTokenAccount = ourTokenAccountKeypair.publicKey;

  // To satisfy the tranferring tests
  const otherTokenAccount = otherTokenAccountKeypair.publicKey;

  const amountToMint = 1000;
  const amountToTransfer = 50;
  // rest of the code

})();