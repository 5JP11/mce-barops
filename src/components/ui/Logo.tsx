import React from 'react';
import { Building2, Utensils, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex items-center justify-center w-12 h-12">
        {/* Cityscape and icons representation */}
        <div className="absolute inset-0 bg-gold-bright opacity-10 rounded-lg transform rotate-3" />
        <div className="relative flex flex-col items-center">
          <div className="flex gap-1 mb-0.5">
            <Utensils className="w-4 h-4 text-gold-bright" />
            <Music className="w-4 h-4 text-gold-bright" />
          </div>
          <Building2 className="w-6 h-6 text-foreground" />
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight leading-none text-foreground uppercase">
            MCE
          </span>
          <span className="text-[10px] font-medium tracking-[0.2em] text-gold-muted uppercase">
            Consultancy Corporation
          </span>
        </div>
      )}
    </div>
  );
}
