import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { CheckCircle, XCircle, BookOpen, Trophy, RotateCcw, Timer, Clock } from "lucide-react";
import { Switch } from "./ui/switch";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: "architecture" | "clarity" | "defi" | "nft" | "security" | "advanced";
}

const quizQuestions: QuizQuestion[] = [
  // ============ ARCHITECTURE & CONSENSUS ============
  {
    id: 1,
    question: "The Proof of Transfer (PoX) consensus mechanism distinguishes itself from traditional proof-of-work by:",
    options: [
      "Eliminating the need for miners entirely through delegated validation",
      "Recycling Bitcoin's proof-of-work by transferring BTC to STX stackers",
      "Using a hybrid model combining proof-of-stake with proof-of-authority",
      "Anchoring transactions to Ethereum for cross-chain security"
    ],
    correctAnswer: 1,
    explanation: "PoX recycles Bitcoin's existing proof-of-work. STX miners bid Bitcoin, which transfers to STX stackers as yield, while the winning miner produces the next Stacks block. This anchors Stacks to Bitcoin without expending additional energy.",
    category: "architecture"
  },
  {
    id: 2,
    question: "The Nakamoto upgrade's implementation of Bitcoin finality signifies that:",
    options: [
      "Stacks blocks confirm in under 5 seconds on average",
      "Transactions become irreversible once their anchor block is confirmed on Bitcoin",
      "STX can be natively bridged to Bitcoin's UTXO set",
      "Block reorganizations occur independently of Bitcoin's chain"
    ],
    correctAnswer: 1,
    explanation: "With Nakamoto, Stacks transactions inherit Bitcoin's finality. Once the anchoring Bitcoin block achieves sufficient confirmations, the corresponding Stacks transactions cannot be reorganized without also reorganizing Bitcoin itself.",
    category: "architecture"
  },
  {
    id: 3,
    question: "In the PoX consensus, a Signer's primary responsibility post-Nakamoto is to:",
    options: [
      "Validate and sign Stacks blocks to ensure finality",
      "Process off-chain transactions for scalability",
      "Manage the sBTC peg's cryptographic keys",
      "Distribute mining rewards to pool participants"
    ],
    correctAnswer: 0,
    explanation: "Signers are Stackers who validate blocks and provide cryptographic signatures. At least 70% of stacked STX must sign for a block to achieve finality, creating a robust consensus mechanism tied to Bitcoin's security.",
    category: "architecture"
  },
  {
    id: 4,
    question: "What is the minimum amount of STX required for solo stacking?",
    options: [
      "10,000 STX",
      "50,000 STX",
      "100,000 STX",
      "1,000,000 STX"
    ],
    correctAnswer: 2,
    explanation: "Solo stacking requires a minimum of 100,000 STX. Users with smaller amounts can participate through pooled stacking services which aggregate STX from multiple participants.",
    category: "architecture"
  },
  {
    id: 5,
    question: "Stacks is classified as a:",
    options: [
      "Layer 2 rollup on Bitcoin",
      "Bitcoin sidechain with merged mining",
      "Independent Layer 1 blockchain anchored to Bitcoin",
      "State channel network similar to Lightning"
    ],
    correctAnswer: 2,
    explanation: "Stacks is NOT a Layer 2. It's an independent Layer 1 blockchain with its own consensus mechanism (PoX), miners, and token (STX). However, it settles on Bitcoin for security through cryptographic anchoring.",
    category: "architecture"
  },
  {
    id: 6,
    question: "Bitcoin anchoring in Stacks means that:",
    options: [
      "STX tokens are backed 1:1 by Bitcoin",
      "Stacks block hashes are committed to Bitcoin transactions",
      "Mining requires holding both BTC and STX",
      "All Stacks transactions are processed on Bitcoin"
    ],
    correctAnswer: 1,
    explanation: "Each Stacks block's hash is cryptographically committed to Bitcoin. This creates an immutable record where Stacks history cannot be changed without changing Bitcoin's history, inheriting Bitcoin's security.",
    category: "architecture"
  },
  {
    id: 7,
    question: "Microblocks in the pre-Nakamoto Stacks network:",
    options: [
      "Replace anchor blocks for faster finality",
      "Provide provisional fast confirmations between anchor blocks",
      "Are mined by separate microblock miners",
      "Store only token transfer transactions"
    ],
    correctAnswer: 1,
    explanation: "Microblocks are produced approximately every 5 seconds between anchor blocks, providing fast transaction confirmations. They're provisional until confirmed by the next anchor block.",
    category: "architecture"
  },
  {
    id: 8,
    question: "The Stacks mainnet was launched in:",
    options: [
      "January 2019",
      "January 2021",
      "January 2022",
      "January 2024"
    ],
    correctAnswer: 1,
    explanation: "Stacks 2.0 mainnet launched in January 2021, enabling Proof of Transfer consensus and Clarity smart contracts. The project originated from Blockstack, founded in 2013.",
    category: "architecture"
  },
  {
    id: 9,
    question: "The 2019 SEC-qualified token offering by Stacks (then Blockstack) was significant because:",
    options: [
      "It was the first crypto token to receive SEC approval for trading",
      "It was the first SEC-qualified crypto offering in the US",
      "It exempted STX from securities regulations permanently",
      "It allowed institutional investors exclusive access"
    ],
    correctAnswer: 1,
    explanation: "Blockstack conducted the first-ever SEC-qualified crypto token offering using Regulation A+, raising $23 million. This set a precedent for compliant crypto fundraising in the United States.",
    category: "architecture"
  },
  {
    id: 10,
    question: "To successfully execute a 51% attack on Stacks, an attacker would need to:",
    options: [
      "Control 51% of stacked STX tokens",
      "Successfully 51% attack Bitcoin itself",
      "Compromise 51% of Stacks nodes",
      "Own 51% of the total STX supply"
    ],
    correctAnswer: 1,
    explanation: "Because Stacks blocks are anchored to Bitcoin, reorganizing Stacks history requires reorganizing Bitcoin. The cost to attack Stacks equals the cost to attack Bitcoin, making it economically infeasible.",
    category: "architecture"
  },

  // ============ CLARITY LANGUAGE ============
  {
    id: 11,
    question: "Clarity's decidability property fundamentally ensures that:",
    options: [
      "Contracts execute faster through JIT compilation",
      "All possible execution paths can be analyzed before deployment",
      "Smart contracts can be upgraded without migration",
      "Gas fees remain constant regardless of computation"
    ],
    correctAnswer: 1,
    explanation: "Decidability means the behavior of Clarity contracts can be fully analyzed statically before execution. This eliminates an entire class of runtime vulnerabilities since all execution paths are knowable and verifiable upfront.",
    category: "clarity"
  },
  {
    id: 12,
    question: "In Clarity, the principal type serves the purpose of:",
    options: [
      "Representing the primary key in contract storage",
      "Identifying unique addresses capable of owning assets and calling contracts",
      "Defining the main entry point for contract execution",
      "Specifying the original deployer's privileges"
    ],
    correctAnswer: 1,
    explanation: "The principal type in Clarity represents unique identities on the network. Standard principals represent wallet addresses, while contract principals identify deployed contracts. Both can own assets and participate in transactions.",
    category: "clarity"
  },
  {
    id: 13,
    question: "The Clarity expression `(define-data-var counter uint u0)` establishes:",
    options: [
      "An immutable constant with value zero",
      "A mutable variable initialized to zero of unsigned integer type",
      "A map with a single key-value pair",
      "A public function returning unsigned zero"
    ],
    correctAnswer: 1,
    explanation: "The `define-data-var` expression creates mutable contract state. The variable `counter` is typed as `uint` (unsigned integer) and initialized to `u0`. Unlike `define-constant`, data vars can be modified via `var-set`.",
    category: "clarity"
  },
  {
    id: 14,
    question: "The `(unwrap-panic expr)` function in Clarity:",
    options: [
      "Gracefully handles None values by returning a default",
      "Extracts the inner value or aborts the transaction if None/Err",
      "Wraps a value in an optional type for null safety",
      "Logs an error message without halting execution"
    ],
    correctAnswer: 1,
    explanation: "The `unwrap-panic` function extracts the inner value from an Optional or Response type. If the value is `none` or `err`, the entire transaction aborts. For graceful handling, use `unwrap!` or `match` instead.",
    category: "clarity"
  },
  {
    id: 15,
    question: "To iterate over a list in Clarity, the idiomatic approach employs:",
    options: [
      "A traditional for-loop with mutable index",
      "Higher-order functions like `map`, `fold`, and `filter`",
      "Recursive tail-call optimization with explicit stack management",
      "External iterator contracts called via inter-contract calls"
    ],
    correctAnswer: 1,
    explanation: "Clarity lacks traditional loops to ensure decidability. Instead, it provides functional constructs: `map` transforms each element, `fold` accumulates a result, and `filter` selects elements matching a predicate.",
    category: "clarity"
  },
  {
    id: 16,
    question: "The `tx-sender` built-in variable in Clarity refers to:",
    options: [
      "The contract that initiated the current function call",
      "The original principal who signed the transaction",
      "The miner who included the transaction in a block",
      "The last principal in the contract call chain"
    ],
    correctAnswer: 1,
    explanation: "The `tx-sender` always references the original transaction signer, regardless of nested contract calls. This differs from `contract-caller`, which reflects the immediate calling principal (contract or user).",
    category: "clarity"
  },
  {
    id: 17,
    question: "Clarity's post-conditions mechanism allows users to:",
    options: [
      "Specify preconditions that must be true before execution",
      "Assert expected asset transfers to abort if violated",
      "Define callback functions executed after contract calls",
      "Schedule delayed transaction execution"
    ],
    correctAnswer: 1,
    explanation: "Post-conditions are user-specified assertions about asset transfers. If the actual transfers don't match expectations (e.g., losing more STX than expected), the transaction aborts, protecting users from malicious contracts.",
    category: "clarity"
  },
  {
    id: 18,
    question: "In Clarity, the `as-contract` expression is utilized to:",
    options: [
      "Deploy a new contract from within an existing one",
      "Execute code with the contract's principal as tx-sender",
      "Convert a response type to a contract principal",
      "Assert that the caller is a specific contract"
    ],
    correctAnswer: 1,
    explanation: "The `as-contract` expression temporarily changes `tx-sender` to the contract's own principal. This enables contracts to perform actions on their own behalf, such as transferring assets they hold.",
    category: "clarity"
  },
  {
    id: 19,
    question: "The `block-height` built-in in Clarity returns:",
    options: [
      "The current Bitcoin block number",
      "The current Stacks block number",
      "The timestamp of the current block",
      "The hash of the parent block"
    ],
    correctAnswer: 1,
    explanation: "The `block-height` variable returns the current Stacks block number, not Bitcoin's. For time-dependent logic, developers often use block heights as a proxy for time since Stacks blocks anchor to Bitcoin blocks.",
    category: "clarity"
  },
  {
    id: 20,
    question: "A trait in Clarity serves the purpose of:",
    options: [
      "Defining a set of functions that contracts must implement",
      "Inheriting state variables from a parent contract",
      "Creating private helper functions invisible to other contracts",
      "Optimizing gas consumption through bytecode sharing"
    ],
    correctAnswer: 0,
    explanation: "Traits define interfaces—function signatures that implementing contracts must provide. This enables polymorphism: code can accept any contract implementing a trait, enabling standardization like SIP-009 and SIP-010.",
    category: "clarity"
  },
  {
    id: 21,
    question: "The `stx-burn?` function in Clarity:",
    options: [
      "Permanently destroys STX tokens, reducing total supply",
      "Transfers STX to a null address for accounting purposes",
      "Burns gas fees after transaction execution",
      "Converts STX to sBTC at a fixed ratio"
    ],
    correctAnswer: 0,
    explanation: "The `stx-burn?` function permanently removes STX from circulation, reducing the total supply. This is an irreversible operation often used for deflationary mechanics or destroying wrapped assets.",
    category: "clarity"
  },
  {
    id: 22,
    question: "What distinguishes `contract-caller` from `tx-sender` in Clarity?",
    options: [
      "They are identical and can be used interchangeably",
      "`contract-caller` returns the immediate caller while `tx-sender` is the original signer",
      "`contract-caller` is deprecated in favor of `tx-sender`",
      "`tx-sender` can be spoofed while `contract-caller` cannot"
    ],
    correctAnswer: 1,
    explanation: "`tx-sender` always returns the original transaction signer regardless of call depth. `contract-caller` returns the immediate calling principal, which could be another contract in a nested call chain.",
    category: "clarity"
  },
  {
    id: 23,
    question: "The `define-map` expression in Clarity creates:",
    options: [
      "A mutable key-value store with typed keys and values",
      "An immutable constant mapping",
      "A list that can be iterated with for-loops",
      "A reference to an external data source"
    ],
    correctAnswer: 0,
    explanation: "`define-map` creates a persistent key-value store where both keys and values are strongly typed. Maps are modified using `map-set`, `map-insert`, and `map-delete`.",
    category: "clarity"
  },
  {
    id: 24,
    question: "Clarity uses a prefix notation (Lisp-like syntax) primarily because:",
    options: [
      "It's more familiar to blockchain developers",
      "It enables unambiguous parsing and predictable evaluation",
      "It compiles to smaller bytecode",
      "It's required for Bitcoin compatibility"
    ],
    correctAnswer: 1,
    explanation: "Prefix notation eliminates ambiguity in expression parsing and ensures predictable, left-to-right evaluation order. This contributes to Clarity's decidability and makes contracts easier to analyze statically.",
    category: "clarity"
  },
  {
    id: 25,
    question: "The maximum size of a Clarity integer (int/uint) is:",
    options: [
      "64 bits",
      "128 bits",
      "256 bits",
      "Unlimited precision"
    ],
    correctAnswer: 1,
    explanation: "Clarity integers are 128-bit, providing a range from -2^127 to 2^127-1 for signed ints and 0 to 2^128-1 for unsigned ints. This is smaller than Solidity's 256-bit but sufficient for most applications.",
    category: "clarity"
  },

  // ============ SBTC ============
  {
    id: 26,
    question: "sBTC's architectural design eliminates the need for:",
    options: [
      "Transaction fees when moving between L1 and L2",
      "Clarity smart contracts for DeFi applications",
      "Centralized custodians or federated multisig bridges",
      "STX tokens for network security participation"
    ],
    correctAnswer: 2,
    explanation: "sBTC is a decentralized 1:1 Bitcoin peg that operates without trusted third parties. Unlike wrapped Bitcoin solutions requiring custodians, sBTC uses threshold signatures and economic incentives to maintain the peg trustlessly.",
    category: "defi"
  },
  {
    id: 27,
    question: "The sBTC Phase 1 mainnet deposit cap was:",
    options: [
      "100 BTC",
      "500 BTC",
      "1,000 BTC",
      "10,000 BTC"
    ],
    correctAnswer: 2,
    explanation: "sBTC Phase 1 launched in December 2024 with a 1,000 BTC deposit cap. This cap was filled in just 4 days, demonstrating massive demand for trustless Bitcoin DeFi.",
    category: "defi"
  },
  {
    id: 28,
    question: "To peg Bitcoin into sBTC, users must:",
    options: [
      "Send BTC to a centralized exchange first",
      "Deposit BTC to a threshold-signature-controlled address",
      "Swap BTC for STX then convert to sBTC",
      "Lock both BTC and STX in equal amounts"
    ],
    correctAnswer: 1,
    explanation: "Users deposit BTC to an address controlled by a decentralized threshold signature scheme. Once confirmed on Bitcoin, an equivalent amount of sBTC is minted on Stacks, maintaining the 1:1 peg.",
    category: "defi"
  },
  {
    id: 29,
    question: "sBTC withdrawals (peg-out) were activated in:",
    options: [
      "December 2024",
      "January 2025",
      "April 2025",
      "Not yet activated"
    ],
    correctAnswer: 2,
    explanation: "sBTC withdrawals were activated in April 2025, initially capped at 150 BTC per day. This completed the bidirectional peg, allowing users to redeem their sBTC for Bitcoin.",
    category: "defi"
  },

  // ============ STACKING & YIELD ============
  {
    id: 30,
    question: "Dual stacking amplifies yield through the mechanism of:",
    options: [
      "Compounding rewards across multiple stacking cycles automatically",
      "Combining locked STX with sBTC holdings to boost reward rates",
      "Stacking identical amounts on both Stacks mainnet and testnet",
      "Leveraging liquidation cascades in DeFi lending protocols"
    ],
    correctAnswer: 1,
    explanation: "Dual stacking allows users to lock STX tokens while simultaneously holding sBTC. The sBTC holdings directly influence the reward multiplier, enabling yields up to 5% APY compared to base rates of approximately 0.5%.",
    category: "defi"
  },
  {
    id: 31,
    question: "Stacking rewards are paid in:",
    options: [
      "STX tokens",
      "Bitcoin (BTC)",
      "A combination of STX and BTC",
      "USDC stablecoins"
    ],
    correctAnswer: 1,
    explanation: "Stackers receive Bitcoin as rewards, paid by miners who commit BTC to produce Stacks blocks. This unique mechanism allows STX holders to earn Bitcoin yield without selling their STX.",
    category: "defi"
  },
  {
    id: 32,
    question: "A stacking cycle on Stacks lasts approximately:",
    options: [
      "7 days",
      "14 days (2 weeks)",
      "30 days",
      "90 days"
    ],
    correctAnswer: 1,
    explanation: "Each stacking cycle lasts approximately 2 weeks (2,100 Bitcoin blocks). Stackers commit their STX for one or more cycles and receive proportional Bitcoin rewards based on their stake.",
    category: "defi"
  },
  {
    id: 33,
    question: "Liquid stacking protocols like StackingDAO issue stSTX tokens that:",
    options: [
      "Represent governance rights in the DAO without economic value",
      "Provide liquid claims on stacked STX while accruing BTC rewards",
      "Function as wrapped STX for cross-chain transfers",
      "Enable instant unstacking without any protocol fees"
    ],
    correctAnswer: 1,
    explanation: "stSTX tokens represent stacked STX positions, allowing holders to trade or use them in DeFi while the underlying STX earns Bitcoin rewards. The token value appreciates relative to STX as rewards accumulate.",
    category: "defi"
  },

  // ============ DEFI PROTOCOLS ============
  {
    id: 34,
    question: "Circle's USDCx integration via xReserve infrastructure provides:",
    options: [
      "Algorithmic stability without traditional collateral",
      "Cross-chain USDC movement without third-party bridge risks",
      "Native Bitcoin-denominated stablecoin functionality",
      "Yield-bearing stable assets through automated arbitrage"
    ],
    correctAnswer: 1,
    explanation: "USDCx leverages Circle's xReserve for cryptographic attestations and CCTP for crosschain transfers. This eliminates the security risks inherent in third-party bridges while maintaining full USDC interoperability across supported chains.",
    category: "defi"
  },
  {
    id: 35,
    question: "In the ALEX DEX protocol, the Automated Market Maker (AMM) model utilizes:",
    options: [
      "Traditional order book matching with limit orders",
      "Concentrated liquidity positions with custom price ranges",
      "Constant product formula with dynamic fee adjustment",
      "Dutch auction mechanics for price discovery"
    ],
    correctAnswer: 2,
    explanation: "ALEX employs an AMM model with constant product invariant (x*y=k) enhanced by dynamic fees. Liquidity providers deposit paired assets, and trades occur against the pool with prices determined by the ratio of reserves.",
    category: "defi"
  },
  {
    id: 36,
    question: "Arkadiko's USDA stablecoin maintains its peg through:",
    options: [
      "Algorithmic expansion and contraction of supply",
      "Over-collateralization with STX and liquidation mechanisms",
      "Direct backing by fiat currency reserves",
      "Central bank-style interest rate adjustments"
    ],
    correctAnswer: 1,
    explanation: "USDA is a crypto-collateralized stablecoin backed by STX deposits exceeding 100%. Users mint USDA by locking STX in vaults. If collateral ratios fall below thresholds, liquidations occur to protect the peg.",
    category: "defi"
  },
  {
    id: 37,
    question: "The Zest Protocol's primary innovation in Bitcoin DeFi is:",
    options: [
      "Enabling BTC-collateralized lending with sBTC integration",
      "Providing options trading for STX derivatives",
      "Creating synthetic Bitcoin exposure through futures",
      "Offering insurance against smart contract exploits"
    ],
    correctAnswer: 0,
    explanation: "Zest Protocol specializes in lending markets where users can borrow against Bitcoin collateral (via sBTC). This unlocks capital efficiency for Bitcoin holders seeking liquidity without selling their BTC holdings.",
    category: "defi"
  },
  {
    id: 38,
    question: "The Granite protocol distinguishes itself in the Stacks DeFi ecosystem by:",
    options: [
      "Providing BTC-collateralized borrowing with native sBTC",
      "Operating as a decentralized exchange with concentrated liquidity",
      "Offering insurance products for smart contract failures",
      "Enabling cross-chain swaps with Ethereum assets"
    ],
    correctAnswer: 0,
    explanation: "Granite focuses on capital efficiency for Bitcoin holders, allowing them to borrow against BTC collateral. With USDCx integration, users can access stablecoin liquidity without selling their Bitcoin.",
    category: "defi"
  },
  {
    id: 39,
    question: "Velar Protocol primarily offers:",
    options: [
      "NFT marketplace services",
      "Decentralized exchange and perpetual trading",
      "Cross-chain bridge infrastructure",
      "Stacking pool management"
    ],
    correctAnswer: 1,
    explanation: "Velar is a DeFi protocol on Stacks offering decentralized exchange functionality with an emphasis on perpetual futures trading, allowing users to trade with leverage on Bitcoin-based assets.",
    category: "defi"
  },

  // ============ NFT STANDARDS ============
  {
    id: 40,
    question: "The SIP-009 NFT standard on Stacks mandates that compliant contracts implement:",
    options: [
      "Automatic royalty distribution on secondary sales",
      "get-owner, get-token-uri, and transfer functions",
      "Built-in marketplace functionality for listings",
      "Fractional ownership capabilities"
    ],
    correctAnswer: 1,
    explanation: "SIP-009 defines the minimal NFT interface: `get-owner` returns the owner principal, `get-token-uri` provides metadata location, and `transfer` moves ownership. Additional functionality is optional but these three are required.",
    category: "nft"
  },
  {
    id: 41,
    question: "Unlike ERC-721 on Ethereum, Stacks NFTs benefit from:",
    options: [
      "Lower minting costs due to proof-of-stake consensus",
      "Native Bitcoin settlement ensuring asset persistence",
      "Automatic cross-chain bridging to Ethereum marketplaces",
      "Built-in fractionalization at the protocol level"
    ],
    correctAnswer: 1,
    explanation: "Stacks NFTs are anchored to Bitcoin through PoX consensus. This means NFT ownership records inherit Bitcoin's security and immutability, making them more resistant to chain reorganizations than assets on independent blockchains.",
    category: "nft"
  },
  {
    id: 42,
    question: "The SIP-010 fungible token standard differs from SIP-009 by:",
    options: [
      "Requiring on-chain metadata storage instead of URIs",
      "Implementing divisible quantities with decimal precision",
      "Mandating governance voting mechanisms",
      "Enabling native stacking functionality"
    ],
    correctAnswer: 1,
    explanation: "SIP-010 defines fungible tokens with decimal precision for divisibility. While SIP-009 NFTs are unique and indivisible, SIP-010 tokens support fractional amounts, making them suitable for currencies and utility tokens.",
    category: "nft"
  },
  {
    id: 43,
    question: "Ordinals and Stacks NFTs differ fundamentally in that:",
    options: [
      "Ordinals store data in Bitcoin transactions while Stacks uses smart contracts",
      "Stacks NFTs cannot be traded on secondary markets",
      "Ordinals support programmable logic while Stacks does not",
      "Both use identical technical implementations"
    ],
    correctAnswer: 0,
    explanation: "Ordinals inscribe data directly into Bitcoin transactions using witness data, making them immutable but non-programmable. Stacks NFTs use Clarity smart contracts, enabling complex logic, royalties, and dynamic metadata.",
    category: "nft"
  },
  {
    id: 44,
    question: "Gamma.io is primarily known as:",
    options: [
      "A Stacks mining pool operator",
      "The leading NFT marketplace on Stacks",
      "A liquid stacking protocol",
      "A governance token for Stacks Foundation"
    ],
    correctAnswer: 1,
    explanation: "Gamma.io is the premier NFT marketplace on Stacks, allowing users to create, buy, and sell NFTs. It supports SIP-009 standard tokens and provides tools for artists and collectors in the ecosystem.",
    category: "nft"
  },
  {
    id: 45,
    question: "BNS (Bitcoin Name Service) allows users to:",
    options: [
      "Mine Bitcoin using Stacks infrastructure",
      "Register human-readable names linked to addresses on Stacks",
      "Create smart contracts without knowing Clarity",
      "Exchange BTC for STX directly"
    ],
    correctAnswer: 1,
    explanation: "BNS is a decentralized naming system on Stacks that allows users to register .btc names (like yourname.btc) that resolve to addresses. Names are NFTs that can be transferred and traded.",
    category: "nft"
  },

  // ============ SECURITY ============
  {
    id: 46,
    question: "Clarity's prevention of reentrancy attacks stems from:",
    options: [
      "Mandatory mutex locks on all contract calls",
      "The language's non-Turing complete design preventing unbounded recursion",
      "Runtime detection that halts suspicious call patterns",
      "Compiler-injected checks at each external call site"
    ],
    correctAnswer: 1,
    explanation: "Clarity is deliberately non-Turing complete with no unbounded loops or recursion. This design makes reentrancy impossible since contracts cannot call back into themselves in unexpected ways during execution.",
    category: "security"
  },
  {
    id: 47,
    question: "One key security advantage of Clarity over Solidity is:",
    options: [
      "Faster transaction processing",
      "Interpreted execution allowing inspection of exact code",
      "Lower gas fees for complex operations",
      "Automatic bug bounty integration"
    ],
    correctAnswer: 1,
    explanation: "Clarity is interpreted, not compiled to bytecode. This means the actual source code runs on-chain and can be inspected by anyone, eliminating compiler bugs and ensuring what you see is what executes.",
    category: "security"
  },
  {
    id: 48,
    question: "The integer overflow issue that has caused major Solidity exploits:",
    options: [
      "Is equally problematic in Clarity contracts",
      "Is prevented by Clarity's native overflow checking",
      "Requires manual SafeMath libraries in Clarity",
      "Only affects unsigned integers in Clarity"
    ],
    correctAnswer: 1,
    explanation: "Clarity has built-in overflow/underflow protection. Arithmetic operations that would cause overflow fail explicitly rather than wrapping around silently, preventing a common class of vulnerabilities.",
    category: "security"
  },
  {
    id: 49,
    question: "Post-conditions in Stacks transactions protect users by:",
    options: [
      "Encrypting transaction data for privacy",
      "Ensuring expected asset transfers occur or the transaction fails",
      "Providing insurance against smart contract bugs",
      "Limiting maximum gas expenditure"
    ],
    correctAnswer: 1,
    explanation: "Post-conditions let users specify expected outcomes (e.g., 'I should not lose more than 100 STX'). If the actual result differs, the transaction is aborted, protecting against malicious or buggy contracts.",
    category: "security"
  },
  {
    id: 50,
    question: "Flash loans, a common DeFi attack vector, are:",
    options: [
      "Equally possible on Stacks as on Ethereum",
      "Impossible in Clarity due to its design constraints",
      "Only available through specialized protocols",
      "Require special permissions from Stacks Foundation"
    ],
    correctAnswer: 1,
    explanation: "Clarity's design makes traditional flash loans impossible. The language lacks the ability to perform atomic multi-step operations that flash loans require, eliminating this attack vector by design.",
    category: "security"
  },

  // ============ WALLETS & TOOLS ============
  {
    id: 51,
    question: "Leather (formerly Hiro Wallet) is:",
    options: [
      "A hardware wallet for cold storage",
      "The leading browser extension wallet for Stacks",
      "A mobile-only wallet application",
      "A multi-signature treasury solution"
    ],
    correctAnswer: 1,
    explanation: "Leather (previously called Hiro Wallet) is the primary browser extension wallet for Stacks. It supports STX, SIP-010 tokens, NFTs, and integrates with dApps for transaction signing.",
    category: "advanced"
  },
  {
    id: 52,
    question: "Xverse wallet differentiates itself by:",
    options: [
      "Only supporting hardware wallet connections",
      "Providing both mobile and extension versions with Bitcoin support",
      "Being the only wallet approved by Stacks Foundation",
      "Offering built-in exchange functionality only"
    ],
    correctAnswer: 1,
    explanation: "Xverse is a popular wallet available as both a mobile app and browser extension. It supports Stacks, Bitcoin, and Ordinals, making it a comprehensive solution for Bitcoin ecosystem users.",
    category: "advanced"
  },
  {
    id: 53,
    question: "Hiro Systems provides the Stacks ecosystem with:",
    options: [
      "The only valid stacking pool",
      "Developer tools including the Explorer and Clarinet",
      "Exclusive mining hardware",
      "Official price oracles for DeFi"
    ],
    correctAnswer: 1,
    explanation: "Hiro Systems is a core developer organization providing essential infrastructure: the Stacks Explorer for viewing on-chain data, Clarinet for local development and testing, and various APIs for developers.",
    category: "advanced"
  },
  {
    id: 54,
    question: "Clarinet is a development tool used to:",
    options: [
      "Deploy contracts directly to mainnet",
      "Develop, test, and debug Clarity contracts locally",
      "Convert Solidity contracts to Clarity",
      "Manage stacking pools"
    ],
    correctAnswer: 1,
    explanation: "Clarinet is a command-line tool and VS Code extension for Clarity development. It provides a local simulated blockchain, unit testing framework, and debugging tools for smart contract development.",
    category: "advanced"
  },

  // ============ ADVANCED TOPICS ============
  {
    id: 55,
    question: "The upcoming Satoshi upgrades roadmap includes fee abstraction, which enables:",
    options: [
      "Zero-fee transactions for verified accounts",
      "Payment of network fees in sBTC rather than STX",
      "Automatic fee optimization through MEV protection",
      "Subsidized transactions for new users"
    ],
    correctAnswer: 1,
    explanation: "Fee abstraction will permit users to pay Stacks network fees using sBTC instead of requiring STX. This significantly improves user experience for Bitcoin-native users entering the ecosystem.",
    category: "advanced"
  },
  {
    id: 56,
    question: "Clarity 4, planned for future release, will introduce:",
    options: [
      "Support for traditional programming paradigms",
      "WebAssembly (Wasm) compilation for performance",
      "Removal of decidability constraints",
      "Native support for non-fungible tokens"
    ],
    correctAnswer: 1,
    explanation: "Clarity 4 will add WebAssembly compilation support, significantly improving contract execution performance while maintaining Clarity's security guarantees and decidability properties.",
    category: "advanced"
  },
  {
    id: 57,
    question: "The Stacks Improvement Proposal (SIP) process is used for:",
    options: [
      "Filing bug reports with Hiro Systems",
      "Proposing and standardizing protocol changes and standards",
      "Requesting features from wallet developers",
      "Applying for Stacks Foundation grants"
    ],
    correctAnswer: 1,
    explanation: "SIPs are the formal mechanism for proposing changes to Stacks. They cover everything from token standards (SIP-009, SIP-010) to consensus changes, and require community review and approval.",
    category: "advanced"
  },
  {
    id: 58,
    question: "Self-minting sBTC, planned for the Satoshi upgrade, will allow:",
    options: [
      "Creating sBTC without any Bitcoin collateral",
      "Direct BTC-to-sBTC conversion without intermediaries",
      "Minting sBTC from other cryptocurrency collateral",
      "Unlimited sBTC creation by verified users"
    ],
    correctAnswer: 1,
    explanation: "Self-minting sBTC will enable users to convert BTC to sBTC directly without relying on a third party. This enhances decentralization and makes the peg-in process more trustless.",
    category: "advanced"
  },
  {
    id: 59,
    question: "The Stacks Foundation's primary role is to:",
    options: [
      "Control all protocol decisions unilaterally",
      "Support ecosystem growth through grants and governance",
      "Operate the only valid mining pool",
      "Set STX token prices on exchanges"
    ],
    correctAnswer: 1,
    explanation: "The Stacks Foundation is a non-profit supporting the ecosystem through developer grants, governance facilitation, marketing, and community building. It does not control the protocol, which is decentralized.",
    category: "advanced"
  },
  {
    id: 60,
    question: "STX token has a maximum supply that:",
    options: [
      "Is fixed at 21 million, like Bitcoin",
      "Starts at 1.32 billion with predictable annual unlocks",
      "Is unlimited with constant inflation",
      "Decreases over time through mandatory burning"
    ],
    correctAnswer: 1,
    explanation: "STX launched with ~1.32 billion tokens. The supply increases through mining rewards (decreasing over time) and token unlocks from the genesis block. The emission schedule creates predictable, diminishing inflation.",
    category: "advanced"
  }
];

