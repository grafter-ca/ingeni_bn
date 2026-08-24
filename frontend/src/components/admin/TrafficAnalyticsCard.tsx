// src/components/admin/TrafficAnalyticsCard.tsx
import React, { useEffect, useState } from 'react';
import { MessageCircle, Phone, TrendingUp, Loader2, BarChart3 } from 'lucide-react';
import { fetchVendorTrafficStats } from '../../services/admin-analytics.service';
import type { TrafficStat } from '../../types/admin';

interface TrafficAnalyticsCardProps {
  vendorId: string;
  vendorName?: string;
}

export const TrafficAnalyticsCard: React.FC<TrafficAnalyticsCardProps> = ({ vendorId, vendorName }) => {
  const [stats, setStats] = useState<TrafficStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        setLoading(true);
        const data = await fetchVendorTrafficStats(vendorId);
        if (isMounted) setStats(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error loading stats');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, [vendorId]);

  const whatsappCount = stats.find((s) => s.actionType === 'whatsapp')?._count.id || 0;
  const callCount = stats.find((s) => s.actionType === 'call')?._count.id || 0;
  const totalClicks = whatsappCount + callCount;

  // Calculate percentages for the visual ratio bar
  const whatsappPercent = totalClicks > 0 ? (whatsappCount / totalClicks) * 100 : 50;
  const callPercent = totalClicks > 0 ? (callCount / totalClicks) * 100 : 50;

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/5 rounded-2xl p-6 flex items-center justify-center h-48 shadow-sm">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-red-500/20 rounded-2xl p-6 text-red-500 text-xs font-mono">
        Failed to load traffic analytics: {error}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Traffic & Conversion
          </h4>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5">
            {vendorName ? `${vendorName} Engagement` : 'Store Interactions'}
          </h3>
        </div>
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <BarChart3 size={16} />
        </div>
      </div>

      {/* Total Metric Overview */}
      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#121212] border border-zinc-100 dark:border-white/5 flex items-baseline justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-mono text-zinc-400 block">Total Interactions</span>
          <span className="text-xs text-zinc-600 dark:text-zinc-300">Customer clicks across products</span>
        </div>
        <span className="text-xl font-mono font-bold text-zinc-900 dark:text-white">{totalClicks}</span>
      </div>

      {/* Visual Proportion Bar (Graph representation) */}
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-mono text-zinc-500">
          <span className="flex items-center gap-1 text-emerald-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> WhatsApp ({Math.round(whatsappPercent)}%)
          </span>
          <span className="flex items-center gap-1 text-blue-500">
            Calls ({Math.round(callPercent)}%) <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </span>
        </div>
        <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
          <div 
            className="bg-emerald-500 transition-all duration-500" 
            style={{ width: `${whatsappPercent}%` }}
          />
          <div 
            className="bg-blue-500 transition-all duration-500" 
            style={{ width: `${callPercent}%` }}
          />
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MessageCircle size={16} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-emerald-600 dark:text-emerald-400 block">WhatsApp</span>
            <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white">{whatsappCount} clicks</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Phone size={16} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-blue-600 dark:text-blue-400 block">Calls</span>
            <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white">{callCount} clicks</span>
          </div>
        </div>
      </div>
    </div>
  );
};