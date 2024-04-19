import {
  AccountState,
  TOKEN_2022_PROGRAM_ID,
  getAccount,
  mintTo,
  thawAccount,
  transfer,
  createAccount,
  freezeAccount,
  burn,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { createTokenExtensionMintWithDefaultState } from "./mint-helper"; // This will be uncommented later
import { initializeKeypair, makeKeypairs } from "@solana-developers/helpers";

const connection = new Connection("http://127.0.0.1:8899", "confirmed");
const payer = await initializeKeypair(connection);

const [mintKeypair, ourTokenAccountKeypair, otherTokenAccountKeypair] =
  makeKeypairs(3);
const mint = mintKeypair.publicKey;
const decimals = 2;
const defaultState = AccountState.Frozen;

const ourTokenAccount = ourTokenAccountKeypair.publicKey;

// To satisfy the transferring tests
const otherTokenAccount = otherTokenAccountKeypair.publicKey;

const amountToMint = 1000;
const amountToTransfer = 50;

// CREATE MINT WITH DEFAULT STATE
await createTokenExtensionMintWithDefaultState(
  connection,
  payer,
  mintKeypair,
  decimals,
  defaultState
);

// CREATE TEST TOKEN ACCOUNTS
// Transferring from account
await createAccount(
  connection,
  payer,
  mint,
  payer.publicKey,
  ourTokenAccountKeypair,
  undefined,
  TOKEN_2022_PROGRAM_ID
);
// Transferring to account
await createAccount(
  connection,
  payer,
  mint,
  payer.publicKey,
  otherTokenAccountKeypair,
  undefined,
  TOKEN_2022_PROGRAM_ID
);

// TEST: MINT WITHOUT THAWING
try {
  // Attempt to mint without thawing
  await mintTo(
    connection,
    payer,
    mint,
    ourTokenAccount,
    payer.publicKey,
    amountToMint,
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

// TEST: MINT WITH THAWING
// Unfreeze frozen token
await thawAccount(
  connection,
  payer,
  ourTokenAccount,
  mint,
  payer.publicKey,
  undefined,
  undefined,
  TOKEN_2022_PROGRAM_ID
);
// Mint tokens to tokenAccount
await mintTo(
  connection,
  payer,
  mint,
  ourTokenAccount,
  payer.publicKey,
  amountToMint,
  undefined,
  undefined,
  TOKEN_2022_PROGRAM_ID
);

const ourTokenAccountWithTokens = await getAccount(
  connection,
  ourTokenAccount,
  undefined,
  TOKEN_2022_PROGRAM_ID
);

console.log(
  `✅ - The new account balance is ${Number(
    ourTokenAccountWithTokens.amount
  )} after thawing and minting.`
);

// TEST: TRANSFER WITHOUT THAWING
try {
  await transfer(
    connection,
    payer,
    ourTokenAccount,
    otherTokenAccount,
    payer,
    amountToTransfer,
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

// TEST: TRANSFER WITH THAWING
// Unfreeze frozen token
await thawAccount(
  connection,
  payer,
  otherTokenAccount,
  mint,
  payer.publicKey,
  undefined,
  undefined,
  TOKEN_2022_PROGRAM_ID
);

await transfer(
  connection,
  payer,
  ourTokenAccount,
  otherTokenAccount,
  payer,
  amountToTransfer,
  undefined,
  undefined,
  TOKEN_2022_PROGRAM_ID
);

const otherTokenAccountWithTokens = await getAccount(
  connection,
  otherTokenAccount,
  undefined,
  TOKEN_2022_PROGRAM_ID
);

console.log(
  `✅ - The new account balance is ${Number(
    otherTokenAccountWithTokens.amount
  )} after thawing and transferring.`
);

// TEST: Burn tokens in frozen account

await freezeAccount(
  connection,
  payer,
  ourTokenAccount,
  mint,
  payer.publicKey,
  [],
  undefined,
  TOKEN_2022_PROGRAM_ID,
)

await burn(
  connection,
  payer,
  ourTokenAccount,
  mint,
  payer.publicKey,
  1,
  [],
  undefined,
  TOKEN_2022_PROGRAM_ID,
)