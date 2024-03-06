import { AccountState, ExtensionType, TOKEN_2022_PROGRAM_ID, createInitializeDefaultAccountStateInstruction, createInitializeMintInstruction, getMintLen } from "@solana/spl-token";
import { Connection, Keypair, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";

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
  defaultState: AccountState,
): Promise<string> {
  // Code goes here
}