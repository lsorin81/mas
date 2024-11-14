import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

const appleImg = process.env.PUBLIC_URL + "/apple.webp";
const bananaImg = process.env.PUBLIC_URL + "/banana.webp";
const orangeImg = process.env.PUBLIC_URL + "/orange.webp";
const pearImg = process.env.PUBLIC_URL + "/pear.webp";

export const fruitImages = {
  apple: appleImg,
  banana: bananaImg,
  orange: orangeImg,
  pear: pearImg,
};

const GAME_CONSTANTS = {
  PLAYER_STEP: 5,
  PLAYER_BOUNDS: { MIN: 0, MAX: 95 },
  FRUIT_TYPES: ["apple", "banana", "orange", "pear"],
  INITIAL_SPAWN_INTERVAL: 2000,
  COLLISION_THRESHOLD: 8,
  FRUIT_FALL_SPEED: 1,
  PLAYER_Y_POSITION: 85,
};

function App() {
  const [playerPosition, setPlayerPosition] = useState(50);
  const [fruits, setFruits] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [spawnInterval, setSpawnInterval] = useState(2000);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft" && playerPosition > 0) {
        setPlayerPosition((prev) => prev - 5);
      }
      if (e.key === "ArrowRight" && playerPosition < 95) {
        setPlayerPosition((prev) => prev + 5);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    const gameLoop = setInterval(updateGame, 50);
    const spawnFruitInterval = setInterval(createFruit, spawnInterval);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      clearInterval(gameLoop);
      clearInterval(spawnFruitInterval);
    };
  }, [playerPosition, spawnInterval, isGameOver]);

  useEffect(() => {
    if (score > 0 && score % 10 === 0) {
      setSpawnInterval((prev) => Math.max(prev * 0.9, 500));
    }
  }, [score]);

  const createFruit = () => {
    if (isGameOver) return;
    const fruitTypes = ["apple", "banana", "orange", "pear"];
    const type = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];

    const newFruit = {
      x: Math.random() * 95,
      y: 0,
      type,
    };
    console.log("new fruit", newFruit);
    setFruits((prev) => [...prev, newFruit]);
  };

  const checkCollision = useCallback((fruit, playerPos) => {
    return (
      fruit.y > GAME_CONSTANTS.PLAYER_Y_POSITION &&
      Math.abs(fruit.x - playerPos) < GAME_CONSTANTS.COLLISION_THRESHOLD
    );
  }, []);

  const updateGame = () => {
    setFruits((prev) => {
      const updated = prev
        .map((fruit) => ({
          ...fruit,
          y: fruit.y + 1,
        }))
        .filter((fruit) => {
          if (fruit.y >= 100) {
            if (!isGameOver) setScore((s) => s + 1);
            return false;
          }
          return true;
        });

      const collidedFruit = updated.find((fruit) =>
        checkCollision(fruit, playerPosition)
      );
      if (collidedFruit) {
        setIsGameOver(true);
      }

      return updated;
    });
  };

  if (isGameOver) {
    return (
      <div className="game-over">
        <h1>Game Over! Score: {score}</h1>
        <button
          onClick={() => {
            setIsGameOver(false);
            setScore(0);
            setFruits([]);
            setSpawnInterval(2000);
          }}
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="score">Survived: {score}s</div>

      {fruits.map((fruit, index) => (
        <img
          key={index}
          src={fruitImages[fruit.type]}
          className="fruit"
          style={{ left: `${fruit.x}%`, top: `${fruit.y}%` }}
          alt={fruit.type}
        />
      ))}
      <div className="player" style={{ left: `${playerPosition}%` }} />
    </div>
  );
}

export default App;
