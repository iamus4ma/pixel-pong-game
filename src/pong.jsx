import React, { useEffect, useRef, useState } from 'react';

const COLOR = "#FFFFFF";
const HIT_COLOR = "#333333";
const BACKGROUND_COLOR = "#000000";
const BALL_COLOR = "#FFFFFF";
const PADDLE_COLOR = "#FFFFFF";
const LETTER_SPACING = 1;

const PIXEL_MAP = {
  B: [[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,1],[1,1,1,0]],
  C: [[0,1,1,1],[1,0,0,0],[1,0,0,0],[1,0,0,0],[0,1,1,1]],
  D: [[1,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,0]],
  E: [[1,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,1,1,1]],
  F: [[1,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,0,0,0]],
  G: [[0,1,1,1],[1,0,0,0],[1,0,1,1],[1,0,0,1],[0,1,1,1]],
  H: [[1,0,0,1],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  J: [[0,1,1,1],[0,0,1,0],[0,0,1,0],[1,0,1,0],[0,1,0,0]],
  K: [[1,0,0,1],[1,0,1,0],[1,1,0,0],[1,0,1,0],[1,0,0,1]],
  L: [[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,1,1,1]],
  N: [[1,0,0,1],[1,1,0,1],[1,0,1,1],[1,0,0,1],[1,0,0,1]],
  O: [[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  P: [[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,0],[1,0,0,0]],
  Q: [[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,1,1],[0,1,1,1]],
  R: [[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,1,0],[1,0,0,1]],
  T: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  V: [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0]],
  W: [[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
  X: [[1,0,0,1],[1,0,0,1],[0,1,1,0],[1,0,0,1],[1,0,0,1]],
  Y: [[1,0,0,1],[1,0,0,1],[0,1,1,0],[0,1,0,0],[0,1,0,0]],
  Z: [[1,1,1,1],[0,0,0,1],[0,1,1,0],[1,0,0,0],[1,1,1,1]],
  I: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1],
  ],
  A: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
  ],
  M: [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  U: [
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
  ],
  S: [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [1, 1, 1, 1],
  ],
};

function Pong() {
  const canvasRef = useRef(null);
  const pixelsRef = useRef([]);
  const ballRef = useRef({ x: 0, y: 0, dx: 0, dy: 0, radius: 0 });
  const paddlesRef = useRef([]);
  const scaleRef = useRef(1);
  const keysRef = useRef({ up: false, down: false });
  const statusRef = useRef('menu');
  const [status, setStatus] = useState('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const wordRef = useRef('IAMUSAMA');
  const [customWord, setCustomWord] = useState('');
  const [totalPixels, setTotalPixels] = useState(0);
  const [speed, setSpeed] = useState(2);
  const speedRef = useRef(2);

  const changeSpeed = (next) => {
    const ball = ballRef.current;
    const ratio = next / speedRef.current;
    ball.dx *= ratio;
    ball.dy *= ratio;
    speedRef.current = next;
    setSpeed(next);
  };

  const startGame = (word) => {
    if (word) wordRef.current = word;
    scoreRef.current = 0;
    livesRef.current = 3;
    setScore(0);
    setLives(3);
    window.dispatchEvent(new Event('resize'));
    changeStatus('playing');
  };

  const quitGame = () => {
    wordRef.current = 'IAMUSAMA';
    scoreRef.current = 0;
    livesRef.current = 3;
    setScore(0);
    setLives(3);
    window.dispatchEvent(new Event('resize'));
    changeStatus('menu');
  };

  const changeStatus = (next) => {
    statusRef.current = next;
    setStatus(next);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      scaleRef.current = Math.min(canvas.width / 1000, canvas.height / 1000);
      initializeGame();
    };

    const initializeGame = () => {
      const scale = scaleRef.current;
      const LARGE_PIXEL_SIZE = 8 * scale;
      const BALL_SPEED = Math.max(3, 5 * scale) * speedRef.current / 2;

      pixelsRef.current = [];
      const word = wordRef.current;

      const calculateWordWidth = (word, pixelSize) => {
        return (
          word.split("").reduce((width, letter) => {
            const letterWidth = PIXEL_MAP[letter]?.[0]?.length ?? 0;
            return width + letterWidth * pixelSize + LETTER_SPACING * pixelSize;
          }, 0) -
          LETTER_SPACING * pixelSize
        );
      };

      const totalWidth = calculateWordWidth(word, LARGE_PIXEL_SIZE);
      const scaleFactor = (canvas.width * 0.8) / totalWidth;

      const adjustedLargePixelSize = LARGE_PIXEL_SIZE * scaleFactor;

      const textHeight = 5 * adjustedLargePixelSize;
      let startY = (canvas.height - textHeight) / 2;
      let startX = (canvas.width - totalWidth * scaleFactor) / 2;

      word.split("").forEach((letter) => {
        const pixelMap = PIXEL_MAP[letter];
        if (!pixelMap) return;

        for (let i = 0; i < pixelMap.length; i++) {
          for (let j = 0; j < pixelMap[i].length; j++) {
            if (pixelMap[i][j]) {
              const x = startX + j * adjustedLargePixelSize;
              const y = startY + i * adjustedLargePixelSize;
              pixelsRef.current.push({ x, y, size: adjustedLargePixelSize, hit: false });
            }
          }
        }
        startX += (pixelMap[0].length + LETTER_SPACING) * adjustedLargePixelSize;
      });

      setTotalPixels(pixelsRef.current.length);
      const ballStartX = canvas.width * 0.25;
      const ballStartY = canvas.height * 0.5;

      ballRef.current = {
        x: ballStartX,
        y: ballStartY,
        dx: BALL_SPEED,
        dy: -BALL_SPEED * 0.6,
        radius: Math.max(4, adjustedLargePixelSize / 3),
      };

      const paddleWidth = adjustedLargePixelSize;
      const paddleLength = Math.min(canvas.height * 0.28, 8 * adjustedLargePixelSize);

      paddlesRef.current = [
        {
          x: 0,
          y: canvas.height / 2 - paddleLength / 2,
          width: paddleWidth,
          height: paddleLength,
          targetY: canvas.height / 2 - paddleLength / 2,
          isVertical: true,
        },
      ];
    };

    const updateGame = () => {
      if (statusRef.current !== 'playing') return;
      const ball = ballRef.current;
      const paddle = paddlesRef.current[0];

      const direction = Number(keysRef.current.down) - Number(keysRef.current.up);
      paddle.y = Math.max(0, Math.min(canvas.height - paddle.height, paddle.y + direction * Math.max(7, 10 * scaleRef.current)));

      ball.x += ball.dx;
      ball.y += ball.dy;

      if ((ball.y - ball.radius <= 0 && ball.dy < 0) || (ball.y + ball.radius >= canvas.height && ball.dy > 0)) {
        ball.dy = -ball.dy;
      }
      if (ball.x + ball.radius >= canvas.width && ball.dx > 0) {
        ball.dx = -ball.dx;
      }
      if (ball.x - ball.radius <= paddle.x + paddle.width && ball.dx < 0 &&
          ball.y + ball.radius >= paddle.y && ball.y - ball.radius <= paddle.y + paddle.height) {
        ball.x = paddle.x + paddle.width + ball.radius;
        ball.dx = Math.abs(ball.dx);
        ball.dy = ((ball.y - paddle.y) / paddle.height - 0.5) * Math.abs(ball.dx) * 1.6;
      } else if (ball.x + ball.radius < 0) {
        const nextLives = livesRef.current - 1;
        livesRef.current = nextLives;
        setLives(nextLives);
        if (nextLives === 0) changeStatus('lost');
        else {
          ball.x = canvas.width * 0.25;
          ball.y = canvas.height * 0.5;
          ball.dx = Math.abs(ball.dx);
          ball.dy = -Math.abs(ball.dx) * 0.6;
          changeStatus('ready');
        }
        return;
      }

      pixelsRef.current.forEach((pixel) => {
        if (
          !pixel.hit &&
          ball.x + ball.radius > pixel.x &&
          ball.x - ball.radius < pixel.x + pixel.size &&
          ball.y + ball.radius > pixel.y &&
          ball.y - ball.radius < pixel.y + pixel.size
        ) {
          pixel.hit = true;
          scoreRef.current += 1;
          setScore(scoreRef.current);
          const centerX = pixel.x + pixel.size / 2;
          const centerY = pixel.y + pixel.size / 2;
          if (Math.abs(ball.x - centerX) > Math.abs(ball.y - centerY)) {
            ball.dx = -ball.dx;
          } else {
            ball.dy = -ball.dy;
          }
          if (scoreRef.current === pixelsRef.current.length) changeStatus('won');
          return;
        }
      });
    };

    const drawGame = () => {
      if (!ctx) return;

      ctx.fillStyle = BACKGROUND_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      pixelsRef.current.forEach((pixel) => {
        ctx.fillStyle = pixel.hit ? HIT_COLOR : COLOR;
        ctx.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);
      });

      ctx.fillStyle = BALL_COLOR;
      ctx.beginPath();
      ctx.arc(ballRef.current.x, ballRef.current.y, ballRef.current.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PADDLE_COLOR;
      paddlesRef.current.forEach((paddle) => {
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
      });
    };

    let frameId;
    const gameLoop = () => {
      updateGame();
      drawGame();
      frameId = requestAnimationFrame(gameLoop);
    };

    const onKeyDown = (event) => {
      if (['ArrowUp', 'ArrowDown', 'Space'].includes(event.code)) event.preventDefault();
      if (event.code === 'ArrowUp' || event.code === 'KeyW') keysRef.current.up = true;
      if (event.code === 'ArrowDown' || event.code === 'KeyS') keysRef.current.down = true;
      if (event.code === 'Space' && statusRef.current !== 'menu' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'BUTTON') {
        if (statusRef.current === 'lost' || statusRef.current === 'won') restartGame();
        else changeStatus(statusRef.current === 'playing' ? 'paused' : 'playing');
      }
    };
    const onKeyUp = (event) => {
      if (event.code === 'ArrowUp' || event.code === 'KeyW') keysRef.current.up = false;
      if (event.code === 'ArrowDown' || event.code === 'KeyS') keysRef.current.down = false;
    };
    const onPointerMove = (event) => {
      const paddle = paddlesRef.current[0];
      if (paddle) paddle.y = Math.max(0, Math.min(canvas.height - paddle.height, event.clientY - paddle.height / 2));
    };
    const restartGame = () => {
      scoreRef.current = 0;
      livesRef.current = 3;
      setScore(0);
      setLives(3);
      initializeGame();
      changeStatus('playing');
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('pointermove', onPointerMove);
    gameLoop();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <main className="game">
    <canvas
      ref={canvasRef}
      aria-label="Pixel Pong playing field"
    />
    <div className="hud"><span>PIXEL PONG</span><span>PIXELS {score}/{totalPixels} · LIVES {lives} · SPEED {speed}</span></div>
    {status !== 'playing' && <div className="game-overlay">
      <h1>{status === 'won' ? 'YOU WIN' : status === 'lost' ? 'GAME OVER' : status === 'paused' ? 'PAUSED' : 'PIXEL PONG'}</h1>
      <p>{status === 'menu' || status === 'ready' ? 'Clear every pixel. Keep the ball in play.' : status === 'paused' ? 'Take a breath.' : `You cleared ${score} pixels.`}</p>
      {(status === 'menu' || status === 'paused') && <div className="speed-control">
        <label htmlFor="ball-speed">BALL SPEED: {speed}</label>
        <input id="ball-speed" type="range" min="1" max="5" step="1" value={speed} onChange={(event) => changeSpeed(Number(event.target.value))} />
        <span>SLOW <span>NORMAL</span> VERY FAST</span>
      </div>}
      {status === 'menu' && <form onSubmit={(event) => {
        event.preventDefault();
        if (customWord) startGame(customWord);
      }}>
        <label htmlFor="custom-word">YOUR WORD</label>
        <input id="custom-word" value={customWord} onChange={(event) => setCustomWord(event.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 12))} maxLength={12} placeholder="TYPE A WORD" autoComplete="off" />
        <button type="submit" disabled={!customWord}>PLAY YOUR WORD</button>
        <button type="button" onClick={() => startGame('IAMUSAMA')}>PLAY IAMUSAMA</button>
      </form>}
      {status !== 'menu' && <button onClick={() => status === 'paused' || status === 'ready' ? changeStatus('playing') : startGame()}>{status === 'paused' ? 'RESUME' : status === 'ready' ? 'CONTINUE' : 'PLAY AGAIN'}</button>}
      {status !== 'menu' && <button onClick={quitGame}>QUIT TO MENU</button>}
      <small>Move mouse or touch to steer · W/S or ↑/↓ · Space to pause</small>
    </div>}
    {status === 'playing' && <div className="game-controls"><button onClick={() => changeStatus('paused')}>PAUSE</button><button onClick={quitGame}>QUIT</button></div>}
    </main>
  );
}

export default Pong;
