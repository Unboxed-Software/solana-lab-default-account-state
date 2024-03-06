import { AccountState, TOKEN_2022_PROGRAM_ID, getAccount, mintTo, thawAccount, transfer, createAccount } from "@solana/spl-token";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { initializeKeypair } from "./keypair-helpers";
import { createTokenExtensionMintWithDefaultState } from "./mint-helper";

(async () => {
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const payer = await initializeKeypair(connection);
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;
  const decimals = 2;
  const defaultState = AccountState.Frozen;

  const ourTokenAccountKeypair = Keypair.generate();
  const ourTokenAccount = ourTokenAccountKeypair.publicKey;

  // To satisfy the tranferring tests
  const otherTokenAccountKeypair = Keypair.generate();
  const otherTokenAccount = otherTokenAccountKeypair.publicKey;

  const amountToMint = 1000;
  const amountToTransfer = 50;
  // rest of the code

})();