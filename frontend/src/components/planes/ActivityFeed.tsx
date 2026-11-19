import React from 'react';
import { motion } from 'motion/react';
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';
import type { InventoryMovement } from '../../types/stocknova';
import { useLanguage } from '../../context/LanguageContext';

interface ActivityFeedProps {
  movements: InventoryMovement[];
  maxItems?: number;
}

export function ActivityFeed({ movements, maxItems = 6 }: ActivityFeedProps) {
  const { locale, t } = useLanguage();
  const list = movements.slice(0, maxItems);

  const formatTime = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <div className="divide-y divide-[rgba(170,184,204,0.1)]">
      {list.map((mov, idx) => {
        const isIn = mov.type === 'ENTRADA';
        const isOut = mov.type === 'SALIDA';
        return (
          <motion.div
            key={mov.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
            className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3 min-w-0">
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                  isIn
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : isOut
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                    : 'border-[#00D9FF]/30 bg-[#00D9FF]/10 text-[#00D9FF]'
                }`}
              >
                {isIn ? (
                  <ArrowDownLeft className="w-4 h-4" />
                ) : isOut ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#EAF4FF] truncate">
                  {mov.productName}
                </p>
                <p className="text-xs text-[#AAB8CC] truncate mt-0.5">
                  {t(mov.type === 'ENTRADA' ? 'Entrada' : mov.type === 'SALIDA' ? 'Salida' : 'Ajuste')}
                </p>
                <p className="text-xs text-[#AAB8CC]/75 mt-0.5 font-mono-tabular truncate">
                  {t('Usuario')} #{mov.userId} · {mov.previousStock} → {mov.newStock} u.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span
                className={`text-xs font-semibold font-mono-tabular ${
                  isIn ? 'text-emerald-400' : isOut ? 'text-amber-400' : 'text-[#00D9FF]'
                }`}
              >
                {isIn ? `+${mov.quantity}` : isOut ? `-${mov.quantity}` : `=${mov.quantity}`}
              </span>
              <div className="text-[11px] text-[#AAB8CC]/70 font-mono-tabular mt-0.5">
                {formatTime(mov.createdAt)}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
