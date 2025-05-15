'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { ToggleGroup, Tooltip as TooltipPrimitive } from 'radix-ui';
import { Laptop, Moon, Sun } from 'lucide-react';
import './theme-switch.css';
import { Tooltip } from './tooltip';
import { motion } from 'motion/react';
import { useMedia } from 'react-use';

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false);
  const [switchStyles, setSwitchStyles] = useState(undefined);
  const { theme, setTheme } = useTheme();

  const isWide = useMedia('(min-width: 768px)');

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isWide) {
      setSwitchStyles({
        width: 'auto',
        height: 'auto',
        borderRadius: 0,
      });
    } else {
      console.log('NOT WIDE');
      setSwitchStyles(undefined);
    }
  }, [isWide]);

  if (!mounted) {
    return null;
  }

  return (
    <motion.div
      initial={
        isWide ? { width: 24, height: 24, borderRadius: 100 } : undefined
      }
      whileHover={switchStyles}
      whileFocus={switchStyles}
      className="switch-container"
      layout
    >
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
              className="ToggleGroupItem last"
              value="dark"
              aria-label="Dark"
            >
              <Moon size={16} />
            </ToggleGroup.Item>
          </Tooltip>
        </ToggleGroup.Root>
      </TooltipPrimitive.Provider>
      <motion.div className="switch-indicator">
        {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
      </motion.div>
    </motion.div>
  );
};

export default ThemeSwitch;
