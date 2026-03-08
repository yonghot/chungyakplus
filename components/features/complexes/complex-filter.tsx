'use client';

import { MapPin, SlidersHorizontal } from 'lucide-react';
import { Select, SelectOption } from '@/components/ui/select';
import { REGIONS } from '@/constants/regions';

interface ComplexFilterProps {
  region?: string;
  status?: string;
  onFilterChange: (filters: { region?: string; status?: string }) => void;
}

const STATUS_OPTIONS = [
  { value: '', label: '전체 상태' },
  { value: 'upcoming', label: '접수예정' },
  { value: 'open', label: '접수중' },
  { value: 'closed', label: '접수마감' },
] as const;

export function ComplexFilter({
  region = '',
  status = '',
  onFilterChange,
}: ComplexFilterProps) {
  return (
    <div className="rounded-xl bg-muted/30 px-4 py-4">
      <div className="mb-3 flex items-center gap-1.5">
        <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">필터</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Select
            value={region}
            onChange={(e) =>
              onFilterChange({
                region: e.target.value || undefined,
                status: status || undefined,
              })
            }
            className="pl-8"
            aria-label="시/도 선택"
          >
            <SelectOption value="">전체 지역</SelectOption>
            {REGIONS.map((r) => (
              <SelectOption key={r.code} value={r.name}>
                {r.name}
              </SelectOption>
            ))}
          </Select>
        </div>

        <div className="flex-1 sm:max-w-xs">
          <Select
            value={status}
            onChange={(e) =>
              onFilterChange({
                region: region || undefined,
                status: e.target.value || undefined,
              })
            }
            aria-label="접수 상태 선택"
          >
            {STATUS_OPTIONS.map((opt) => (
              <SelectOption key={opt.value} value={opt.value}>
                {opt.label}
              </SelectOption>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
