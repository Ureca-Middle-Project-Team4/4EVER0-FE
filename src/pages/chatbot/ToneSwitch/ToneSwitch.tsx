import React from 'react';
import { Switch } from '@/components/ui/switch';

interface ToneSwitchProps {
  isMunerTone: boolean;
  onToggle: (isMunerTone: boolean) => void;
  disabled?: boolean;
}

export const ToneSwitch: React.FC<ToneSwitchProps> = ({
  isMunerTone,
  onToggle,
  disabled = false,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <span className={`text-xs font-medium ${!isMunerTone ? 'text-gray-900' : 'text-gray-400'}`}>
        일반
      </span>
      <Switch
        checked={isMunerTone}
        onCheckedChange={onToggle}
        disabled={disabled}
        className="data-[state=checked]:bg-brand-yellow data-[state=unchecked]:bg-slate-200"
      />
      <span className={`text-xs font-medium ${isMunerTone ? 'text-gray-900' : 'text-gray-400'}`}>
        무너
      </span>
    </div>
  );
};
