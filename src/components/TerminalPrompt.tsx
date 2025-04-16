import { useState, useCallback, useMemo, memo } from 'react';
import type { ChangeEvent, KeyboardEvent, FC } from 'react';
import { TerminalInputContainer, TerminalInput, TerminalCursor, EnterKey } from '../styles/Terminal.styles';

interface TerminalPromptProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  showEnterIcon: boolean;
  isSubmitting: boolean;
  mobileKeyboard: boolean;
  onContainerClick: () => void;
}

const TerminalPrompt: FC<TerminalPromptProps> = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
  showEnterIcon,
  isSubmitting,
  mobileKeyboard,
  onContainerClick,
}) => {
  const [focused, setFocused] = useState<boolean>(false);
  
  // Memoize cursor visibility status based on focus state
  const cursorVisible = useMemo(() => !isSubmitting && (focused || value.length === 0), [
    isSubmitting,
    focused,
    value.length
  ]);
  
  // Memoize disabled state
  const isDisabled = useMemo(() => isSubmitting, [isSubmitting]);
  
  // Handle container click with useCallback to prevent recreation
  const handleContainerClick = useCallback(() => {
    onContainerClick();
  }, [onContainerClick]);
  
  // Handle focus change with useCallback
  const handleFocus = useCallback(() => {
    setFocused(true);
  }, []);
  
  const handleBlur = useCallback(() => {
    setFocused(false);
  }, []);
  
  // Memoize the enter key indicator appearance
  const enterKeyIndicator = useMemo(() => {
    if (showEnterIcon && !isSubmitting && value.length > 0) {
      return <EnterKey>⏎</EnterKey>;
    }
    return null;
  }, [showEnterIcon, isSubmitting, value.length]);

  return (
    <TerminalInputContainer onClick={handleContainerClick} $showCursor={cursorVisible}>
      <TerminalInput
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={isDisabled}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck="false"
        $mobileKeyboard={mobileKeyboard}
      />
      {cursorVisible && <TerminalCursor />}
      {enterKeyIndicator}
    </TerminalInputContainer>
  );
};

export default memo(TerminalPrompt); 