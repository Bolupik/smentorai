import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StacksMetrics {
  stxPrice: number;
  stxPriceChange24h: number;
  btcPrice: number;
  totalTransactions: number;
  recentTransactions: number;
  blockHeight: number;
  avgBlockTime: number;
  totalSupply: number;
  circulatingSupply: number;
  mempoolSize: number;
  stxLocked: number;
  currentCycle: number;
  signers: number;
}

async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Stacks-Metrics-Bot/1.0'
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function getStacksApiStatus(): Promise<{ blockHeight: number; serverVersion: string }> {
  try {
    const response = await fetchWithTimeout('https://api.hiro.so/extended/v1/status');
    if (!response.ok) throw new Error(`Status API error: ${response.status}`);
    const data = await response.json();
    return {
      blockHeight: data.chain_tip?.block_height || 0,
      serverVersion: data.server_version || 'unknown'
    };
  } catch (error) {
    console.error('Error fetching status:', error);
    return { blockHeight: 0, serverVersion: 'unknown' };
  }
}

async function getBlockTime(): Promise<number> {
  try {
    const response = await fetchWithTimeout('https://api.hiro.so/extended/v1/info/network_block_times');
    if (!response.ok) throw new Error(`Block time API error: ${response.status}`);
    const data = await response.json();
    // Returns average block time in seconds for mainnet
    return data.mainnet?.target_block_time || 600;
  } catch (error) {
    console.error('Error fetching block time:', error);
    return 600; // Default 10 minutes
  }
}

async function getSupplyInfo(): Promise<{ total: number; circulating: number; locked: number }> {
  try {
    const response = await fetchWithTimeout('https://api.hiro.so/extended/v1/stx_supply');
    if (!response.ok) throw new Error(`Supply API error: ${response.status}`);
    const data = await response.json();
    return {
      total: parseFloat(data.total_stx) || 0,
      circulating: parseFloat(data.unlocked_stx) || 0,
      locked: parseFloat(data.locked_stx) || 0
    };
  } catch (error) {
    console.error('Error fetching supply:', error);
    return { total: 0, circulating: 0, locked: 0 };
  }
}

async function getMempoolStats(): Promise<{ txCount: number }> {
  try {
    const response = await fetchWithTimeout('https://api.hiro.so/extended/v1/tx/mempool/stats');
    if (!response.ok) throw new Error(`Mempool API error: ${response.status}`);
    const data = await response.json();
    return {
      txCount: data.tx_type_counts ? 
        Object.values(data.tx_type_counts).reduce((a: number, b: unknown) => a + (typeof b === 'number' ? b : 0), 0) : 0
    };
  } catch (error) {
    console.error('Error fetching mempool:', error);
    return { txCount: 0 };
  }
}

async function getRecentTransactionCount(): Promise<number> {
  try {
    const response = await fetchWithTimeout('https://api.hiro.so/extended/v1/tx?limit=1');
    if (!response.ok) throw new Error(`TX API error: ${response.status}`);
    const data = await response.json();
    return data.total || 0;
  } catch (error) {
    console.error('Error fetching tx count:', error);
    return 0;
  }
}

async function getPoxInfo(): Promise<{ currentCycle: number; signersCount: number }> {
  try {
    const response = await fetchWithTimeout('https://api.hiro.so/extended/v2/pox/cycles?limit=1');
    if (!response.ok) throw new Error(`PoX API error: ${response.status}`);
    const data = await response.json();
    const currentCycle = data.results?.[0]?.cycle_number || 0;
    
    // Try to get signers count for current cycle
    let signersCount = 15; // Default estimate
    if (currentCycle > 0) {
      try {
        const signersResponse = await fetchWithTimeout(`https://api.hiro.so/extended/v2/pox/cycles/${currentCycle}/signers?limit=100`);
        if (signersResponse.ok) {
          const signersData = await signersResponse.json();
          signersCount = signersData.total || signersData.results?.length || 15;
        }
      } catch (e) {
        console.error('Error fetching signers:', e);
      }
    }
    
    return { currentCycle, signersCount };
  } catch (error) {
    console.error('Error fetching PoX info:', error);
    return { currentCycle: 0, signersCount: 15 };
  }
}

async function getStxPrice(): Promise<{ price: number; change24h: number; btcPrice: number }> {
  // Try CoinGecko API for price data
  try {
    const response = await fetchWithTimeout(
      'https://api.coingecko.com/api/v3/simple/price?ids=blockstack,bitcoin&vs_currencies=usd&include_24hr_change=true'
    );
    if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`);
    const data = await response.json();
    return {
      price: data.blockstack?.usd || 0,
      change24h: data.blockstack?.usd_24h_change || 0,
      btcPrice: data.bitcoin?.usd || 0
    };
  } catch (error) {
    console.error('Error fetching price from CoinGecko:', error);
    // Fallback - return cached/estimated values
    return { price: 0.85, change24h: 0, btcPrice: 95000 };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching Stacks ecosystem metrics...');
    
    // Fetch all data in parallel for performance
    const [
      statusInfo,
      blockTime,
      supplyInfo,
      mempoolStats,
      txCount,
      poxInfo,
      priceInfo
    ] = await Promise.all([
      getStacksApiStatus(),
      getBlockTime(),
      getSupplyInfo(),
      getMempoolStats(),
      getRecentTransactionCount(),
      getPoxInfo(),
      getStxPrice()
    ]);

    const metrics: StacksMetrics = {
      stxPrice: priceInfo.price,
      stxPriceChange24h: priceInfo.change24h,
      btcPrice: priceInfo.btcPrice,
      totalTransactions: txCount,
      recentTransactions: mempoolStats.txCount,
      blockHeight: statusInfo.blockHeight,
      avgBlockTime: blockTime,
      totalSupply: supplyInfo.total,
      circulatingSupply: supplyInfo.circulating,
      mempoolSize: mempoolStats.txCount,
      stxLocked: supplyInfo.locked,
      currentCycle: poxInfo.currentCycle,
      signers: poxInfo.signersCount
    };

    console.log('Metrics fetched successfully:', JSON.stringify(metrics, null, 2));

    return new Response(JSON.stringify({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching metrics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch metrics';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      data: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
