# Module 2 - Lesson 4 Writeup

- Break game uses workerRPC from CreateTransactionRPC to create a transaction, as opposed to initializing a new Transaction from the solana/web3.js module
- Break game create transaction allows for retries to be specified in case of failure

- aside from the payer and program account, the Break game also includes a extra write account
