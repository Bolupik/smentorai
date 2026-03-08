import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { CheckCircle, XCircle, BookOpen, Trophy, RotateCcw, Timer, Clock } from "lucide-react";
import { Switch } from "./ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import GuestGate from "./GuestGate";

type AgeLevel = "child" | "teen" | "adult" | "expert";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  simpleExplanation?: string; // for child/teen mode — falls back to explanation if absent
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
    simpleExplanation: "Instead of wasting electricity, Stacks miners pay with real Bitcoin! That Bitcoin goes to people who lock up their STX — so you earn Bitcoin just by holding STX.",
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
    simpleExplanation: "After the Nakamoto upgrade, once your Stacks transaction is recorded on Bitcoin it can never be undone — just like how Bitcoin transactions are permanent!",
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
    simpleExplanation: "Signers are like referees — they check that new blocks of transactions are valid and sign off on them. If enough signers agree, the block becomes permanent.",
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
    simpleExplanation: "To stack on your own you need at least 100,000 STX — that's a lot! If you have less, you can join a pool where many people combine their STX together.",
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
    simpleExplanation: "Stacks is its own full blockchain (Layer 1) — not a shortcut built on top of Bitcoin. But it links to Bitcoin for safety, like having its own house next to a very secure bank vault.",
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
    simpleExplanation: "Every batch of Stacks transactions leaves a fingerprint on Bitcoin. So to fake Stacks history, you'd have to fake Bitcoin history — which is basically impossible!",
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
    simpleExplanation: "Microblocks are like quick receipts that appear every few seconds so you don't have to wait forever. They're temporary until the next main block confirms everything properly.",
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
    simpleExplanation: "Stacks opened to the public in January 2021 — that's when anyone could start using it to build apps and earn Bitcoin rewards!",
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
    simpleExplanation: "In 2019 Stacks (called Blockstack back then) became the very first crypto project to get the US government's official OK to sell tokens to regular people. A big deal!",
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
    simpleExplanation: "Because Stacks is connected to Bitcoin, to attack Stacks you'd have to attack Bitcoin first — which would cost billions of dollars. That makes Stacks extremely safe!",
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
    simpleExplanation: "Clarity lets experts check every possible thing a smart contract could do BEFORE it goes live — like reading every page of a book before publishing it, so no nasty surprises.",
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
    simpleExplanation: "A 'principal' in Clarity is like a name tag — it uniquely identifies a person's wallet or a smart contract. Only that specific identity can own things or take actions.",
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
    simpleExplanation: "This code creates a counter that starts at zero and can be changed later — like a scoreboard that anyone running the contract can update.",
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
    simpleExplanation: "If a Clarity function might return 'nothing', `unwrap-panic` forces it to give you the real value — or it stops everything and cancels the transaction if there's nothing there.",
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
    simpleExplanation: "Clarity doesn't have regular for-loops. Instead it uses special helper functions like `map` (do something to each item) and `filter` (keep only matching items) to work through lists.",
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
    simpleExplanation: "`tx-sender` always tells you WHO originally started the transaction — like knowing whose ID is on the package, no matter how many hands it passed through.",
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
    simpleExplanation: "Post-conditions are like a promise checker — you say 'I should only lose 10 STX', and if a contract tries to take more, the whole transaction is automatically cancelled. Super protective!",
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
    simpleExplanation: "`as-contract` lets a smart contract act on its own behalf — like giving a robot permission to handle tasks using its own identity instead of yours.",
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
    simpleExplanation: "`block-height` gives you the current Stacks block number — like a page number in the blockchain's book. It counts Stacks blocks, not Bitcoin blocks.",
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
    simpleExplanation: "A trait is like a job description — it says 'any contract that claims to be an NFT MUST have these specific functions'. It keeps everything organized and consistent.",
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
    simpleExplanation: "`stx-burn?` permanently destroys STX tokens — like shredding money. Once burned, those tokens are gone forever, which can make the remaining tokens slightly more valuable.",
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
    simpleExplanation: "`tx-sender` = who originally pressed the button. `contract-caller` = who (or what contract) called this specific function right now. They can be different in chain reactions.",
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
    simpleExplanation: "`define-map` creates a lookup table — like a dictionary where you can store and find data using a key. For example, storing each user's balance using their address as the key.",
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
    simpleExplanation: "Clarity puts the function name first, like `(add 1 2)` instead of `1 + 2`. This removes all ambiguity — the computer always knows exactly what to do and in what order.",
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
    simpleExplanation: "Clarity can handle numbers up to 128 bits long — that's a number with 38 digits! More than enough for any real-world amount of tokens.",
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
    simpleExplanation: "sBTC is like a digital version of Bitcoin that you can use in apps — and you don't need to trust any company or middleman to hold your Bitcoin for you. It's fully automatic!",
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
    simpleExplanation: "When sBTC first launched in late 2024, only 1,000 Bitcoin could be put in. People filled it up in just 4 days — showing how excited everyone was!",
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
    simpleExplanation: "You send your Bitcoin to a special address controlled by many people at once (no single person can steal it). Then the same amount of sBTC appears in your Stacks wallet.",
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
    simpleExplanation: "In April 2025, Stacks turned on the ability to convert sBTC back to real Bitcoin. Up to 150 BTC per day can leave the system, completing the full cycle.",
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
    simpleExplanation: "Dual stacking is like a combo bonus — lock your STX AND hold sBTC at the same time, and you earn way more Bitcoin rewards (up to 5% per year instead of about 0.5%)!",
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
    simpleExplanation: "When you stack STX, you earn real Bitcoin as a reward — not more STX or fake tokens. It's one of the only ways to earn BTC without selling anything!",
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
    simpleExplanation: "Each stacking cycle lasts about 2 weeks. During that time your STX is locked, and at the end you receive Bitcoin rewards based on how much you stacked.",
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
    simpleExplanation: "When you use StackingDAO, you get stSTX tokens as a receipt for your locked STX. You can trade or use these tokens in apps while your original STX still earns Bitcoin rewards!",
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
    simpleExplanation: "USDCx lets the USDC dollar-coin move to Stacks safely, without trusting a middleman bridge that could be hacked. It uses Circle's own official system.",
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
    simpleExplanation: "ALEX is like a vending machine for tokens — it uses a math formula (x×y=k) to set prices automatically. The more of one token you buy, the more expensive it gets.",
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
    simpleExplanation: "USDA stays worth $1 because you have to lock up MORE than $1 worth of STX to create each USDA. If the value drops too low, the system automatically sells some collateral to protect the peg.",
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
    simpleExplanation: "Zest lets you borrow money using your Bitcoin as collateral — so you can get cash without selling your BTC. It's like getting a loan with your Bitcoin as the 'security deposit'.",
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
    simpleExplanation: "Granite lets Bitcoin holders borrow dollar-coins (USDC) using their BTC as collateral. You keep your Bitcoin exposure while getting cash to use right now.",
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
    simpleExplanation: "Velar is a trading platform on Stacks where you can swap tokens AND trade with leverage (bets that multiply your gains — or losses). Think of it as a crypto trading app built on Bitcoin.",
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
    simpleExplanation: "Every NFT on Stacks must be able to: say who owns it (`get-owner`), point to its picture/metadata (`get-token-uri`), and let the owner send it to someone else (`transfer`).",
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
    simpleExplanation: "Stacks NFTs are connected to Bitcoin, so who owns them is recorded on the most secure blockchain in the world. Your digital art can't be lost or faked even in 100 years.",
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
    simpleExplanation: "SIP-009 is for unique items (NFTs — like trading cards). SIP-010 is for coins (like money) that can be split into tiny pieces. One is for collectibles, the other is for currency.",
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
    simpleExplanation: "Bitcoin Ordinals are images stamped directly onto Bitcoin (permanent but static). Stacks NFTs use smart contracts so they can have rules, royalties, and special abilities.",
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
    simpleExplanation: "Gamma.io is the main place to buy and sell NFTs on Stacks — like an eBay or Amazon for digital art and collectibles on the Stacks blockchain.",
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
    simpleExplanation: "BNS lets you get a simple name like 'alice.btc' instead of a long confusing address. It's like getting a personal domain name — and it lives on the blockchain!",
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
    simpleExplanation: "A reentrancy attack is when a bad contract calls itself over and over to steal money (it hacked $60M from Ethereum once!). Clarity prevents this completely because it literally cannot call itself in a loop.",
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
    simpleExplanation: "Unlike Ethereum contracts that get converted to machine code (which is hard to read), Clarity runs its original readable code directly on-chain. You can always check EXACTLY what a contract does!",
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
    simpleExplanation: "Integer overflow is when a number gets so big it 'wraps around' to zero — like an odometer. Hackers have exploited this in other chains, but Clarity catches it automatically and stops the transaction.",
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
    simpleExplanation: "Before you send a transaction you can say 'I must not lose more than X STX'. If the contract tries to take more, EVERYTHING cancels automatically. It's a built-in safety net!",
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
    simpleExplanation: "Flash loans borrow millions, manipulate prices, and pay back in one transaction — a sneaky attack used to steal from DeFi apps. Clarity's design makes this kind of trick impossible!",
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
    simpleExplanation: "Leather is a browser extension (like a plugin) that acts as your Stacks wallet. It lets you store STX, NFTs, and connect to Stacks apps — similar to how MetaMask works for Ethereum.",
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
    simpleExplanation: "Xverse works on your phone AND as a browser extension, and it handles both Stacks AND Bitcoin (including Ordinals). It's like a Swiss Army knife wallet for the Bitcoin ecosystem.",
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
    simpleExplanation: "Hiro builds the tools that developers need: a blockchain explorer (to see all transactions), Clarinet (to test smart contracts), and APIs. Think of them as the toolmakers for Stacks builders.",
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
    simpleExplanation: "Clarinet is like a practice sandbox for Stacks developers — you can write smart contracts, test them locally on a fake blockchain, and fix bugs before anyone's real money is at stake.",
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
    simpleExplanation: "Right now you need STX to pay for Stacks transactions, even if you only have Bitcoin. Fee abstraction will let you pay using sBTC instead — much friendlier for Bitcoin-first users!",
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
    simpleExplanation: "Clarity 4 will add WebAssembly support — a technology that makes code run much faster, like upgrading from a bicycle to a car, while keeping all the same safety guarantees.",
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
    simpleExplanation: "A SIP is like a formal suggestion box for improving Stacks. Anyone can write one to propose a new feature or standard. The community reviews and votes — if approved, it becomes part of Stacks!",
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
    simpleExplanation: "Currently converting BTC to sBTC involves some coordination. Self-minting means you'll be able to do it all yourself, directly — no waiting, no middlemen, full control.",
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
    simpleExplanation: "The Stacks Foundation is like a support organization — it gives out grants to builders, helps with community decisions, and promotes Stacks. But it doesn't control the network; that's decentralized.",
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
    simpleExplanation: "STX started with about 1.32 billion tokens. New ones are slowly released on a predictable schedule (getting smaller each year), similar to how Bitcoin halves its mining rewards.",
    explanation: "STX launched with ~1.32 billion tokens. The supply increases through mining rewards (decreasing over time) and token unlocks from the genesis block. The emission schedule creates predictable, diminishing inflation.",
    category: "advanced"
  }
];

