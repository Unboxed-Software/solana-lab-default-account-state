import {
    AccountState,
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
    createInitializeDefaultAccountStateInstruction,
    createInitializeMintInstruction,
    getMintLen,
  } from "@solana/spl-token";
  import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
  } from "@solana/web3.js";
  
  /**
   * Creates the token mint with the default state
   * @param connection
   * @param payer
   * @param mintKeypair
   * @param decimals
   * @param defaultState
   * @returns signature of the transaction
   */
  export async function createTokenExtensionMintWithDefaultState(
    connection: Connection,
    payer: Keypair,
    mintKeypair: Keypair,
    decimals: number = 2,
    defaultState: AccountState
  ): Promise<string> {
    const mintLen = getMintLen([ExtensionType.DefaultAccountState]);
    // Minimum lamports required for Mint Account
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
  
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    });
  
    const initializeDefaultAccountStateInstruction =
      createInitializeDefaultAccountStateInstruction(
        mintKeypair.publicKey,
        defaultState,
        TOKEN_2022_PROGRAM_ID
      );
  
    const initializeMintInstruction = createInitializeMintInstruction(
      mintKeypair.publicKey,
      decimals,
      payer.publicKey, // Designated Mint Authority
      payer.publicKey, //  Designated Freeze Authority
      TOKEN_2022_PROGRAM_ID
    );
  
    const transaction = new Transaction().add(
      createAccountInstruction,
      initializeDefaultAccountStateInstruction,
      initializeMintInstruction
    );
  
    return await sendAndConfirmTransaction(connection, transaction, [
      payer,
      mintKeypair,
    ]);
  }