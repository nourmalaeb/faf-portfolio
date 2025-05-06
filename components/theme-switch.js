import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { ToggleGroup, Tooltip as TooltipPrimitive } from 'radix-ui';
import { Laptop, Moon, Sun } from 'lucide-react';
import './theme-switch.css';
import { Tooltip } from './tooltip';

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <TooltipPrimitive.Provider delayDuration={0}>
      <ToggleGroup.Root
        className="ToggleGroup"
        type="single"
        defaultValue="system"
        value={theme}
        aria-label="Theme"
        onValueChange={value => {
          if (value) setTheme(value);
        }}
      >
        <Tooltip content={'System'}>
          <ToggleGroup.Item
            className="ToggleGroupItem"
            value="system"
            aria-label="System"
          >
            <Laptop size={16} />
          </ToggleGroup.Item>
        </Tooltip>
        <Tooltip content={'Light'}>
          <ToggleGroup.Item
            className="ToggleGroupItem"
            value="light"
            aria-label="Light"
          >
            <Sun size={16} />
          </ToggleGroup.Item>
        </Tooltip>
        <Tooltip content={'Dark'}>
          <ToggleGroup.Item
            className="ToggleGroupItem"
            value="dark"
            aria-label="Dark"
          >
            <Moon size={16} />
          </ToggleGroup.Item>
        </Tooltip>
      </ToggleGroup.Root>
    </TooltipPrimitive.Provider>
  );
};

export default ThemeSwitch;