interface StacksQuizProps {
  onComplete?: (score: number, total: number) => void;
}

const QUESTION_TIME_LIMIT = 45; // seconds per question

type TopicFilter = "all" | "architecture" | "clarity" | "defi" | "nft" | "security" | "advanced";

const topicOptions: { value: TopicFilter; label: string; emoji: string; description: string }[] = [
  { value: "all", label: "All Topics", emoji: "🎯", description: "Mixed from every category" },
  { value: "architecture", label: "Architecture", emoji: "🏗️", description: "PoX, Nakamoto, Bitcoin anchoring" },
  { value: "clarity", label: "Clarity", emoji: "💎", description: "Smart contract language" },
  { value: "defi", label: "DeFi & sBTC", emoji: "₿", description: "Protocols, stacking, sBTC" },
  { value: "nft", label: "NFTs", emoji: "🖼️", description: "Standards, marketplaces, BNS" },
  { value: "security", label: "Security", emoji: "🔐", description: "Vulnerabilities & best practices" },
  { value: "advanced", label: "Advanced", emoji: "🧠", description: "Governance, ecosystem, tokenomics" },
];

const StacksQuiz = ({ onComplete }: StacksQuizProps) => {
  const { user } = useAuth();
  const [ageLevel, setAgeLevel] = useState<AgeLevel>("adult");
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
  const [selectedTopic, setSelectedTopic] = useState<TopicFilter>("all");
  // Track answers per question index for back-navigation
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, string>>({});

  // Fetch age level from profile (server-side, not from localStorage)
  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('age_level')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.age_level) {
          setAgeLevel(data.age_level as AgeLevel);
        }
      });
  }, [user]);

  // Helper: pick explanation based on age level
  const getExplanation = (q: QuizQuestion) => {
    if ((ageLevel === "child" || ageLevel === "teen") && q.simpleExplanation) {
      return q.simpleExplanation;
    }
    return q.explanation;
  };

  // Shuffle and select questions based on topic filter
  useEffect(() => {
    const buildQuestions = (topic: TopicFilter) => {
      if (topic !== "all") {
        const pool = quizQuestions.filter(q => q.category === topic).sort(() => Math.random() - 0.5);
        return pool.slice(0, Math.min(15, pool.length));
      }
      const categories = ["architecture", "clarity", "defi", "nft", "security", "advanced"] as const;
      const distribution: Record<string, number> = { architecture: 5, clarity: 6, defi: 5, nft: 3, security: 3, advanced: 3 };
      const selected: QuizQuestion[] = [];
      categories.forEach(cat => {
        const available = quizQuestions.filter(q => q.category === cat).sort(() => Math.random() - 0.5);
        selected.push(...available.slice(0, Math.min(distribution[cat], available.length)));
      });
      return selected.sort(() => Math.random() - 0.5);
    };
    setShuffledQuestions(buildQuestions(selectedTopic));
  }, [selectedTopic]);

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
    setQuestionAnswers(prev => ({ ...prev, [currentQuestion]: "-1" })); // -1 = timed out
  };

  const handleSubmit = () => {
    if (!selectedAnswer || !question) return;
    
    const answerIndex = parseInt(selectedAnswer);
    const correct = answerIndex === question.correctAnswer;
    
    setIsCorrect(correct);
    setShowResult(true);
    setQuestionAnswers(prev => ({ ...prev, [currentQuestion]: selectedAnswer }));
    
    if (correct && !answeredQuestions.has(currentQuestion)) {
      setScore(s => s + 1);
    } else if (!correct && answeredQuestions.has(currentQuestion) && questionAnswers[currentQuestion] === String(question.correctAnswer)) {
      // Was correct before, now wrong — deduct
      setScore(s => Math.max(0, s - 1));
    }
    setAnsweredQuestions(prev => new Set(prev).add(currentQuestion));
  };

  const handleNext = () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      const next = currentQuestion + 1;
      setCurrentQuestion(next);
      setSelectedAnswer(questionAnswers[next] ?? "");
      setShowResult(answeredQuestions.has(next));
      if (questionAnswers[next] !== undefined) {
        const prevQ = shuffledQuestions[next];
        setIsCorrect(parseInt(questionAnswers[next]) === prevQ.correctAnswer);
      }
    } else {
      setQuizComplete(true);
      const finalPct = Math.round((score / shuffledQuestions.length) * 100);
      // Persist best score so ProfileAchievements can read it
      if (user) {
        const key = `quiz_best_score_${user.id}`;
        const prev = Number(localStorage.getItem(key) ?? 0);
        if (finalPct > prev) localStorage.setItem(key, String(finalPct));
      } else {
        // wallet / guest
        const walletAddr = Object.keys(localStorage).find((k) => k.startsWith("stacks_age_level_"))
          ?.replace("stacks_age_level_", "");
        const key = walletAddr ? `quiz_best_score_wallet_${walletAddr}` : "quiz_best_score_guest";
        const prev = Number(localStorage.getItem(key) ?? 0);
        if (finalPct > prev) localStorage.setItem(key, String(finalPct));
      }
      onComplete?.(score, shuffledQuestions.length);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      const prev = currentQuestion - 1;
      setCurrentQuestion(prev);
      setSelectedAnswer(questionAnswers[prev] ?? "");
      setShowResult(answeredQuestions.has(prev));
      if (questionAnswers[prev] !== undefined) {
        const prevQ = shuffledQuestions[prev];
        setIsCorrect(parseInt(questionAnswers[prev]) === prevQ.correctAnswer);
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
    setAnsweredQuestions(new Set());
    setQuestionAnswers({});
    setTimeLeft(QUESTION_TIME_LIMIT);
    setTimedOutQuestions(0);
    setQuizStarted(false);
    // Re-trigger question build
    const buildQuestions = (topic: TopicFilter) => {
      if (topic !== "all") {
        const pool = quizQuestions.filter(q => q.category === topic).sort(() => Math.random() - 0.5);
        return pool.slice(0, Math.min(15, pool.length));
      }
      const categories = ["architecture", "clarity", "defi", "nft", "security", "advanced"] as const;
      const distribution: Record<string, number> = { architecture: 5, clarity: 6, defi: 5, nft: 3, security: 3, advanced: 3 };
      const selected: QuizQuestion[] = [];
      categories.forEach(cat => {
        const available = quizQuestions.filter(q => q.category === cat).sort(() => Math.random() - 0.5);
        selected.push(...available.slice(0, Math.min(distribution[cat], available.length)));
      });
      return selected.sort(() => Math.random() - 0.5);
    };
    setShuffledQuestions(buildQuestions(selectedTopic));
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
      <GuestGate feature="quiz submissions" overlay>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-8 max-w-2xl mx-auto"
        >
          <div className="text-center mb-6">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Stacks Knowledge Assessment</h2>
            <p className="text-muted-foreground text-sm">
              Choose a topic to focus on, or test across all categories.
            </p>
          </div>

          {/* Topic selector */}
          <div className="mb-6">
            <p className="text-sm font-medium text-foreground mb-3">Select Topic</p>
            <div className="grid grid-cols-2 gap-2">
              {topicOptions.map((topic) => (
                <button
                  key={topic.value}
                  type="button"
                  onClick={() => setSelectedTopic(topic.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                    selectedTopic === topic.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-base">{topic.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{topic.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{topic.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedTopic === "all" ? `${shuffledQuestions.length} questions across all topics` : `${shuffledQuestions.length} questions on ${topicOptions.find(t => t.value === selectedTopic)?.label}`}
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Timer className={`w-5 h-5 ${timedMode ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="font-medium text-foreground text-sm">Timed Exam Mode</p>
                  <p className="text-xs text-muted-foreground">
                    {timedMode 
                      ? `${QUESTION_TIME_LIMIT}s per question. Unanswered = incorrect.`
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
      </GuestGate>
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
              ? (ageLevel === "child" ? "🌟 Amazing! You really know your Stacks stuff!" : ageLevel === "teen" ? "🔥 Great job! You've got solid Stacks knowledge!" : "Exceptional comprehension. You possess the foundational knowledge to navigate this ecosystem with confidence.")
              : percentage >= 60
              ? (ageLevel === "child" ? "👍 Pretty good! Keep learning and you'll be a Stacks expert!" : ageLevel === "teen" ? "Good effort! Review the topics you missed to level up." : "Commendable effort. A deeper study of the core concepts shall prove beneficial.")
              : (ageLevel === "child" ? "💪 Don't give up! Try again and you'll do better!" : ageLevel === "teen" ? "Keep at it! Revisit the basics and try again." : "The journey of mastery demands persistence. Consider revisiting the foundational topics.")}
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
              isCorrect ? "bg-primary/10 border border-primary/30" : "bg-destructive/10 border border-destructive/30"
            }`}
          >
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-medium mb-1 ${isCorrect ? "text-primary" : "text-destructive"}`}>
                  {isCorrect
                    ? (ageLevel === "child" ? "🎉 Yes! That's right!" : ageLevel === "teen" ? "✓ Correct!" : "Precisely correct.")
                    : (ageLevel === "child" ? "😅 Not quite — here's why:" : ageLevel === "teen" ? "Not quite — here's the explanation:" : "Not quite.")}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {getExplanation(question)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex justify-between gap-3 mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-4 gap-2"
        >
          ← Previous
        </Button>
        <div>
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
      </div>
    </motion.div>
  );
};

export default StacksQuiz;