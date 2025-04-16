import { memo, useMemo, useRef, useCallback, useEffect } from 'react';
import type { UIEvent, MouseEvent } from 'react';
import type { ChatMessage } from '../api/grok';
import { MessagesContainer, Message, MessagePrefix } from '../styles/Terminal.styles';
import styled from 'styled-components';
import { parseMarkdown, parseMessageContent } from '../lib/markdown';

// Add styled components for code containers
const CodeContainer = styled.div`
  position: relative;
  background-color: rgba(0, 0, 0, 0.6);
  border: 1px solid #444;
  border-radius: 4px;
  padding: 1rem;
  margin: 0.5rem 0;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
`;

const CodeBlock = styled.pre<{ $personaColor?: string }>`
  margin: 0;
  padding: 0;
  color: ${props => props.$personaColor || '#66FF66'};
`;

const CopyButton = styled.button<{ $personaColor?: string }>`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: ${props => props.$personaColor ? `${props.$personaColor}20` : 'rgba(102, 255, 102, 0.2)'};
  color: ${props => props.$personaColor || '#66FF66'};
  border: 1px solid ${props => props.$personaColor || '#66FF66'};
  border-radius: 3px;
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

// Styled component for markdown content with clickable links
const MarkdownContent = styled.span<{ $personaColor?: string }>`
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  
  a {
    color: ${props => props.$personaColor || '#66FF66'};
    text-decoration: underline;
    cursor: pointer;
    transition: opacity 0.2s;
    display: inline;
    white-space: pre-wrap;
    
    &:hover {
      opacity: 0.8;
    }
  }
`;

// Define local interface that allows for potentially undefined content
interface SafeMessage extends Omit<ChatMessage, 'content'> {
  content: string | undefined;
}

interface MessageItemProps {
  message: SafeMessage;
  index: number;
  personaColor?: string;
  currentPersonaId?: string;
}

// Code block component with copy functionality
const CodeBlockComponent = memo(({ content, personaColor }: { content: string; personaColor?: string }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content.trim())
      .then(() => {
        // Could add a visual feedback here
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <CodeContainer>
      <CodeBlock $personaColor={personaColor}>{content.trim()}</CodeBlock>
      <CopyButton $personaColor={personaColor} onClick={handleCopy}>Copy</CopyButton>
    </CodeContainer>
  );
});

CodeBlockComponent.displayName = 'CodeBlockComponent';

// Memoized individual message component
const MessageItem = memo(({ message, index, personaColor, currentPersonaId }: MessageItemProps) => {
  const isUser = message.role === 'user';
  // Convert content to string directly
  const messageContent = typeof message.content === 'string' ? message.content : '';
  const contentParts = parseMessageContent(messageContent);
  
  // Determine assistant prefix based on persona
  const assistantPrefix = currentPersonaId === 'cortana' ? 'CORTANA>' : 'nytemode>';
  
  return (
    <Message 
      key={`message-${message.timestamp}-${index}`}
      data-is-user={isUser}
      className={isUser ? 'user-message' : 'assistant-message'}
    >
      <MessagePrefix 
        data-is-user={isUser}
        className={isUser ? 'user-prefix' : 'assistant-prefix'}
        $personaColor={!isUser ? personaColor : undefined}
      >
        {isUser ? 'USER>' : assistantPrefix}
      </MessagePrefix>
      
      {contentParts.map((part, i) => (
        part.type === 'text' ? 
          <MarkdownContent 
            key={`text-${message.timestamp}-${i}`}
            $personaColor={!isUser ? personaColor : undefined}
            dangerouslySetInnerHTML={{ __html: parseMarkdown(part.content) }} 
          /> : 
          <CodeBlockComponent 
            key={`code-${message.timestamp}-${i}`} 
            content={part.content} 
            personaColor={!isUser ? personaColor : undefined}
          />
      ))}
    </Message>
  );
});

MessageItem.displayName = 'MessageItem';

// Loading indicator component
const LoadingIndicator = memo(({ loadingDots, personaColor, currentPersonaId }: { 
  loadingDots: string; 
  personaColor?: string;
  currentPersonaId?: string;
}) => (
  <Message data-is-user={false} className="assistant-message">
    <MessagePrefix 
      data-is-user={false} 
      className="assistant-prefix"
      $personaColor={personaColor}
    >
      {currentPersonaId === 'cortana' ? 'CORTANA>' : 'nytemode>'}
    </MessagePrefix>
    {loadingDots}
  </Message>
));

LoadingIndicator.displayName = 'LoadingIndicator';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  loadingDots: string;
  isUserScrolling: boolean;
  setIsUserScrolling: (isScrolling: boolean) => void;
  onContainerClick: (e: MouseEvent<HTMLDivElement>) => void;
  personaColor?: string;
  currentPersonaId?: string;
}

const MessageList = ({
  messages,
  isLoading,
  loadingDots,
  isUserScrolling,
  setIsUserScrolling,
  onContainerClick,
  personaColor,
  currentPersonaId
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Memoize the messages list for better performance
  const messagesList = useMemo(() => 
    messages.map((message, index) => (
      <MessageItem 
        key={`message-${message.timestamp}-${index}`}
        message={message as SafeMessage}
        index={index}
        personaColor={personaColor}
        currentPersonaId={currentPersonaId}
      />
    )),
    [messages, personaColor, currentPersonaId]
  );
  
  // Detect when user is scrolling manually
  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    
    if (!isAtBottom && !isUserScrolling) {
      setIsUserScrolling(true);
    } else if (isAtBottom && isUserScrolling) {
      setIsUserScrolling(false);
    }
  }, [isUserScrolling, setIsUserScrolling]);
  
  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  
  // Scroll to bottom when messages change, but only if user isn't manually scrolling
  useEffect(() => {
    if (!isUserScrolling && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isUserScrolling, scrollToBottom]);
  
  return (
    <MessagesContainer 
      onClick={onContainerClick}
      onScroll={handleScroll}
      className="scrollable"
      data-scrollable="true"
    >
      {messagesList}
      {isLoading && <LoadingIndicator 
        loadingDots={loadingDots} 
        personaColor={personaColor} 
        currentPersonaId={currentPersonaId} 
      />}
      <div ref={messagesEndRef} />
    </MessagesContainer>
  );
};

export default memo(MessageList); 