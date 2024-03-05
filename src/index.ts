import { AccountState, TOKEN_2022_PROGRAM_ID, getAccount, mintTo, thawAccount, transfer } from "@solana/spl-token";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { initializeKeypair } from "./keypair-helpers";
import { createToken22MintWithDefaultState } from "./mint-helper";
import { createTokenAccount } from "./token-helper";

interface MintWithoutThawingInputs {
  connection: Connection;
  payer: Keypair;
  tokenAccount: PublicKey;
  mint: PublicKey;
  amount: number;
}
async function testMintWithoutThawing(inputs:
  MintWithoutThawingInputs) {
  const { connection, payer, tokenAccount, mint, amount } = inputs;
  try {
    // Attempt to mint without thawing
    await mintTo(
      connection,
      payer,
      mint,
      tokenAccount,
      payer.publicKey,
      amount,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    console.error("Should not have minted...");
  } catch (error) {
    console.log(
      "✅ - We expected this to fail because the account is still frozen."
    );
  }
}

interface ThawAndMintInputs {
  connection: Connection;
  payer: Keypair;
  tokenAccount: PublicKey;
  mint: PublicKey;
  amount: number;
}
async function testThawAndMint(inputs: ThawAndMintInputs) {
  const { connection, payer, tokenAccount, mint, amount } = inputs;
  try {
    // Unfreeze frozen token
    await thawAccount(
      connection, // connection
      payer, // who pays for the txn
      tokenAccount, // Account to thaw
      mint, // mint for the account
      payer.publicKey, // Mint freeze authority
      undefined, // multi signers 
      undefined, // confirm options
      TOKEN_2022_PROGRAM_ID // program ID
    );

    await mintTo(
      connection,
      payer,
      mint,
      tokenAccount,
      payer.publicKey,
      amount,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    const account = await getAccount(connection, tokenAccount, undefined, TOKEN_2022_PROGRAM_ID);

    console.log(
      `✅ - The new account balance is ${Number(account.amount)} after thawing and minting.`
    );

  } catch (error) {
    console.error("Error thawing and or minting token: ", error);
  }
}

interface ThawAndTransferInputs {
  connection: Connection;
  payer: Keypair;
  fromTokenAccount: PublicKey;
  toTokenAccount: PublicKey;
  mint: PublicKey;
  amount: number;
}
async function testTransferWithoutThawing(inputs: ThawAndTransferInputs) {
  const { connection, payer, fromTokenAccount, toTokenAccount, mint, amount } = inputs;
  try {

    await transfer(
      connection,
      payer,
      fromTokenAccount,
      toTokenAccount,
      payer,
      amount,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    )


    console.error("Should not have minted...");
  } catch (error) {
    console.log(
      "✅ - We expected this to fail because the account is still frozen."
    );
  }
}

async function testTransferWithThawing(inputs: ThawAndTransferInputs) {
  const { connection, payer, fromTokenAccount, toTokenAccount, mint, amount } = inputs;
  try {

    // Unfreeze frozen token
    await thawAccount(
      connection, // connection
      payer, // who pays for the txn
      toTokenAccount, // Account to thaw
      mint, // mint for the account
      payer.publicKey, // Mint freeze authority
      undefined, // multi signers 
      undefined, // confirm options
      TOKEN_2022_PROGRAM_ID // program ID
    );

    await transfer(
      connection,
      payer,
      fromTokenAccount,
      toTokenAccount,
      payer,
      amount,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    )

    const account = await getAccount(connection, toTokenAccount, undefined, TOKEN_2022_PROGRAM_ID);

    console.log(
      `✅ - The new account balance is ${Number(account.amount)} after thawing and minting.`
    );

  } catch (error) {
    console.error("Error thawing and or transfering token: ", error);
  }
}

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

  // ------------ Setup Mint and Token Accounts ------------------
  await createToken22MintWithDefaultState(connection, payer, mintKeypair, decimals, defaultState)

  await createTokenAccount(
    connection,
    mint,
    payer,
    payer,
    ourTokenAccountKeypair
  );

  await createTokenAccount(
    connection,
    mint,
    payer,
    payer,
    otherTokenAccountKeypair
  );

  // ------------ Tests ------------------
  {
    // Show you can't mint without unfreezing
    await testMintWithoutThawing({
      connection,
      payer,
      tokenAccount: ourTokenAccount,
      mint,
      amount: amountToMint
    });
  }

  {
    // Show how to thaw and mint
    await testThawAndMint({
      connection,
      payer,
      tokenAccount: ourTokenAccount,
      mint,
      amount: amountToMint
    });
  }

  {
    // Add test to transfer without thawing
    await testTransferWithoutThawing({
      connection,
      payer,
      fromTokenAccount: ourTokenAccount,
      toTokenAccount: otherTokenAccount,
      mint,
      amount: amountToTransfer
    })
  }

  {
    // Add test to transfer WITH thawing
    await testTransferWithThawing({
      connection,
      payer,
      fromTokenAccount: ourTokenAccount,
      toTokenAccount: otherTokenAccount,
      mint,
      amount: amountToTransfer
    });
  }
})();