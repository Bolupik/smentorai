import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { CheckCircle, XCircle, BookOpen, Trophy, RotateCcw } from "lucide-react";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: "architecture" | "clarity" | "defi" | "nft" | "security" | "advanced";
}

const quizQuestions: QuizQuestion[] = [
  // Architecture & Consensus
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

  // Clarity Language Syntax
  {
    id: 4,
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
    id: 5,
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
    id: 6,
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
    id: 7,
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
    id: 8,
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
    id: 9,
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
    id: 10,
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

  // DeFi Protocols
  {
    id: 11,
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
    id: 12,
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
    id: 13,
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
    id: 14,
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
    id: 15,
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
    id: 16,
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
  {
    id: 17,
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

  // NFT Standards
  {
    id: 18,
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
    id: 19,
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
    id: 20,
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
    id: 21,
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

  // Security & Advanced
  {
    id: 22,
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
    id: 23,
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
    id: 24,
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
    id: 25,
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
    id: 26,
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
    id: 27,
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
    id: 28,
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
  }
];

interface StacksQuizProps {
  onComplete?: (score: number, total: number) => void;
}

const StacksQuiz = ({ onComplete }: StacksQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);

  // Shuffle and select 12 questions on mount
  useEffect(() => {
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, 12);
    setShuffledQuestions(shuffled);
  }, []);

  const question = shuffledQuestions[currentQuestion];

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
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, 12);
    setShuffledQuestions(shuffled);
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
    setAnsweredQuestions(new Set());
  };

  if (shuffledQuestions.length === 0) {
    return <div className="text-center text-muted-foreground">Loading assessment...</div>;
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
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <span>Question {currentQuestion + 1} of {shuffledQuestions.length}</span>
        </div>
        <span className="text-sm font-medium text-primary">{score} correct</span>
      </div>

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