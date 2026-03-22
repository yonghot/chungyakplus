'use client';

import { ZoomIn, ZoomOut, LocateFixed } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
}

export function MapControls({ onZoomIn, onZoomOut, onLocate }: MapControlsProps) {
  return (
    <div className="absolute bottom-6 right-4 z-10 flex flex-col gap-1.5">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-lg bg-white shadow-md"
        onClick={onZoomIn}
        aria-label="줌 인"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-lg bg-white shadow-md"
        onClick={onZoomOut}
        aria-label="줌 아웃"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <div className="my-0.5" />
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-lg bg-white shadow-md"
        onClick={onLocate}
        aria-label="내 위치"
      >
        <LocateFixed className="h-4 w-4" />
      </Button>
    </div>
  );
}
