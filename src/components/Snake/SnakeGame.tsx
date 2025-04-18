'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { FC } from 'react';
import styled from 'styled-components';
import type { TerminalTheme } from '../../styles/Terminal.styles';
import { themeColors } from '../../styles/Terminal.styles';

// Define snake game styles
const GameContainer = styled.div<{ $theme?: TerminalTheme }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const GameBoard = styled.canvas<{ $theme?: TerminalTheme }>`
  border: 1px solid ${props => 
    props.$theme === 'amber' ? themeColors.amber.text : 
    props.$theme === 'blue' ? themeColors.blue.text :
    themeColors.green.text};
  background-color: #000;
`;

const GameHeader = styled.h1<{ $theme?: TerminalTheme }>`
  color: ${props => 
    props.$theme === 'amber' ? themeColors.amber.text : 
    props.$theme === 'blue' ? themeColors.blue.text :
    themeColors.green.text};
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-family: 'Courier New', monospace;
`;

const GameScore = styled.div<{ $theme?: TerminalTheme }>`
  color: ${props => 
    props.$theme === 'amber' ? themeColors.amber.text : 
    props.$theme === 'blue' ? themeColors.blue.text :
    themeColors.green.text};
  font-size: 1rem;
  margin-top: 1rem;
  font-family: 'Courier New', monospace;
`;

const GameOver = styled.div<{ $theme?: TerminalTheme }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: ${props => 
    props.$theme === 'amber' ? themeColors.amber.text : 
    props.$theme === 'blue' ? themeColors.blue.text :
    themeColors.green.text};
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  font-family: 'Courier New', monospace;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 2rem;
  border-radius: 5px;
`;

interface SnakeGameProps {
  onClose: () => void;
  theme?: TerminalTheme;
}

const SnakeGame: FC<SnakeGameProps> = ({ onClose, theme = 'green' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  
  // Game constants
  const CELL_SIZE = 20;
  const GRID_WIDTH = 30;
  const GRID_HEIGHT = 20;
  const INITIAL_SNAKE = [{ x: 3, y: 10 }, { x: 2, y: 10 }, { x: 1, y: 10 }];
  const INITIAL_DIRECTION = 'right';
  const GAME_SPEED = 100; // ms between moves
  
  // Game state
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 10 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [nextDirection, setNextDirection] = useState(INITIAL_DIRECTION);
  const [gameRunning, setGameRunning] = useState(true);
  
  // Get theme color
  const getThemeColor = useCallback(() => {
    return theme === 'amber' ? themeColors.amber.text : 
           theme === 'blue' ? themeColors.blue.text :
           themeColors.green.text;
  }, [theme]);
  
  // Generate random food position
  const generateFood = useCallback(() => {
    const x = Math.floor(Math.random() * GRID_WIDTH);
    const y = Math.floor(Math.random() * GRID_HEIGHT);
    
    // Make sure food doesn't spawn on snake
    for (const segment of snake) {
      if (segment.x === x && segment.y === y) {
        return generateFood();
      }
    }
    
    return { x, y };
  }, [snake]);
  
  // Check for collisions
  const checkCollisions = useCallback(() => {
    const head = snake[0];
    
    // Check wall collisions
    if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
      return true;
    }
    
    // Check self collisions (skip the head)
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        return true;
      }
    }
    
    return false;
  }, [snake]);
  
  // Move the snake
  const moveSnake = useCallback(() => {
    if (!gameRunning || isGameOver) return;
    
    // Update direction from nextDirection
    setDirection(nextDirection);
    
    const newSnake = [...snake];
    const head = { ...newSnake[0] };
    
    // Move head based on direction
    switch (nextDirection) {
      case 'up':
        head.y -= 1;
        break;
      case 'down':
        head.y += 1;
        break;
      case 'left':
        head.x -= 1;
        break;
      case 'right':
        head.x += 1;
        break;
    }
    
    // Add new head
    newSnake.unshift(head);
    
    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
      // Generate new food
      setFood(generateFood());
      // Increase score
      setScore(prevScore => prevScore + 10);
    } else {
      // Remove tail if no food eaten
      newSnake.pop();
    }
    
    // Update snake
    setSnake(newSnake);
    
    // Check for collisions
    if (checkCollisions()) {
      setIsGameOver(true);
      setGameRunning(false);
    }
  }, [snake, nextDirection, food, gameRunning, isGameOver, generateFood, checkCollisions]);
  
  // Game loop
  useEffect(() => {
    if (!gameRunning || isGameOver) return;
    
    const gameInterval = setInterval(() => {
      moveSnake();
    }, GAME_SPEED);
    
    return () => clearInterval(gameInterval);
  }, [gameRunning, isGameOver, moveSnake]);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC key to close game
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      // If game over, restart on any key
      if (isGameOver) {
        setSnake(INITIAL_SNAKE);
        setDirection(INITIAL_DIRECTION);
        setNextDirection(INITIAL_DIRECTION);
        setFood(generateFood());
        setScore(0);
        setIsGameOver(false);
        setGameRunning(true);
        return;
      }
      
      // Prevent reverse direction (can't go opposite of current direction)
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'down') setNextDirection('up');
          break;
        case 'ArrowDown':
          if (direction !== 'up') setNextDirection('down');
          break;
        case 'ArrowLeft':
          if (direction !== 'right') setNextDirection('left');
          break;
        case 'ArrowRight':
          if (direction !== 'left') setNextDirection('right');
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isGameOver, onClose, generateFood]);
  
  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set colors based on theme
    const themeColor = getThemeColor();
    
    // Draw snake
    ctx.fillStyle = themeColor;
    for (const segment of snake) {
      ctx.fillRect(
        segment.x * CELL_SIZE, 
        segment.y * CELL_SIZE, 
        CELL_SIZE - 1, 
        CELL_SIZE - 1
      );
    }
    
    // Draw food
    ctx.fillStyle = themeColor;
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 1,
      0,
      2 * Math.PI
    );
    ctx.fill();
    
  }, [snake, food, getThemeColor]);
  
  return (
    <GameContainer $theme={theme}>
      <GameHeader $theme={theme}>SNAKE</GameHeader>
      <GameBoard 
        ref={canvasRef} 
        width={GRID_WIDTH * CELL_SIZE} 
        height={GRID_HEIGHT * CELL_SIZE}
        $theme={theme}
      />
      <GameScore $theme={theme}>Score: {score}</GameScore>
      
      {isGameOver && (
        <GameOver $theme={theme}>
          <div>GAME OVER</div>
          <div style={{ fontSize: '1rem', marginTop: '1rem' }}>Press any key to restart</div>
          <div style={{ fontSize: '1rem', marginTop: '0.5rem' }}>Press ESC to exit</div>
        </GameOver>
      )}
    </GameContainer>
  );
};

export default SnakeGame; 