interface StacksQuizProps {
  onComplete?: (score: number, total: number) => void;
}

const QUESTION_TIME_LIMIT = 45; // seconds per question

const StacksQuiz = ({ onComplete }: StacksQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);
  const [timedMode, setTimedMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timedOutQuestions, setTimedOutQuestions] = useState(0);

  // Shuffle and select 25 questions (comprehensive exam) ensuring diverse categories
  useEffect(() => {
    const categories = ["architecture", "clarity", "defi", "nft", "security", "advanced"];
    const questionsPerCategory: Record<string, QuizQuestion[]> = {};
    
    categories.forEach(cat => {
      questionsPerCategory[cat] = quizQuestions.filter(q => q.category === cat);
    });
    
    // Select questions proportionally from each category
    const selected: QuizQuestion[] = [];
    const targetTotal = 25;
    
    // Distribute questions: architecture 5, clarity 6, defi 5, nft 3, security 3, advanced 3
    const distribution: Record<string, number> = {
      architecture: 5,
      clarity: 6,
      defi: 5,
      nft: 3,
      security: 3,
      advanced: 3
    };
    
    categories.forEach(cat => {
      const available = [...questionsPerCategory[cat]].sort(() => Math.random() - 0.5);
      const count = Math.min(distribution[cat], available.length);
      selected.push(...available.slice(0, count));
    });
    
    // Shuffle the final selection
    const shuffled = selected.sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
  }, []);

  const question = shuffledQuestions[currentQuestion];

  // Timer effect for timed mode
  useEffect(() => {
    if (!timedMode || !quizStarted || showResult || quizComplete) return;
    
    setTimeLeft(QUESTION_TIME_LIMIT);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentQuestion, timedMode, quizStarted, showResult, quizComplete]);

  const handleTimeOut = () => {
    if (showResult) return;
    
    setIsCorrect(false);
    setShowResult(true);
    setTimedOutQuestions(prev => prev + 1);
    setAnsweredQuestions(prev => new Set(prev).add(currentQuestion));
  };

  const handleSubmit = () => {
    if (!selectedAnswer || !question) return;
    
    const answerIndex = parseInt(selectedAnswer);
    const correct = answerIndex === question.correctAnswer;
    
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct && !answeredQuestions.has(currentQuestion)) {
      setScore(s => s + 1);
    }
    setAnsweredQuestions(prev => new Set(prev).add(currentQuestion));
  };

  const handleNext = () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer("");
      setShowResult(false);
    } else {
      setQuizComplete(true);
      onComplete?.(score, shuffledQuestions.length);
    }
  };

  const handleRestart = () => {
    const categories = ["architecture", "clarity", "defi", "nft", "security", "advanced"];
    const questionsPerCategory: Record<string, QuizQuestion[]> = {};
    
    categories.forEach(cat => {
      questionsPerCategory[cat] = quizQuestions.filter(q => q.category === cat);
    });
    
    const selected: QuizQuestion[] = [];
    const distribution: Record<string, number> = {
      architecture: 5,
      clarity: 6,
      defi: 5,
      nft: 3,
      security: 3,
      advanced: 3
    };
    
    categories.forEach(cat => {
      const available = [...questionsPerCategory[cat]].sort(() => Math.random() - 0.5);
      const count = Math.min(distribution[cat], available.length);
      selected.push(...available.slice(0, count));
    });
    
    setShuffledQuestions(selected.sort(() => Math.random() - 0.5));
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
    setAnsweredQuestions(new Set());
    setTimeLeft(QUESTION_TIME_LIMIT);
    setTimedOutQuestions(0);
    setQuizStarted(false);
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(QUESTION_TIME_LIMIT);
  };

  if (shuffledQuestions.length === 0) {
    return <div className="text-center text-muted-foreground">Loading assessment...</div>;
  }

  // Mode selection screen
  if (!quizStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-8 max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Stacks Knowledge Assessment</h2>
          <p className="text-muted-foreground">
            Test your understanding across {shuffledQuestions.length} questions covering architecture, Clarity, DeFi, NFTs, security, and advanced topics.
          </p>
        </div>

        <div className="bg-muted/30 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Timer className={`w-5 h-5 ${timedMode ? "text-primary" : "text-muted-foreground"}`} />
              <div>
                <p className="font-medium text-foreground">Timed Exam Mode</p>
                <p className="text-sm text-muted-foreground">
                  {timedMode 
                    ? `${QUESTION_TIME_LIMIT} seconds per question. Unanswered questions count as incorrect.`
                    : "Take your time with no time pressure."}
                </p>
              </div>
            </div>
            <Switch
              checked={timedMode}
              onCheckedChange={setTimedMode}
            />
          </div>
        </div>

        <Button onClick={startQuiz} className="w-full gap-2" size="lg">
          {timedMode ? <Timer className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
          {timedMode ? "Start Timed Exam" : "Start Assessment"}
        </Button>
      </motion.div>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score / shuffledQuestions.length) * 100);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-xl p-8 max-w-2xl mx-auto"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Trophy className={`w-16 h-16 mx-auto mb-4 ${percentage >= 70 ? "text-primary" : "text-muted-foreground"}`} />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">Assessment Complete</h2>
          <p className="text-4xl font-black text-primary mb-2">{score} / {shuffledQuestions.length}</p>
          
          {timedMode && timedOutQuestions > 0 && (
            <p className="text-sm text-muted-foreground mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              {timedOutQuestions} question{timedOutQuestions > 1 ? 's' : ''} timed out
            </p>
          )}
          
          <p className="text-muted-foreground mb-6">
            {percentage >= 80 
              ? "Exceptional comprehension. You possess the foundational knowledge to navigate this ecosystem with confidence."
              : percentage >= 60
              ? "Commendable effort. A deeper study of the core concepts shall prove beneficial."
              : "The journey of mastery demands persistence. Consider revisiting the foundational topics."}
          </p>
          
          <Button onClick={handleRestart} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Attempt Again
          </Button>
        </div>
      </motion.div>
    );
  }

  const categoryColors: Record<string, string> = {
    architecture: "bg-blue-500/20 text-blue-400",
    clarity: "bg-purple-500/20 text-purple-400",
    defi: "bg-green-500/20 text-green-400",
    nft: "bg-orange-500/20 text-orange-400",
    security: "bg-red-500/20 text-red-400",
    advanced: "bg-cyan-500/20 text-cyan-400"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto"
    >
      {/* Progress and Timer */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <span>Question {currentQuestion + 1} of {shuffledQuestions.length}</span>
        </div>
        <div className="flex items-center gap-4">
          {timedMode && !showResult && (
            <div className={`flex items-center gap-1.5 text-sm font-medium ${
              timeLeft <= 10 ? "text-destructive" : timeLeft <= 20 ? "text-yellow-500" : "text-primary"
            }`}>
              <Timer className="w-4 h-4" />
              <span>{timeLeft}s</span>
            </div>
          )}
          <span className="text-sm font-medium text-primary">{score} correct</span>
        </div>
      </div>

      {/* Timer progress bar for timed mode */}
      {timedMode && !showResult && (
        <div className="h-1 bg-muted rounded-full mb-2 overflow-hidden">
          <motion.div
            className={`h-full ${
              timeLeft <= 10 ? "bg-destructive" : timeLeft <= 20 ? "bg-yellow-500" : "bg-primary"
            }`}
            initial={{ width: "100%" }}
            animate={{ width: `${(timeLeft / QUESTION_TIME_LIMIT) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Category badge */}
      <div className="mb-4">
        <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[question.category]}`}>
          {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestion + 1) / shuffledQuestions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <h3 className="text-lg font-semibold text-foreground mb-6 leading-relaxed">
        {question.question}
      </h3>

      {/* Options */}
      <RadioGroup
        value={selectedAnswer}
        onValueChange={setSelectedAnswer}
        className="space-y-3"
        disabled={showResult}
      >
        {question.options.map((option, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Label
              htmlFor={`option-${index}`}
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                showResult
                  ? index === question.correctAnswer
                    ? "border-green-500 bg-green-500/10"
                    : selectedAnswer === String(index)
                    ? "border-destructive bg-destructive/10"
                    : "border-border"
                  : selectedAnswer === String(index)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value={String(index)} id={`option-${index}`} className="mt-0.5" />
              <span className="text-sm leading-relaxed">{option}</span>
            </Label>
          </motion.div>
        ))}
      </RadioGroup>

      {/* Result feedback */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-6 p-4 rounded-lg ${
              isCorrect ? "bg-green-500/10 border border-green-500/30" : "bg-destructive/10 border border-destructive/30"
            }`}
          >
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-medium mb-1 ${isCorrect ? "text-green-500" : "text-destructive"}`}>
                  {isCorrect ? "Precisely correct." : "Not quite."}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        {!showResult ? (
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedAnswer}
            className="px-6"
          >
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNext} className="px-6">
            {currentQuestion < shuffledQuestions.length - 1 ? "Continue" : "View Results"}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default StacksQuiz;