import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

type Asset = "stx" | "btc";

interface PricePoint { t: number; price: number }

interface HistoryPayload {
  points: PricePoint[];
  last: number;
  prevDayPrice: number;
  changePct: number;
  rangeChangePct: number;
}

const RANGES = [
  { label: "24H", days: 1 },
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

interface PriceChartDialogProps {
  asset: Asset | null;
  onOpenChange: (open: boolean) => void;
}

const PriceChartDialog = ({ asset, onOpenChange }: PriceChartDialogProps) => {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<HistoryPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (a: Asset, d: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data: res, error: err } = await supabase.functions.invoke(
        `price-history?asset=${a}&days=${d}`,
        { method: "GET" },
      );
      if (err) throw err;
      if (!res?.success) throw new Error(res?.error || "Failed to load price history");
      setData(res as HistoryPayload);
    } catch (e) {
      console.error("Price history error:", e);
      setError("Could not load the price chart right now.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (asset) load(asset, days);
  }, [asset, days, load]);

  const up = (data?.changePct ?? 0) >= 0;
  const stroke = up ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)";
  const name = asset === "btc" ? "Bitcoin (BTC)" : "Stacks (STX)";
  const decimals = asset === "btc" ? 0 : 4;

  const chartData = (data?.points || []).map((p) => ({
    t: p.t,
    price: p.price,
    label: new Date(p.t).toLocaleString(undefined, {
      month: "short", day: "numeric",
      ...(days <= 1 ? { hour: "numeric" as const } : {}),
    }),
  }));

  return (
    <Dialog open={!!asset} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[92dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {name}
            {data && (
              <Badge className={up
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-red-500/20 text-red-400 border-red-500/30"}>
                {up ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {up ? "+" : ""}{data.changePct.toFixed(2)}% vs yesterday
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {data && (
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold">
              ${data.last.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
            </span>
            <span className="text-xs text-muted-foreground">
              Prev. day ${data.prevDayPrice.toLocaleString(undefined, { maximumFractionDigits: decimals })}
            </span>
          </div>
        )}

        <div className="flex gap-1.5 flex-wrap">
          {RANGES.map((r) => (
            <Button key={r.days} size="sm"
              variant={days === r.days ? "default" : "outline"}
              className="h-7 px-3 text-xs"
              onClick={() => setDays(r.days)}>
              {r.label}
            </Button>
          ))}
        </div>

        <div className="h-56 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button size="sm" variant="outline" onClick={() => asset && load(asset, days)}>Retry</Button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} minTickGap={30}
                  stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} width={52}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v: number) => `$${v.toFixed(asset === "btc" ? 0 : 3)}`} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`$${v.toFixed(asset === "btc" ? 2 : 4)}`, "Price"]}
                />
                {data && (
                  <ReferenceLine y={data.prevDayPrice} stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="4 4"
                    label={{ value: "prev day", position: "insideTopRight", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                )}
                <Area type="monotone" dataKey="price" stroke={stroke} strokeWidth={2}
                  fill="url(#priceFill)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground">
          Line turns <span className="text-green-500 font-medium">green</span> when the price is above the previous
          day's level and <span className="text-red-500 font-medium">red</span> when it is below. Data from CoinGecko.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default PriceChartDialog;
