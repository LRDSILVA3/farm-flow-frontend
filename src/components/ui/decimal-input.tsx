import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

export interface DecimalInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number | string | null | undefined;
  onValueChange: (numValue: number | null, normalizedText: string) => void;
  decimals?: number;
  fixedDecimals?: boolean;
  emptyOnZero?: boolean;
}

const parseExternal = (val: number | string | null | undefined): number | null => {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return Number.isFinite(val) ? val : null;
  const parsed = parseFloat(String(val).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

const formatDisplay = (
  val: number | string | null | undefined,
  decimals: number,
  fixedDecimals: boolean,
  emptyOnZero: boolean
): string => {
  const num = parseExternal(val);
  if (num === null) return '';
  if (emptyOnZero && num === 0) return '';
  if (fixedDecimals) {
    return num.toFixed(decimals).replace('.', ',');
  }
  return Number(num.toFixed(decimals)).toString().replace('.', ',');
};

export const DecimalInput = React.forwardRef<HTMLInputElement, DecimalInputProps>(
  (
    {
      value,
      onValueChange,
      decimals = 2,
      fixedDecimals = false,
      emptyOnZero = false,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const isFocusedRef = useRef(false);
    const [text, setText] = useState<string>(() =>
      formatDisplay(value, decimals, fixedDecimals, emptyOnZero)
    );

    useEffect(() => {
      if (isFocusedRef.current) return;
      const extNum = parseExternal(value);
      const curNum = parseExternal(text);
      if (extNum === null && text === '') return;
      if (extNum !== null && curNum !== null && Math.abs(extNum - curNum) < 1e-9) {
        return;
      }
      setText(formatDisplay(value, decimals, fixedDecimals, emptyOnZero));
    }, [value, decimals, fixedDecimals, emptyOnZero]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Permite apenas dígitos e um único separador decimal (vírgula ou ponto)
      const cleaned = raw.replace(/[^0-9.,]/g, '');
      const match = cleaned.match(/^(\d*)([.,](\d*))?/);
      const sanitized = match ? `${match[1] || ''}${match[2] || ''}` : '';

      setText(sanitized);

      if (sanitized === '' || sanitized === '.' || sanitized === ',') {
        onValueChange(null, '');
        return;
      }

      const normalized = sanitized.replace(',', '.');
      const parsed = parseFloat(normalized);
      if (Number.isFinite(parsed)) {
        onValueChange(parsed, normalized);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = true;
      e.target.select();
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = false;
      const curNum = parseExternal(text);
      if (curNum === null || (emptyOnZero && curNum === 0)) {
        setText('');
      } else {
        setText(formatDisplay(curNum, decimals, fixedDecimals, emptyOnZero));
      }
      onBlur?.(e);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={text}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    );
  }
);

DecimalInput.displayName = 'DecimalInput';
