import { memo, useMemo, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import type { KeyboardEvent, ChangeEvent } from 'react';
import { InputContainer, Prompt, Input } from '../styles/Terminal.styles';
import type { TerminalTheme } from '../styles/Terminal.styles';

interface TerminalInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  isLoading: boolean;
  isMobile: boolean;
  isSmallScreen: boolean;
  enterKeyStyle: React.CSSProperties;
  theme: TerminalTheme;
}

export interface TerminalInputRef {
  focus: () => void;
}

const TerminalInput = forwardRef<TerminalInputRef, TerminalInputProps>(({
  value,
  onChange,
  onKeyDown,
  placeholder,
  isLoading,
  isMobile,
  isSmallScreen,
  enterKeyStyle,
  theme
}, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Expose focus method to parent components
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    }
  }));
  
  // Memoize the enter key visibility
  const showEnterKey = useMemo(() => 
    value.length > 0 && !isLoading && !isSmallScreen, 
    [value.length, isLoading, isSmallScreen]
  );
  
  // Memoize the input state to prevent unnecessary re-renders
  const inputProps = useMemo(() => ({
    type: "text",
    value: value,
    placeholder: placeholder,
    disabled: isLoading,
    autoFocus: true,
    autoComplete: "off",
    autoCapitalize: "off",
    spellCheck: "false",
    // Set font size to at least 16px to prevent iOS zoom
    style: { fontSize: isMobile ? '16px' : 'inherit' }
  }), [value, placeholder, isLoading, isMobile]);
  
  // Memoize the enter key indicator
  const enterKeyIndicator = useMemo(() => {
    if (showEnterKey) {
      return <span style={enterKeyStyle}>[ENTER]</span>;
    }
    return null;
  }, [showEnterKey, enterKeyStyle]);
  
  // Focus method exposed for parent components
  const focus = useCallback(() => {
    inputRef.current?.focus();
  }, []);
  
  return (
    <InputContainer $theme={theme}>
      <Prompt $theme={theme}>{'>'}</Prompt>
      <Input
        ref={inputRef}
        {...inputProps}
        onChange={onChange}
        onKeyDown={onKeyDown}
        $theme={theme}
      />
      {enterKeyIndicator}
    </InputContainer>
  );
});

TerminalInput.displayName = 'TerminalInput';

export default memo(TerminalInput); 