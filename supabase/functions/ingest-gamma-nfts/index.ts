import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000001";

interface NFTPage {
  name: string;
  url: string;
  type: "overview" | "ecosystem" | "collection";
  // Collection metadata
  creator?: string;
  xHandle?: string;
  xUrl?: string;
  contractAddress?: string;
  supply?: number;
  launchYear?: number;
  website?: string;
  discord?: string;
  description?: string;
  deepPages?: string[];
}

const ALL_PAGES: NFTPage[] = [
  // ─── Gamma platform overview ───────────────────────────────────
  { name: "Gamma.io NFT Marketplace Overview", url: "https://gamma.io", type: "overview" },
  { name: "Gamma.io Collections Explorer", url: "https://gamma.io/collections", type: "overview" },
  { name: "Gamma.io Launchpad", url: "https://gamma.io/launchpad", type: "overview" },
  { name: "Gamma.io Blog", url: "https://gamma.io/blog", type: "overview" },

  // ─── NFT protocol & ecosystem docs ─────────────────────────────
  {
    name: "SIP-009 Non-Fungible Token Standard",
    url: "https://github.com/stacksgov/sips/blob/main/sips/sip-009/sip-009-nft-standard.md",
    type: "ecosystem",
  },
  { name: "Stacks NFT Docs (docs.stacks.co)", url: "https://docs.stacks.co/reference/nfts", type: "ecosystem" },
  { name: "Clarity NFT Trait Reference", url: "https://docs.stacks.co/clarity/reference/nft-trait", type: "ecosystem" },
  { name: "Tradeport Stacks NFT Marketplace", url: "https://tradeport.xyz/stacks", type: "ecosystem" },
  { name: "Boom.money NFT Marketplace", url: "https://boom.money", type: "ecosystem" },
  { name: "BNS.market Bitcoin Name Service Marketplace", url: "https://bns.market", type: "ecosystem" },

  // ─── Individual Stacks NFT Collections ─────────────────────────
  {
    name: "Bitcoin Monkeys",
    url: "https://gamma.io/collections/bitcoin-monkeys",
    type: "collection",
    creator: "Friedger Müller",
    xHandle: "@BitcoinMonkeys_",
    xUrl: "https://x.com/BitcoinMonkeys_",
    contractAddress: "SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.bitcoin-monkeys",
    supply: 5000,
    launchYear: 2021,
    website: "https://bitcoinmonkeys.io",
    discord: "https://discord.gg/bitcoinmonkeys",
    description: "One of the first and most iconic Stacks NFT collections. 5,000 unique monkey PFPs minted on Stacks, secured by Bitcoin.",
    deepPages: ["https://bitcoinmonkeys.io"],
  },
  {
    name: "Megapont Ape Club",
    url: "https://gamma.io/collections/megapont-ape-club",
    type: "collection",
    creator: "Megapont Team",
    xHandle: "@megapontNFT",
    xUrl: "https://x.com/megapontNFT",
    contractAddress: "SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.megapont-ape-club-nft",
    supply: 10000,
    launchYear: 2022,
    website: "https://megapont.com",
    discord: "https://discord.gg/megapont",
    description: "10,000 unique ape NFTs on Stacks. One of the highest-volume collections on the Stacks ecosystem.",
    deepPages: ["https://megapont.com"],
  },
  {
    name: "Stacks Parrots",
    url: "https://gamma.io/collections/stacks-parrots",
    type: "collection",
    creator: "Stacks Parrots Team",
    xHandle: "@StacksParrots",
    xUrl: "https://x.com/StacksParrots",
    contractAddress: "SP2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.stacks-parrots",
    supply: 3750,
    launchYear: 2022,
    description: "3,750 unique parrot NFTs building community on Stacks.",
  },
  {
    name: "Crash Punks",
    url: "https://gamma.io/collections/crashpunks-v2",
    type: "collection",
    creator: "Crashpunks Team",
    xHandle: "@CrashPunksNFT",
    xUrl: "https://x.com/CrashPunksNFT",
    contractAddress: "SP3QSAJQ4EA8WXEDSRRKMZZ29NH91VZ6C5X88FGZQ.crashpunks-v2",
    supply: 9216,
    launchYear: 2021,
    website: "https://crashpunks.com",
    discord: "https://discord.gg/crashpunks",
    description: "9,216 punk-inspired NFTs on Stacks, one of the earliest Stacks NFT launches.",
    deepPages: ["https://crashpunks.com"],
  },
  {
    name: "Satoshibles",
    url: "https://gamma.io/collections/satoshibles",
    type: "collection",
    creator: "Satoshibles Team",
    xHandle: "@satoshibles",
    xUrl: "https://x.com/satoshibles",
    contractAddress: "SP6P4EJF0VG8V0RB3TQQKJBHDQKEF6NVRD1KZE3C.satoshibles",
    supply: 5000,
    launchYear: 2021,
    website: "https://satoshibles.com",
    discord: "https://discord.gg/satoshibles",
    description: "5,000 unique NFTs on Stacks inspired by Satoshi Nakamoto. One of the premier blue-chip Stacks collections.",
    deepPages: ["https://satoshibles.com"],
  },
  {
    name: "StacksFrens",
    url: "https://gamma.io/collections/stacksfreens",
    type: "collection",
    creator: "StacksFrens Team",
    xHandle: "@StacksFrens",
    xUrl: "https://x.com/StacksFrens",
    contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.stacks-frens",
    supply: 2000,
    launchYear: 2022,
    description: "2,000 frens NFTs building community on Stacks.",
  },
  {
    name: "Stacks Punks",
    url: "https://gamma.io/collections/stacks-punks",
    type: "collection",
    creator: "Stacks Punks Team",
    xHandle: "@StacksPunksNFT",
    xUrl: "https://x.com/StacksPunksNFT",
    contractAddress: "SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.stacks-punks",
    supply: 10000,
    launchYear: 2021,
    description: "10,000 pixel punk NFTs on Stacks, the Stacks answer to CryptoPunks.",
  },
  {
    name: "Bitcoin Wizards",
    url: "https://gamma.io/collections/bitcoin-wizards",
    type: "collection",
    creator: "Bitcoin Wizards Team",
    xHandle: "@BTCWizardsNFT",
    xUrl: "https://x.com/BTCWizardsNFT",
    contractAddress: "SP2X0TZ59D5SZ8ACQ6ZMCHHHMBQ3DKMQYF6MZKXH.bitcoin-wizards",
    supply: 2121,
    launchYear: 2023,
    description: "2,121 wizard-themed NFTs on Stacks, paying homage to Bitcoin Wizards lore and Bitcoin's cypherpunk origins.",
  },
  {
    name: "Space Robots",
    url: "https://gamma.io/collections/space-robots",
    type: "collection",
    creator: "Space Robots Team",
    xHandle: "@StacksSpaceRobots",
    xUrl: "https://x.com/StacksSpaceRobots",
    contractAddress: "SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.space-robots",
    supply: 9999,
    launchYear: 2022,
    description: "9,999 robot NFTs in space, built on Stacks.",
  },
  {
    name: "Ordinal Zombies",
    url: "https://gamma.io/collections/ordinal-zombies",
    type: "collection",
    creator: "Ordinal Zombies Team",
    xHandle: "@OrdinalZombies",
    xUrl: "https://x.com/OrdinalZombies",
    contractAddress: "SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.ordinal-zombies",
    supply: 666,
    launchYear: 2023,
    description: "666 zombie-themed NFTs bridging the Ordinals and Stacks NFT ecosystems.",
  },
  {
    name: "Stacks Skulls",
    url: "https://gamma.io/collections/stacks-skulls",
    type: "collection",
    creator: "Stacks Skulls Team",
    xHandle: "@StacksSkulls",
    xUrl: "https://x.com/StacksSkulls",
    supply: 1111,
    launchYear: 2022,
    description: "1,111 skull-themed NFTs on Stacks.",
  },
  {
    name: "Rawr Bears",
    url: "https://gamma.io/collections/rawr-bears",
    type: "collection",
    creator: "Rawr Bears Team",
    xHandle: "@RawrBearsNFT",
    xUrl: "https://x.com/RawrBearsNFT",
    supply: 3000,
    launchYear: 2022,
    description: "3,000 bear-themed NFTs on Stacks.",
  },
  {
    name: "Block Surfers",
    url: "https://gamma.io/collections/block-surfers",
    type: "collection",
    creator: "Block Surfers Team",
    xHandle: "@BlockSurfersNFT",
    xUrl: "https://x.com/BlockSurfersNFT",
    supply: 2000,
    launchYear: 2022,
    description: "2,000 surfer-themed NFTs riding the Stacks blockchain.",
  },
  {
    name: "Galactic Geckos",
    url: "https://gamma.io/collections/galactic-geckos",
    type: "collection",
    creator: "Galactic Geckos Team",
    xHandle: "@GalacticGeckosNFT",
    xUrl: "https://x.com/GalacticGeckosNFT",
    contractAddress: "SP2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.galactic-geckos",
    supply: 10000,
    launchYear: 2022,
    website: "https://galacticgeckos.io",
    discord: "https://discord.gg/galacticgeckos",
    description: "10,000 galactic gecko NFTs on Stacks with a strong community and gaming utility.",
    deepPages: ["https://galacticgeckos.io"],
  },
  {
    name: "Stacked Nouns",
    url: "https://gamma.io/collections/stacked-nouns",
    type: "collection",
    creator: "Stacked Nouns DAO",
    xHandle: "@StackedNouns",
    xUrl: "https://x.com/StackedNouns",
    supply: 365,
    launchYear: 2022,
    description: "Stacks-native interpretation of the Nouns DAO concept — one NFT minted per day, with proceeds governed by DAO.",
  },
  {
    name: "Pixel Cowboys",
    url: "https://gamma.io/collections/pixel-cowboys",
    type: "collection",
    creator: "Pixel Cowboys Team",
    xHandle: "@PixelCowboysNFT",
    xUrl: "https://x.com/PixelCowboysNFT",
    supply: 1500,
    launchYear: 2022,
    description: "1,500 pixel art cowboy NFTs on Stacks.",
  },
  {
    name: "Bitcoin Birds",
    url: "https://gamma.io/collections/bitcoin-birds",
    type: "collection",
    creator: "Bitcoin Birds Team",
    xHandle: "@BitcoinBirdsNFT",
    xUrl: "https://x.com/BitcoinBirdsNFT",
    contractAddress: "SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.bitcoin-birds",
    supply: 5000,
    launchYear: 2022,
    description: "5,000 bird-themed NFTs on Stacks.",
  },
  {
    name: "Stacks Dogs",
    url: "https://gamma.io/collections/stacks-dogs",
    type: "collection",
    creator: "Stacks Dogs Team",
    xHandle: "@StacksDogsNFT",
    xUrl: "https://x.com/StacksDogsNFT",
    supply: 2500,
    launchYear: 2022,
    description: "2,500 dog NFTs on Stacks.",
  },
  {
    name: "Stellar Foxes",
    url: "https://gamma.io/collections/stellar-foxes",
    type: "collection",
    creator: "Stellar Foxes Team",
    xHandle: "@StellarFoxesNFT",
    xUrl: "https://x.com/StellarFoxesNFT",
    supply: 3000,
    launchYear: 2022,
    description: "3,000 fox-themed NFTs on Stacks.",
  },
  {
    name: "Stacks Wolves",
    url: "https://gamma.io/collections/stacks-wolves",
    type: "collection",
    creator: "Stacks Wolves Team",
    xHandle: "@StacksWolvesNFT",
    xUrl: "https://x.com/StacksWolvesNFT",
    supply: 2000,
    launchYear: 2022,
    description: "2,000 wolf-themed NFTs on the Stacks blockchain.",
  },
  {
    name: "Stacks Citizens",
    url: "https://gamma.io/collections/stacks-citizens",
    type: "collection",
    creator: "Stacks Citizens Team",
    xHandle: "@StacksCitizens",
    xUrl: "https://x.com/StacksCitizens",
    supply: 5000,
    launchYear: 2022,
    description: "5,000 citizen-themed NFTs representing the Stacks community.",
  },
  {
    name: "Stack City",
    url: "https://gamma.io/collections/stack-city",
    type: "collection",
    creator: "Stack City Team",
    xHandle: "@StackCityNFT",
    xUrl: "https://x.com/StackCityNFT",
    supply: 2000,
    launchYear: 2022,
    description: "2,000 city-themed NFTs building a metaverse on Stacks.",
  },
  {
    name: "Stacks Turtles",
    url: "https://gamma.io/collections/stacks-turtles",
    type: "collection",
    creator: "Stacks Turtles Team",
    xHandle: "@StacksTurtlesNFT",
    xUrl: "https://x.com/StacksTurtlesNFT",
    supply: 1000,
    launchYear: 2022,
    description: "1,000 turtle-themed NFTs on Stacks.",
  },
  {
    name: "Muneeb NFT",
    url: "https://gamma.io/collections/muneeb-nft",
    type: "collection",
    creator: "Muneeb Ali",
    xHandle: "@muneeb",
    xUrl: "https://x.com/muneeb",
    description: "NFT collection by Muneeb Ali, co-creator of Stacks and Blockstack. Muneeb is a Princeton PhD and the visionary behind bringing smart contracts to Bitcoin via Stacks.",
    supply: 100,
    launchYear: 2022,
    deepPages: ["https://x.com/muneeb"],
  },
  {
    name: "BNS Names Collection",
    url: "https://gamma.io/collections/bns",
    type: "collection",
    creator: "Stacks Foundation / Hiro Systems",
    xHandle: "@stacks",
    xUrl: "https://x.com/stacks",
    contractAddress: "SP000000000000000000002Q6VF78.bns",
    description: "Bitcoin Name System (BNS) — decentralized name registry built on Stacks. BNS names (.btc) are SIP-009 NFTs owned by the registrant on-chain. No central authority controls them.",
    deepPages: ["https://docs.stacks.co/reference/bns"],
  },
  {
    name: "Stacks Punks V2",
    url: "https://gamma.io/collections/stacks-punks-v2",
    type: "collection",
    creator: "Stacks Punks Team",
    xHandle: "@StacksPunksNFT",
    xUrl: "https://x.com/StacksPunksNFT",
    supply: 10000,
    launchYear: 2022,
    description: "Updated v2 of Stacks Punks — 10,000 pixel punk NFTs on Stacks.",
  },
  {
    name: "Stacks Space Penguins",
    url: "https://gamma.io/collections/stacks-space-penguins",
    type: "collection",
    creator: "Space Penguins Team",
    xHandle: "@StacksSpacePenguins",
    xUrl: "https://x.com/StacksSpacePenguins",
    supply: 3000,
    launchYear: 2022,
    description: "3,000 penguin-in-space themed NFTs on Stacks.",
  },
  {
    name: "Boom NFTs",
    url: "https://gamma.io/collections/boom-nfts",
    type: "collection",
    creator: "Boom.money Team",
    xHandle: "@boom_wallet",
    xUrl: "https://x.com/boom_wallet",
    website: "https://boom.money",
    description: "NFTs minted and traded on Boom.money — a Stacks NFT marketplace and wallet platform. Boom supports creator royalties and secondary sales via Clarity smart contracts.",
    deepPages: ["https://boom.money"],
  },
  {
    name: "Lil Crashpunks",
    url: "https://gamma.io/collections/lil-crashpunks",
    type: "collection",
    creator: "Crashpunks Team",
    xHandle: "@CrashPunksNFT",
    xUrl: "https://x.com/CrashPunksNFT",
    supply: 4444,
    launchYear: 2022,
    description: "4,444 smaller-format punk NFTs by the Crashpunks team on Stacks.",
  },
  {
    name: "Bitcoin Deer",
    url: "https://gamma.io/collections/bitcoin-deer",
    type: "collection",
    creator: "Bitcoin Deer Team",
    xHandle: "@BitcoinDeerNFT",
    xUrl: "https://x.com/BitcoinDeerNFT",
    supply: 2100,
    launchYear: 2022,
    description: "2,100 deer-themed NFTs on Stacks — supply chosen as homage to Bitcoin's 21 million cap.",
  },
  {
    name: "StacksCity Genesis",
    url: "https://gamma.io/collections/stackscity-genesis",
    type: "collection",
    creator: "StacksCity Team",
    xHandle: "@StacksCityNFT",
    xUrl: "https://x.com/StacksCityNFT",
    supply: 500,
    launchYear: 2022,
    description: "500 genesis NFTs for the StacksCity metaverse project built on Stacks.",
  },
  {
    name: "Mega NFT",
    url: "https://gamma.io/collections/mega-nft",
    type: "collection",
    creator: "Megapont Team",
    xHandle: "@megapontNFT",
    xUrl: "https://x.com/megapontNFT",
    description: "Special edition NFT collection by the Megapont team on Stacks.",
  },
  {
    name: "Stacks Cats",
    url: "https://gamma.io/collections/stacks-cats",
    type: "collection",
    creator: "Stacks Cats Team",
    xHandle: "@StacksCatsNFT",
    xUrl: "https://x.com/StacksCatsNFT",
    supply: 3000,
    launchYear: 2022,
    description: "3,000 cat-themed NFTs on Stacks.",
  },
  {
    name: "Stacks Aliens",
    url: "https://gamma.io/collections/stacks-aliens",
    type: "collection",
    creator: "Stacks Aliens Team",
    xHandle: "@StacksAliensNFT",
    xUrl: "https://x.com/StacksAliensNFT",
    supply: 1500,
    launchYear: 2022,
    description: "1,500 alien-themed NFTs on Stacks.",
  },
  {
    name: "Bitcoin Penguins",
    url: "https://gamma.io/collections/bitcoin-penguins",
    type: "collection",
    creator: "Bitcoin Penguins Team",
    xHandle: "@BTCPenguinsNFT",
    xUrl: "https://x.com/BTCPenguinsNFT",
    supply: 2100,
    launchYear: 2022,
    description: "2,100 penguin-themed NFTs on Stacks, supply matching the 21M Bitcoin cap.",
  },
  {
    name: "Nakamoto Punks",
    url: "https://gamma.io/collections/nakamoto-punks",
    type: "collection",
    creator: "Nakamoto Punks Team",
    xHandle: "@NakamotoPunks",
    xUrl: "https://x.com/NakamotoPunks",
    supply: 2140,
    launchYear: 2023,
    description: "2,140 punk NFTs on Stacks themed around Satoshi Nakamoto, minted during the Nakamoto Upgrade era.",
  },
  {
    name: "Stacks Legends",
    url: "https://gamma.io/collections/stacks-legends",
    type: "collection",
    creator: "Stacks Legends Team",
    xHandle: "@StacksLegendsNFT",
    xUrl: "https://x.com/StacksLegendsNFT",
    supply: 888,
    launchYear: 2023,
    description: "888 legendary character NFTs on Stacks with game utility.",
  },
  {
    name: "sBTC NFT Collection",
    url: "https://gamma.io/collections/sbtc-nft",
    type: "collection",
    creator: "Stacks Foundation",
    xHandle: "@stacks",
    xUrl: "https://x.com/stacks",
    description: "NFT collection commemorating the sBTC launch — the 1:1 Bitcoin-backed asset on Stacks enabling decentralized Bitcoin DeFi.",
    launchYear: 2024,
    deepPages: ["https://stacks.org/sbtc"],
  },
  {
    name: "Proof of Work NFT",
    url: "https://gamma.io/collections/proof-of-work-nft",
    type: "collection",
    creator: "PoW NFT Team",
    xHandle: "@ProofOfWorkNFT",
    xUrl: "https://x.com/ProofOfWorkNFT",
    supply: 1024,
    launchYear: 2022,
    description: "1,024 NFTs celebrating Bitcoin's Proof of Work consensus mechanism, minted on Stacks.",
  },
  {
    name: "Stacks Robots",
    url: "https://gamma.io/collections/stacks-robots",
    type: "collection",
    creator: "Stacks Robots Team",
    xHandle: "@StacksRobotsNFT",
    xUrl: "https://x.com/StacksRobotsNFT",
    supply: 5000,
    launchYear: 2022,
    description: "5,000 robot-themed NFTs on Stacks.",
  },
  {
    name: "Charisma NFT",
    url: "https://gamma.io/collections/charisma-nft",
    type: "collection",
    creator: "Charisma Protocol Team",
    xHandle: "@CharismaToken",
    xUrl: "https://x.com/CharismaToken",
    website: "https://charisma.rocks",
    description: "NFTs from Charisma — a DeFi protocol on Stacks combining liquidity provision with on-chain gaming and NFT mechanics. Charisma NFTs may provide in-game utility and yield.",
    deepPages: ["https://charisma.rocks", "https://docs.charisma.rocks"],
  },
  {
    name: "ALEX NFT",
    url: "https://gamma.io/collections/alex-nft",
    type: "collection",
    creator: "ALEX Lab",
    xHandle: "@ALEXLabFinance",
    xUrl: "https://x.com/ALEXLabFinance",
    website: "https://alexlab.co",
    description: "NFTs from ALEX Lab — the leading AMM DEX and DeFi protocol on Stacks. ALEX NFTs are tied to the broader ALEX DeFi ecosystem on Bitcoin L2.",
    deepPages: ["https://alexlab.co", "https://docs.alexlab.co"],
  },
];

