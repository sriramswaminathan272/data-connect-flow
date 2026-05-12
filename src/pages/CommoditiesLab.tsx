
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  GitCompare,
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  BarChart2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Instrument Definitions ───────────────────────────────────────────────────

interface Instrument {
  symbol: string;
  name: string;
  exchange: string;
  lotSize: number;
  lotUnit: string;
  tickSize: number;
  basePrice: number;
  dailyVolatility: number; // % per day
  currency: string;
  priceUnit: string;
}

const INSTRUMENTS: Instrument[] = [
  {
    symbol: "GOLD",
    name: "Gold",
    exchange: "MCX",
    lotSize: 100,
    lotUnit: "10g units",
    tickSize: 1,
    basePrice: 74000,
    dailyVolatility: 0.6,
    currency: "₹",
    priceUnit: "/10g",
  },
  {
    symbol: "SILVER",
    name: "Silver",
    exchange: "MCX",
    lotSize: 30,
    lotUnit: "kg",
    tickSize: 1,
    basePrice: 89500,
    dailyVolatility: 1.2,
    currency: "₹",
    priceUnit: "/kg",
  },
  {
    symbol: "CRUDEOIL",
    name: "Crude Oil",
    exchange: "MCX",
    lotSize: 100,
    lotUnit: "barrels",
    tickSize: 1,
    basePrice: 6800,
    dailyVolatility: 1.8,
    currency: "₹",
    priceUnit: "/bbl",
  },
  {
    symbol: "NATURALGAS",
    name: "Natural Gas",
    exchange: "MCX",
    lotSize: 1250,
    lotUnit: "mmBtu",
    tickSize: 0.1,
    basePrice: 185,
    dailyVolatility: 2.5,
    currency: "₹",
    priceUnit: "/mmBtu",
  },
  {
    symbol: "COPPER",
    name: "Copper",
    exchange: "MCX",
    lotSize: 2500,
    lotUnit: "kg",
    tickSize: 0.05,
    basePrice: 755,
    dailyVolatility: 1.0,
    currency: "₹",
    priceUnit: "/kg",
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface LivePrice {
  symbol: string;
  ltp: number;
  bid: number;
  ask: number;
  open: number;
  high: number;
  low: number;
  change: number;
  changePct: number;
  volume: number;
  timestamp: number;
}

interface ShadowPosition {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL";
  lots: number;
  entryPrice: number;
  entryTime: number;
  orderType: "MARKET" | "LIMIT";
  status: "OPEN" | "CLOSED";
  exitPrice?: number;
  exitTime?: number;
  realizedPnl?: number;
}

interface ActualTrade {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL";
  lots: number;
  fillPrice: number;
  fillTime: number;
  broker: string;
  linkedShadowId?: string;
}

interface DeviationRecord {
  shadowId: string;
  actualId: string;
  symbol: string;
  shadowFill: number;
  actualFill: number;
  rawDeviation: number;   // shadow - actual
  pctDeviation: number;   // %
  type: "EXECUTION" | "CALCULATION";
}

// ─── Price Feed Hook ──────────────────────────────────────────────────────────

const SECONDS_PER_TRADING_DAY = 6.5 * 3600;

function usePriceFeed(feedMode: "SIMULATED" | "LIVE"): Record<string, LivePrice> {
  const [prices, setPrices] = useState<Record<string, LivePrice>>(() => {
    const init: Record<string, LivePrice> = {};
    INSTRUMENTS.forEach((inst) => {
      const spread = inst.basePrice * 0.0002;
      init[inst.symbol] = {
        symbol: inst.symbol,
        ltp: inst.basePrice,
        bid: inst.basePrice - spread / 2,
        ask: inst.basePrice + spread / 2,
        open: inst.basePrice,
        high: inst.basePrice,
        low: inst.basePrice,
        change: 0,
        changePct: 0,
        volume: 0,
        timestamp: Date.now(),
      };
    });
    return init;
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (feedMode !== "SIMULATED") return;

    intervalRef.current = setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        INSTRUMENTS.forEach((inst) => {
          const old = prev[inst.symbol];
          // Per-second volatility from daily volatility
          const perSecondVol = (inst.dailyVolatility / 100) / Math.sqrt(SECONDS_PER_TRADING_DAY);
          const ret = (Math.random() - 0.5) * 2 * perSecondVol * 3; // ×3 for visible movement
          const newLtp = Math.round((old.ltp * (1 + ret)) / inst.tickSize) * inst.tickSize;
          const spread = newLtp * 0.0002;
          const newHigh = Math.max(old.high, newLtp);
          const newLow = Math.min(old.low, newLtp);
          const change = newLtp - old.open;
          next[inst.symbol] = {
            ...old,
            ltp: newLtp,
            bid: Math.round((newLtp - spread / 2) / inst.tickSize) * inst.tickSize,
            ask: Math.round((newLtp + spread / 2) / inst.tickSize) * inst.tickSize,
            high: newHigh,
            low: newLow,
            change,
            changePct: (change / old.open) * 100,
            volume: old.volume + Math.floor(Math.random() * 5),
            timestamp: Date.now(),
          };
        });
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [feedMode]);

  return prices;
}

// ─── P&L Helpers ─────────────────────────────────────────────────────────────

function calcUnrealizedPnl(pos: ShadowPosition, ltp: number, inst: Instrument): number {
  const dir = pos.direction === "BUY" ? 1 : -1;
  return dir * (ltp - pos.entryPrice) * pos.lots * inst.lotSize;
}

function calcContractValue(price: number, inst: Instrument, lots: number): number {
  return price * inst.lotSize * lots;
}

function fmtINR(n: number): string {
  const abs = Math.abs(n);
  let str: string;
  if (abs >= 10000000) str = `₹${(n / 10000000).toFixed(2)}Cr`;
  else if (abs >= 100000) str = `₹${(n / 100000).toFixed(2)}L`;
  else if (abs >= 1000) str = `₹${(n / 1000).toFixed(1)}K`;
  else str = `₹${n.toFixed(0)}`;
  return str;
}

function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(3)}%`;
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

interface PriceRowProps {
  inst: Instrument;
  price: LivePrice;
  onSelect: (symbol: string) => void;
  selected: boolean;
}

const PriceRow: React.FC<PriceRowProps> = ({ inst, price, onSelect, selected }) => {
  const up = price.change >= 0;
  return (
    <tr
      onClick={() => onSelect(inst.symbol)}
      className={cn(
        "cursor-pointer border-b border-slate-100 hover:bg-slate-50 transition-colors",
        selected && "bg-blue-50 hover:bg-blue-50"
      )}
    >
      <td className="px-4 py-3">
        <div className="font-semibold text-slate-900 text-sm">{inst.name}</div>
        <div className="text-xs text-slate-400">{inst.exchange} · {inst.symbol}</div>
      </td>
      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
        {inst.currency}{price.ltp.toLocaleString("en-IN")}
        <span className="text-xs text-slate-400 font-normal">{inst.priceUnit}</span>
      </td>
      <td className={cn("px-4 py-3 text-right text-sm font-mono", up ? "text-green-600" : "text-red-600")}>
        {up ? "+" : ""}{price.change.toFixed(1)} ({fmtPct(price.changePct)})
      </td>
      <td className="px-4 py-3 text-right font-mono text-xs text-slate-500">
        {inst.currency}{price.bid.toLocaleString("en-IN")} / {inst.currency}{price.ask.toLocaleString("en-IN")}
      </td>
      <td className="px-4 py-3 text-right text-xs text-slate-500">{price.volume.toLocaleString()}</td>
      <td className="px-4 py-3">
        {up
          ? <TrendingUp size={14} className="text-green-500 ml-auto" />
          : <TrendingDown size={14} className="text-red-500 ml-auto" />}
      </td>
    </tr>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const CommoditiesLab: React.FC = () => {
  const [feedMode] = useState<"SIMULATED" | "LIVE">("SIMULATED");
  const prices = usePriceFeed(feedMode);

  // Shadow positions — persisted in localStorage
  const [shadowPositions, setShadowPositions] = useState<ShadowPosition[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("shadow_positions") || "[]");
    } catch {
      return [];
    }
  });

  // Actual trades — persisted in localStorage
  const [actualTrades, setActualTrades] = useState<ActualTrade[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("actual_trades") || "[]");
    } catch {
      return [];
    }
  });

  // Persist on change
  useEffect(() => {
    localStorage.setItem("shadow_positions", JSON.stringify(shadowPositions));
  }, [shadowPositions]);

  useEffect(() => {
    localStorage.setItem("actual_trades", JSON.stringify(actualTrades));
  }, [actualTrades]);

  // Shadow order form
  const [selectedSymbol, setSelectedSymbol] = useState("GOLD");
  const [shadowDirection, setShadowDirection] = useState<"BUY" | "SELL">("BUY");
  const [shadowLots, setShadowLots] = useState(1);
  const [shadowOrderType, setShadowOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [shadowLimitPrice, setShadowLimitPrice] = useState("");

  // Actual trade form
  const [actSymbol, setActSymbol] = useState("GOLD");
  const [actDirection, setActDirection] = useState<"BUY" | "SELL">("BUY");
  const [actLots, setActLots] = useState(1);
  const [actFillPrice, setActFillPrice] = useState("");
  const [actBroker, setActBroker] = useState("Angel One");
  const [actLinkedShadow, setActLinkedShadow] = useState("");

  const getInst = useCallback(
    (symbol: string) => INSTRUMENTS.find((i) => i.symbol === symbol)!,
    []
  );

  // Place shadow order
  const placeShadowOrder = () => {
    const inst = getInst(selectedSymbol);
    const ltp = prices[selectedSymbol]?.ltp ?? inst.basePrice;
    const fillPrice = shadowOrderType === "MARKET"
      ? (shadowDirection === "BUY" ? prices[selectedSymbol]?.ask : prices[selectedSymbol]?.bid) ?? ltp
      : parseFloat(shadowLimitPrice) || ltp;

    const pos: ShadowPosition = {
      id: `SH-${Date.now()}`,
      symbol: selectedSymbol,
      direction: shadowDirection,
      lots: shadowLots,
      entryPrice: fillPrice,
      entryTime: Date.now(),
      orderType: shadowOrderType,
      status: "OPEN",
    };
    setShadowPositions((prev) => [pos, ...prev]);
  };

  // Close shadow position
  const closeShadowPosition = (id: string) => {
    setShadowPositions((prev) =>
      prev.map((p) => {
        if (p.id !== id || p.status === "CLOSED") return p;
        const inst = getInst(p.symbol);
        const ltp = prices[p.symbol]?.ltp ?? p.entryPrice;
        const exitPrice = p.direction === "BUY"
          ? prices[p.symbol]?.bid ?? ltp
          : prices[p.symbol]?.ask ?? ltp;
        const realizedPnl = calcUnrealizedPnl({ ...p, entryPrice: p.entryPrice }, exitPrice, inst);
        return { ...p, status: "CLOSED", exitPrice, exitTime: Date.now(), realizedPnl };
      })
    );
  };

  // Log actual trade
  const logActualTrade = () => {
    if (!actFillPrice) return;
    const trade: ActualTrade = {
      id: `ACT-${Date.now()}`,
      symbol: actSymbol,
      direction: actDirection,
      lots: actLots,
      fillPrice: parseFloat(actFillPrice),
      fillTime: Date.now(),
      broker: actBroker,
      linkedShadowId: actLinkedShadow || undefined,
    };
    setActualTrades((prev) => [trade, ...prev]);
    setActFillPrice("");
    setActLinkedShadow("");
  };

  // Calculate deviations
  const deviations: DeviationRecord[] = actualTrades
    .filter((a) => a.linkedShadowId)
    .map((actual) => {
      const shadow = shadowPositions.find((s) => s.id === actual.linkedShadowId);
      if (!shadow) return null;
      const rawDev = shadow.entryPrice - actual.fillPrice;
      const pctDev = (rawDev / actual.fillPrice) * 100;
      return {
        shadowId: shadow.id,
        actualId: actual.id,
        symbol: actual.symbol,
        shadowFill: shadow.entryPrice,
        actualFill: actual.fillPrice,
        rawDeviation: rawDev,
        pctDeviation: pctDev,
        type: "EXECUTION" as const,
      };
    })
    .filter(Boolean) as DeviationRecord[];

  const avgPctDeviation = deviations.length > 0
    ? deviations.reduce((sum, d) => sum + Math.abs(d.pctDeviation), 0) / deviations.length
    : 0;

  const openPositions = shadowPositions.filter((p) => p.status === "OPEN");
  const closedPositions = shadowPositions.filter((p) => p.status === "CLOSED");
  const totalRealizedPnl = closedPositions.reduce((sum, p) => sum + (p.realizedPnl ?? 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <FlaskConical size={22} className="text-teal-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Commodities Lab</h1>
              <p className="text-slate-500 text-sm">Shadow trading · Actual trade log · Deviation analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 text-xs",
                feedMode === "SIMULATED"
                  ? "border-amber-300 text-amber-700 bg-amber-50"
                  : "border-green-300 text-green-700 bg-green-50"
              )}
            >
              {feedMode === "SIMULATED" ? <WifiOff size={10} /> : <Wifi size={10} />}
              {feedMode === "SIMULATED" ? "Simulated Feed" : "Live Feed"}
            </Badge>
          </div>
        </div>

        {/* Summary strip */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          {[
            { label: "Open Positions", value: openPositions.length, color: "text-blue-700" },
            {
              label: "Unrealized P&L",
              value: fmtINR(
                openPositions.reduce((sum, p) => {
                  const inst = getInst(p.symbol);
                  const ltp = prices[p.symbol]?.ltp ?? p.entryPrice;
                  return sum + calcUnrealizedPnl(p, ltp, inst);
                }, 0)
              ),
              color: openPositions.reduce((sum, p) => {
                const inst = getInst(p.symbol);
                const ltp = prices[p.symbol]?.ltp ?? p.entryPrice;
                return sum + calcUnrealizedPnl(p, ltp, inst);
              }, 0) >= 0 ? "text-green-600" : "text-red-600",
            },
            { label: "Realized P&L", value: fmtINR(totalRealizedPnl), color: totalRealizedPnl >= 0 ? "text-green-600" : "text-red-600" },
            {
              label: "Avg Execution Deviation",
              value: deviations.length > 0 ? `${avgPctDeviation.toFixed(3)}%` : "—",
              color: avgPctDeviation < 0.05 ? "text-green-600" : avgPctDeviation < 0.2 ? "text-amber-600" : "text-red-600",
            },
          ].map((item) => (
            <Card key={item.label} className="border-slate-200">
              <CardContent className="pt-3 pb-3">
                <div className="text-xs text-slate-500">{item.label}</div>
                <div className={cn("text-xl font-bold mt-1", item.color)}>{item.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="feed">
        <TabsList className="mb-5">
          <TabsTrigger value="feed" className="gap-1.5">
            <Activity size={13} /> Live Feed
          </TabsTrigger>
          <TabsTrigger value="shadow" className="gap-1.5">
            <FlaskConical size={13} /> Shadow Trades
          </TabsTrigger>
          <TabsTrigger value="actual" className="gap-1.5">
            <BarChart2 size={13} /> Actual Trades
          </TabsTrigger>
          <TabsTrigger value="deviation" className="gap-1.5">
            <GitCompare size={13} /> Deviation
          </TabsTrigger>
        </TabsList>

        {/* ── LIVE FEED TAB ── */}
        <TabsContent value="feed">
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600 font-medium flex items-center gap-2">
                <Activity size={14} className="text-teal-600" />
                MCX Commodities — Simulated Live Prices
                <span className="text-xs font-normal text-slate-400 ml-2">
                  (Prices update every second with realistic volatility. Connect your broker WebSocket to switch to live.)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Instrument</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">LTP</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Change</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Bid / Ask</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Volume (lots)</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {INSTRUMENTS.map((inst) => (
                    <PriceRow
                      key={inst.symbol}
                      inst={inst}
                      price={prices[inst.symbol]}
                      onSelect={setSelectedSymbol}
                      selected={selectedSymbol === inst.symbol}
                    />
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Selected instrument detail */}
          {selectedSymbol && prices[selectedSymbol] && (() => {
            const inst = getInst(selectedSymbol);
            const price = prices[selectedSymbol];
            return (
              <Card className="mt-4 border-blue-200 bg-blue-50">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="text-xs text-blue-600 font-medium">{inst.name} — Contract Details</div>
                      <div className="text-2xl font-bold text-slate-900 mt-1">
                        ₹{price.ltp.toLocaleString("en-IN")}<span className="text-sm font-normal text-slate-500">{inst.priceUnit}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-6 text-center">
                      {[
                        { label: "Lot size", value: `${inst.lotSize} ${inst.lotUnit}` },
                        { label: "Tick size", value: `₹${inst.tickSize}` },
                        { label: "Contract value (1 lot)", value: fmtINR(calcContractValue(price.ltp, inst, 1)) },
                        { label: "Approx margin (5%)", value: fmtINR(calcContractValue(price.ltp, inst, 1) * 0.05) },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="text-xs text-slate-500">{item.label}</div>
                          <div className="font-semibold text-slate-800 text-sm">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </TabsContent>

        {/* ── SHADOW TRADES TAB ── */}
        <TabsContent value="shadow">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Order form */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Plus size={14} className="text-teal-600" />
                  Place Shadow Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Instrument */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Instrument</label>
                  <select
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 bg-white"
                  >
                    {INSTRUMENTS.map((i) => (
                      <option key={i.symbol} value={i.symbol}>{i.name} ({i.exchange})</option>
                    ))}
                  </select>
                </div>

                {/* Live price */}
                {prices[selectedSymbol] && (
                  <div className="bg-slate-50 rounded-md px-3 py-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Live LTP</span>
                    <span className="font-mono font-semibold text-slate-900 text-sm">
                      ₹{prices[selectedSymbol].ltp.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {/* Buy / Sell */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setShadowDirection("BUY")}
                    variant={shadowDirection === "BUY" ? "default" : "outline"}
                    className={shadowDirection === "BUY" ? "bg-green-600 hover:bg-green-700" : "border-green-300 text-green-700"}
                    size="sm"
                  >
                    <Plus size={12} className="mr-1" /> BUY
                  </Button>
                  <Button
                    onClick={() => setShadowDirection("SELL")}
                    variant={shadowDirection === "SELL" ? "default" : "outline"}
                    className={shadowDirection === "SELL" ? "bg-red-600 hover:bg-red-700" : "border-red-300 text-red-700"}
                    size="sm"
                  >
                    <Minus size={12} className="mr-1" /> SELL
                  </Button>
                </div>

                {/* Lots */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    Lots &nbsp;·&nbsp;
                    <span className="text-slate-400">
                      1 lot = {getInst(selectedSymbol).lotSize} {getInst(selectedSymbol).lotUnit}
                    </span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={shadowLots}
                    onChange={(e) => setShadowLots(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-sm"
                  />
                </div>

                {/* Order type */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Order type</label>
                  <select
                    value={shadowOrderType}
                    onChange={(e) => setShadowOrderType(e.target.value as "MARKET" | "LIMIT")}
                    className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 bg-white"
                  >
                    <option value="MARKET">Market — fill at current bid/ask</option>
                    <option value="LIMIT">Limit — fill at specific price</option>
                  </select>
                </div>

                {shadowOrderType === "LIMIT" && (
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Limit price (₹)</label>
                    <Input
                      type="number"
                      value={shadowLimitPrice}
                      onChange={(e) => setShadowLimitPrice(e.target.value)}
                      placeholder={`e.g. ${prices[selectedSymbol]?.ltp ?? ""}`}
                      className="text-sm"
                    />
                  </div>
                )}

                {/* Summary */}
                {prices[selectedSymbol] && (
                  <div className="bg-teal-50 border border-teal-100 rounded-md px-3 py-2 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Contract value</span>
                      <span className="font-semibold">{fmtINR(calcContractValue(prices[selectedSymbol].ltp, getInst(selectedSymbol), shadowLots))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Approx margin (5%)</span>
                      <span className="font-semibold">{fmtINR(calcContractValue(prices[selectedSymbol].ltp, getInst(selectedSymbol), shadowLots) * 0.05)}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={placeShadowOrder}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  size="sm"
                >
                  Place Shadow Order
                </Button>

                <p className="text-xs text-slate-400 text-center">
                  Shadow orders do not touch real money. Fill price = live bid/ask at moment of click.
                </p>
              </CardContent>
            </Card>

            {/* Open positions */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Open Shadow Positions ({openPositions.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {openPositions.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">No open positions. Place a shadow order on the left.</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <th className="px-3 py-2 text-left text-xs text-slate-500">ID</th>
                          <th className="px-3 py-2 text-left text-xs text-slate-500">Instrument</th>
                          <th className="px-3 py-2 text-left text-xs text-slate-500">Dir</th>
                          <th className="px-3 py-2 text-right text-xs text-slate-500">Lots</th>
                          <th className="px-3 py-2 text-right text-xs text-slate-500">Entry</th>
                          <th className="px-3 py-2 text-right text-xs text-slate-500">LTP</th>
                          <th className="px-3 py-2 text-right text-xs text-slate-500">Unreal P&L</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {openPositions.map((pos) => {
                          const inst = getInst(pos.symbol);
                          const ltp = prices[pos.symbol]?.ltp ?? pos.entryPrice;
                          const pnl = calcUnrealizedPnl(pos, ltp, inst);
                          return (
                            <tr key={pos.id} className="border-b border-slate-50 hover:bg-slate-50">
                              <td className="px-3 py-2 text-xs text-slate-400 font-mono">{pos.id.slice(-6)}</td>
                              <td className="px-3 py-2 font-medium text-slate-800">{pos.symbol}</td>
                              <td className="px-3 py-2">
                                <Badge
                                  variant="outline"
                                  className={pos.direction === "BUY"
                                    ? "border-green-300 text-green-700 text-xs"
                                    : "border-red-300 text-red-700 text-xs"}
                                >
                                  {pos.direction}
                                </Badge>
                              </td>
                              <td className="px-3 py-2 text-right font-mono">{pos.lots}</td>
                              <td className="px-3 py-2 text-right font-mono text-slate-600">₹{pos.entryPrice.toLocaleString("en-IN")}</td>
                              <td className="px-3 py-2 text-right font-mono text-slate-900">₹{ltp.toLocaleString("en-IN")}</td>
                              <td className={cn("px-3 py-2 text-right font-mono font-semibold", pnl >= 0 ? "text-green-600" : "text-red-600")}>
                                {fmtINR(pnl)}
                              </td>
                              <td className="px-3 py-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-6 px-2"
                                  onClick={() => closeShadowPosition(pos.id)}
                                >
                                  Close
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              {/* Closed positions */}
              {closedPositions.length > 0 && (
                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Closed Positions — Realized P&L</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <th className="px-3 py-2 text-left text-xs text-slate-500">ID</th>
                          <th className="px-3 py-2 text-left text-xs text-slate-500">Instrument</th>
                          <th className="px-3 py-2 text-left text-xs text-slate-500">Dir</th>
                          <th className="px-3 py-2 text-right text-xs text-slate-500">Entry</th>
                          <th className="px-3 py-2 text-right text-xs text-slate-500">Exit</th>
                          <th className="px-3 py-2 text-right text-xs text-slate-500">Realized P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {closedPositions.map((pos) => (
                          <tr key={pos.id} className="border-b border-slate-50">
                            <td className="px-3 py-2 text-xs text-slate-400 font-mono">{pos.id.slice(-6)}</td>
                            <td className="px-3 py-2 font-medium text-slate-800">{pos.symbol}</td>
                            <td className="px-3 py-2">
                              <Badge variant="outline" className={pos.direction === "BUY" ? "border-green-300 text-green-700 text-xs" : "border-red-300 text-red-700 text-xs"}>
                                {pos.direction}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600">₹{pos.entryPrice.toLocaleString("en-IN")}</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600">₹{pos.exitPrice?.toLocaleString("en-IN") ?? "—"}</td>
                            <td className={cn("px-3 py-2 text-right font-mono font-semibold", (pos.realizedPnl ?? 0) >= 0 ? "text-green-600" : "text-red-600")}>
                              {fmtINR(pos.realizedPnl ?? 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── ACTUAL TRADES TAB ── */}
        <TabsContent value="actual">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Log form */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Plus size={14} className="text-blue-600" />
                  Log Actual Trade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Instrument</label>
                  <select
                    value={actSymbol}
                    onChange={(e) => setActSymbol(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 bg-white"
                  >
                    {INSTRUMENTS.map((i) => (
                      <option key={i.symbol} value={i.symbol}>{i.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setActDirection("BUY")}
                    variant={actDirection === "BUY" ? "default" : "outline"}
                    className={actDirection === "BUY" ? "bg-green-600 hover:bg-green-700" : "border-green-300 text-green-700"}
                    size="sm"
                  >BUY</Button>
                  <Button
                    onClick={() => setActDirection("SELL")}
                    variant={actDirection === "SELL" ? "default" : "outline"}
                    className={actDirection === "SELL" ? "bg-red-600 hover:bg-red-700" : "border-red-300 text-red-700"}
                    size="sm"
                  >SELL</Button>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Lots</label>
                  <Input type="number" min={1} value={actLots} onChange={(e) => setActLots(Math.max(1, parseInt(e.target.value) || 1))} className="text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Actual fill price from broker (₹)</label>
                  <Input type="number" value={actFillPrice} onChange={(e) => setActFillPrice(e.target.value)} placeholder="e.g. 74023" className="text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Broker</label>
                  <Input value={actBroker} onChange={(e) => setActBroker(e.target.value)} placeholder="Angel One, Zerodha..." className="text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Link to shadow trade ID (for deviation tracking)</label>
                  <select
                    value={actLinkedShadow}
                    onChange={(e) => setActLinkedShadow(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 bg-white"
                  >
                    <option value="">— Not linked —</option>
                    {shadowPositions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id.slice(-6)} · {p.symbol} {p.direction} @₹{p.entryPrice.toLocaleString("en-IN")}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={logActualTrade} disabled={!actFillPrice} className="w-full" size="sm">
                  Log Trade
                </Button>
                <p className="text-xs text-slate-400 text-center">
                  Link to a shadow trade to enable deviation analysis.
                </p>
              </CardContent>
            </Card>

            {/* Actual trade list */}
            <div className="lg:col-span-2">
              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Actual Trade Log ({actualTrades.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {actualTrades.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">No actual trades logged yet. Enter your Angel One / Zerodha fills on the left.</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <th className="px-3 py-2 text-left text-xs text-slate-500">ID</th>
                          <th className="px-3 py-2 text-left text-xs text-slate-500">Instrument</th>
                          <th className="px-3 py-2 text-left text-xs text-slate-500">Dir</th>
                          <th className="px-3 py-2 text-right text-xs text-slate-500">Lots</th>
                          <th className="px-3 py-2 text-right text-xs text-slate-500">Fill Price</th>
                          <th className="px-3 py-2 text-left text-xs text-slate-500">Broker</th>
                          <th className="px-3 py-2 text-left text-xs text-slate-500">Linked Shadow</th>
                        </tr>
                      </thead>
                      <tbody>
                        {actualTrades.map((trade) => (
                          <tr key={trade.id} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="px-3 py-2 text-xs text-slate-400 font-mono">{trade.id.slice(-6)}</td>
                            <td className="px-3 py-2 font-medium text-slate-800">{trade.symbol}</td>
                            <td className="px-3 py-2">
                              <Badge variant="outline" className={trade.direction === "BUY" ? "border-green-300 text-green-700 text-xs" : "border-red-300 text-red-700 text-xs"}>
                                {trade.direction}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-right font-mono">{trade.lots}</td>
                            <td className="px-3 py-2 text-right font-mono font-semibold">₹{trade.fillPrice.toLocaleString("en-IN")}</td>
                            <td className="px-3 py-2 text-xs text-slate-500">{trade.broker}</td>
                            <td className="px-3 py-2 text-xs text-slate-400 font-mono">
                              {trade.linkedShadowId ? trade.linkedShadowId.slice(-6) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── DEVIATION TAB ── */}
        <TabsContent value="deviation">
          <div className="space-y-5">
            {/* Explanation */}
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4 pb-4">
                <div className="flex gap-3">
                  <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 space-y-1">
                    <p><strong>Two types of deviation — track them separately:</strong></p>
                    <p>
                      <strong>Execution deviation</strong> (shown here): Shadow fill price vs your actual fill on Angel One/Zerodha.
                      This measures feed latency and market order slippage. Expected to be non-zero.
                      Use limit orders in both systems to reduce this noise.
                    </p>
                    <p>
                      <strong>Calculation deviation</strong> (MTM, margin): Compare your shadow MTM/margin math
                      vs broker's daily statement. MCX publishes one settlement price for everyone — so MTM
                      deviation should be near zero. If it's not, your formula has a bug.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quality score */}
            {deviations.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                <Card className="border-slate-200">
                  <CardContent className="pt-4">
                    <div className="text-xs text-slate-500">Trades compared</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{deviations.length}</div>
                  </CardContent>
                </Card>
                <Card className="border-slate-200">
                  <CardContent className="pt-4">
                    <div className="text-xs text-slate-500">Avg execution deviation</div>
                    <div className={cn("text-2xl font-bold mt-1", avgPctDeviation < 0.05 ? "text-green-600" : avgPctDeviation < 0.2 ? "text-amber-600" : "text-red-600")}>
                      {avgPctDeviation.toFixed(3)}%
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {avgPctDeviation < 0.05 ? "Excellent — feed is fast" :
                       avgPctDeviation < 0.2 ? "Acceptable — check feed latency" :
                       "High — investigate feed delay"}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-slate-200">
                  <CardContent className="pt-4">
                    <div className="text-xs text-slate-500">Within 0.05% threshold</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">
                      {deviations.filter((d) => Math.abs(d.pctDeviation) < 0.05).length}/{deviations.length}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Deviation table */}
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GitCompare size={14} className="text-blue-600" /> Execution Deviation — Shadow vs Actual
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {deviations.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    No linked trade pairs yet. Place a shadow order, then log an actual trade and link it to the shadow ID.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-4 py-2 text-left text-xs text-slate-500">Instrument</th>
                        <th className="px-4 py-2 text-right text-xs text-slate-500">Shadow Fill</th>
                        <th className="px-4 py-2 text-right text-xs text-slate-500">Actual Fill</th>
                        <th className="px-4 py-2 text-right text-xs text-slate-500">Deviation (₹)</th>
                        <th className="px-4 py-2 text-right text-xs text-slate-500">Deviation (%)</th>
                        <th className="px-4 py-2 text-center text-xs text-slate-500">Quality</th>
                        <th className="px-4 py-2 text-left text-xs text-slate-500">Interpretation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deviations.map((d) => {
                        const absPct = Math.abs(d.pctDeviation);
                        const quality = absPct < 0.05 ? "good" : absPct < 0.2 ? "warn" : "bad";
                        return (
                          <tr key={d.shadowId} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-800">{d.symbol}</td>
                            <td className="px-4 py-3 text-right font-mono">₹{d.shadowFill.toLocaleString("en-IN")}</td>
                            <td className="px-4 py-3 text-right font-mono">₹{d.actualFill.toLocaleString("en-IN")}</td>
                            <td className={cn("px-4 py-3 text-right font-mono", d.rawDeviation >= 0 ? "text-amber-600" : "text-blue-600")}>
                              {d.rawDeviation >= 0 ? "+" : ""}{d.rawDeviation.toFixed(1)}
                            </td>
                            <td className={cn("px-4 py-3 text-right font-mono font-semibold", quality === "good" ? "text-green-600" : quality === "warn" ? "text-amber-600" : "text-red-600")}>
                              {fmtPct(d.pctDeviation)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {quality === "good"
                                ? <CheckCircle2 size={14} className="text-green-500 mx-auto" />
                                : quality === "warn"
                                ? <AlertTriangle size={14} className="text-amber-500 mx-auto" />
                                : <AlertTriangle size={14} className="text-red-500 mx-auto" />}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500">
                              {quality === "good" ? "Feed latency is good" :
                               quality === "warn" ? "Mild feed delay — use limit orders" :
                               "High delay — check WebSocket connection speed"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            {/* Next step guidance */}
            <Card className="border-teal-200 bg-teal-50">
              <CardContent className="pt-4 pb-4">
                <div className="flex gap-3">
                  <CheckCircle2 size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-teal-800 space-y-1">
                    <p><strong>Next: Add MTM calculation deviation tracking</strong></p>
                    <p>
                      Download your broker's daily statement (Angel One sends a PDF/CSV every evening).
                      Extract the MTM credit/debit for each commodity position.
                      Compare that number against what this shadow system calculates using the same settlement price.
                      That delta = your math quality score. Target: &lt; ₹1 difference per lot.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommoditiesLab;
