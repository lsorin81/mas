import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

const appleImg = process.env.PUBLIC_URL + "/apple.webp";
const bananaImg = process.env.PUBLIC_URL + "/banana.webp";
const orangeImg = process.env.PUBLIC_URL + "/orange.webp";
const pearImg = process.env.PUBLIC_URL + "/pear.webp";
const playerLeftImg = process.env.PUBLIC_URL + "/left.png";
const playerRightImg = process.env.PUBLIC_URL + "/right.png";

export const fruitImages = {
  apple: appleImg,
  banana: bananaImg,
  orange: orangeImg,
  pear: pearImg,
};

const GAME_CONSTANTS = {
  PLAYER_STEP: 5,
  FRUIT_TYPES: ["apple", "banana", "orange", "pear"],
  INITIAL_SPAWN_INTERVAL: 1000,
  COLLISION_THRESHOLD: 8,
  FRUIT_FALL_SPEED: 1,
  PLAYER_Y_POSITION: 85,
  MAX_HIGH_SCORES: 3,
};

function App() {
  const [playerPosition, setPlayerPosition] = useState(50);
  const [playerFacingLeft, setPlayerFacingLeft] = useState(false);
  const [fruits, setFruits] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [spawnInterval, setSpawnInterval] = useState(2000);
  const [highScores, setHighScores] = useState(() => {
    const saved = localStorage.getItem("highScores");
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.filter(
            (score) => typeof score.score === "number" && !isNaN(score.score)
          )
        : [];
    } catch {
      return [];
    }
  });
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [touchIntervals, setTouchIntervals] = useState({
    left: null,
    right: null,
  });

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft" && playerPosition > 0) {
        setPlayerPosition((prev) => prev - 5);
        setPlayerFacingLeft(true);
      }
      if (e.key === "ArrowRight" && playerPosition < 95) {
        setPlayerPosition((prev) => prev + 5);
        setPlayerFacingLeft(false);
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
      setSpawnInterval((prev) => Math.max(prev * 0.9, 100));
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

  const updateHighScores = useCallback(
    (newScore, name) => {
      if (typeof newScore !== "number" || isNaN(newScore)) return;

      const updatedScores = [...highScores, { name, score: newScore }]
        .filter(
          (score) => typeof score.score === "number" && !isNaN(score.score)
        )
        .sort((a, b) => b.score - a.score)
        .slice(0, GAME_CONSTANTS.MAX_HIGH_SCORES);

      setHighScores(updatedScores);
      localStorage.setItem("highScores", JSON.stringify(updatedScores));
    },
    [highScores]
  );

  const movePlayer = (direction) => {
    if (direction === "left" && playerPosition > 0) {
      setPlayerPosition((prev) => prev - GAME_CONSTANTS.PLAYER_STEP);
      setPlayerFacingLeft(true);
    } else if (direction === "right" && playerPosition < 95) {
      setPlayerPosition((prev) => prev + GAME_CONSTANTS.PLAYER_STEP);
      setPlayerFacingLeft(false);
    }
  };

  if (isGameOver) {
    const isHighScore =
      score > (highScores[GAME_CONSTANTS.MAX_HIGH_SCORES - 1]?.score || 0);

    return (
      <div className="game-over">
        <h1>Game Over! Score: {score}</h1>
        {isHighScore && !showNameInput && (
          <div>
            <h2>🎉 New High Score! 🎉</h2>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
            />
            <button
              onClick={() => {
                if (playerName.trim()) {
                  updateHighScores(score, playerName);
                  setShowNameInput(false);
                  setPlayerName("");
                  setIsGameOver(false);
                  setScore(0);
                  setFruits([]);
                  setSpawnInterval(GAME_CONSTANTS.INITIAL_SPAWN_INTERVAL);
                }
              }}
            >
              Save Score & Play Again
            </button>
          </div>
        )}

        <div className="high-scores">
          <h2>High Scores</h2>
          {highScores.map((s, i) => (
            <div key={i}>
              #{i + 1}: {s.name || "Anonymous"} - {s.score}s
            </div>
          ))}
        </div>

        {!isHighScore && (
          <button
            onClick={() => {
              setIsGameOver(false);
              setScore(0);
              setFruits([]);
              setSpawnInterval(GAME_CONSTANTS.INITIAL_SPAWN_INTERVAL);
            }}
          >
            Play Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="score">Survived: {score}s</div>

      {highScores.length >= 3 && (
        <div className="in-game-high-scores">
          {highScores.map((s, i) => (
            <div key={i}>
              #{i + 1}: {s.name} - {s.score}s
            </div>
          ))}
        </div>
      )}

      <button
        className="control-button left-button"
        onTouchStart={() => {
          movePlayer("left");
          const interval = setInterval(() => movePlayer("left"), 50);
          setTouchIntervals((prev) => ({ ...prev, left: interval }));
        }}
        onTouchEnd={() => {
          if (touchIntervals.left) {
            clearInterval(touchIntervals.left);
            setTouchIntervals((prev) => ({ ...prev, left: null }));
          }
        }}
        onMouseDown={() => {
          movePlayer("left");
          const interval = setInterval(() => movePlayer("left"), 50);
          setTouchIntervals((prev) => ({ ...prev, left: interval }));
        }}
        onMouseUp={() => {
          if (touchIntervals.left) {
            clearInterval(touchIntervals.left);
            setTouchIntervals((prev) => ({ ...prev, left: null }));
          }
        }}
        onMouseLeave={() => {
          if (touchIntervals.left) {
            clearInterval(touchIntervals.left);
            setTouchIntervals((prev) => ({ ...prev, left: null }));
          }
        }}
      >
        ←
      </button>

      <button
        className="control-button right-button"
        onTouchStart={() => {
          movePlayer("right");
          const interval = setInterval(() => movePlayer("right"), 50);
          setTouchIntervals((prev) => ({ ...prev, right: interval }));
        }}
        onTouchEnd={() => {
          if (touchIntervals.right) {
            clearInterval(touchIntervals.right);
            setTouchIntervals((prev) => ({ ...prev, right: null }));
          }
        }}
        onMouseDown={() => {
          movePlayer("right");
          const interval = setInterval(() => movePlayer("right"), 50);
          setTouchIntervals((prev) => ({ ...prev, right: interval }));
        }}
        onMouseUp={() => {
          if (touchIntervals.right) {
            clearInterval(touchIntervals.right);
            setTouchIntervals((prev) => ({ ...prev, right: null }));
          }
        }}
        onMouseLeave={() => {
          if (touchIntervals.right) {
            clearInterval(touchIntervals.right);
            setTouchIntervals((prev) => ({ ...prev, right: null }));
          }
        }}
      >
        →
      </button>

      {fruits.map((fruit, index) => (
        <img
          key={index}
          src={fruitImages[fruit.type]}
          className="fruit"
          style={{ left: `${fruit.x}%`, top: `${fruit.y}%` }}
          alt={fruit.type}
        />
      ))}
      <img
        src={playerFacingLeft ? playerLeftImg : playerRightImg}
        className="player"
        style={{ left: `${playerPosition}%` }}
        alt="player"
      />
    </div>
  );
}

export default App;