async function scrapeUrl(url: string, firecrawlKey: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const markdown: string = data?.data?.markdown ?? data?.markdown ?? "";
    if (!markdown || markdown.trim().length < 60) return null;
    return markdown.slice(0, 7000).trim();
  } catch {
    return null;
  }
}

function buildContent(page: NFTPage, scrapedMarkdown: string, deepContent: string): string {
  if (page.type === "collection") {
    const metaLines = [
      `**Marketplace:** [Gamma.io](https://gamma.io) — Stacks NFT Marketplace`,
      `**Collection URL:** ${page.url}`,
      page.creator ? `**Creator / Team:** ${page.creator}` : null,
      page.xHandle ? `**X (Twitter):** [${page.xHandle}](${page.xUrl ?? `https://x.com/${page.xHandle.replace("@", "")}`})` : null,
      page.website ? `**Website:** ${page.website}` : null,
      page.discord ? `**Discord:** ${page.discord}` : null,
      page.contractAddress ? `**Clarity Contract:** \`${page.contractAddress}\`` : null,
      page.supply ? `**Total Supply:** ${page.supply.toLocaleString()} NFTs` : null,
      page.launchYear ? `**Launch Year:** ${page.launchYear}` : null,
      `**Blockchain:** Stacks (Bitcoin L2)`,
      `**NFT Standard:** SIP-009 Non-Fungible Token Trait`,
      `**Smart Contract Language:** Clarity`,
      `**Topic:** nft`,
    ].filter(Boolean);

    return `## Stacks NFT Collection: ${page.name}

${metaLines.join("\n")}

### About This Collection
${page.description ?? ""}

### Live Data from Gamma.io
${scrapedMarkdown}
${deepContent ? `\n### Additional Context\n${deepContent}` : ""}

### Stacks NFT Technical Context
- Implements the **SIP-009 Non-Fungible Token trait** in Clarity smart contracts
- Ownership is cryptographically secured by Bitcoin via **Proof of Transfer (PoX)**
- **Post-conditions** protect buyers: wallets like Xverse and Leather enforce that the exact NFT specified is transferred — preventing rug pulls
- Contract address format: \`SP...<deployer>.<contract-name>\`
- Compatible with **Xverse**, **Leather**, and **Asigna** wallets for viewing and transferring
- Tradeable on **Gamma.io**, **Tradeport**, and **Boom.money**
- The **Nakamoto Upgrade** (2024) enables ~5-second Stacks block times, making NFT minting and trading dramatically faster
- **sBTC** integration enables future Bitcoin-native NFT settlement without wrapping
`;
  }

  if (page.type === "ecosystem") {
    return `## Stacks NFT Ecosystem: ${page.name}

**Source:** ${page.url}
**Topic:** nft
**Category:** nft
**Blockchain:** Stacks (Bitcoin L2)

${scrapedMarkdown}
${deepContent ? `\n### Additional Context\n${deepContent}` : ""}
`;
  }

  return `## ${page.name}

**Source:** ${page.url}
**Topic:** nft
**Category:** nft

${scrapedMarkdown}
`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ error: "FIRECRAWL_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let batchIndex = 0;
    let forceUpdate = false;
    try {
      const body = await req.json();
      if (typeof body?.batchIndex === "number") batchIndex = body.batchIndex;
      if (typeof body?.forceUpdate === "boolean") forceUpdate = body.forceUpdate;
    } catch (_) { /* no body */ }

    const BATCH_SIZE = 4; // smaller batch since deepPages add extra requests
    const totalBatches = Math.ceil(ALL_PAGES.length / BATCH_SIZE);
    const batch = ALL_PAGES.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE);

    await supabase.from("profiles").upsert(
      { user_id: SYSTEM_USER_ID, username: "smentor-system", display_name: "SMentor System" },
      { onConflict: "user_id", ignoreDuplicates: true }
    );

    const results: { name: string; status: string; chars?: number }[] = [];
    let inserted = 0, updated = 0, skipped = 0, failed = 0;

    for (const page of batch) {
      const { data: existing } = await supabase
        .from("knowledge_base")
        .select("id")
        .eq("link_url", page.url)
        .maybeSingle();

      if (existing && !forceUpdate) {
        skipped++;
        results.push({ name: page.name, status: "skipped (exists)" });
        continue;
      }

      console.log(`Scraping: ${page.name}`);
      await new Promise((r) => setTimeout(r, 400));

      const primaryMarkdown = await scrapeUrl(page.url, firecrawlKey);

      // Scrape deep pages for richer content
      let deepContent = "";
      if (page.deepPages && page.deepPages.length > 0) {
        for (const deepUrl of page.deepPages) {
          await new Promise((r) => setTimeout(r, 400));
          const deepMd = await scrapeUrl(deepUrl, firecrawlKey);
          if (deepMd) {
            deepContent += `\n\n---\n**Source:** ${deepUrl}\n\n${deepMd.slice(0, 2500)}`;
          }
        }
      }

      const scrapeContent = primaryMarkdown ?? "_Live data unavailable — collection exists on Gamma.io Stacks NFT marketplace._";
      const content = buildContent(page, scrapeContent, deepContent);

      if (existing && forceUpdate) {
        const { error } = await supabase
          .from("knowledge_base")
          .update({ content, link_url: page.url, approved: true, upvotes: 15 })
          .eq("id", existing.id);

        if (error) { failed++; results.push({ name: page.name, status: `db error: ${error.message}` }); }
        else { updated++; results.push({ name: page.name, status: "updated", chars: content.length }); }
      } else {
        const { error } = await supabase.from("knowledge_base").insert({
          user_id: SYSTEM_USER_ID,
          topic: "nft",
          category: "nft",
          content,
          link_url: page.url,
          approved: true,
          upvotes: 15,
        });

        if (error) { failed++; results.push({ name: page.name, status: `db error: ${error.message}` }); }
        else { inserted++; results.push({ name: page.name, status: "inserted", chars: content.length }); }
      }
    }

    return new Response(
      JSON.stringify({
        batchIndex,
        totalBatches,
        totalPages: ALL_PAGES.length,
        batchSize: batch.length,
        inserted, updated, skipped, failed,
        results,
        nextBatch: batchIndex + 1 < totalBatches ? batchIndex + 1 : null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("ingest-gamma-nfts error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
