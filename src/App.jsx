
import React, { useState } from 'react';


// List of image filenames in public/images
const IMAGE_FILENAMES = [
  'AlisonGarback.jpg', 'BrianSturgeon.jpg', 'ChadMacDonald.jpg', 'ColeenFinnegan.jpg',
  'CraigWood.jpg', 'DaleJohnson.jpg', 'DannyWunder.jpg', 'DrewCordell.jpg',
  'EdSchwartz.jpg', 'EllisonLiebrecht.jpg', 'GaryGentry.jpg', 'GregGalloway.jpg',
  'JamieWorley.jpg', 'JimOlson.jpg', 'JoelEllenbarger.jpg', 'JustinParkhill.jpg',
  'KarimRayani.jpg', 'KaytekPrzybylski.jpg', 'KeitherGruenberg.jpg', 'LisaBrown.jpg',
  'RebeccaGesell.jpg', 'RichardBourke.jpg', 'ScottHryniuk.jpg', 'SuzanneWilliams.jpg',
];

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function generateCards(size) {
  const numPairs = (size * size) / 2;
  let selectedImages = IMAGE_FILENAMES.slice(0, numPairs);
  // If not enough images, repeat images to fill the grid
  while (selectedImages.length < numPairs) {
    selectedImages = selectedImages.concat(IMAGE_FILENAMES.slice(0, numPairs - selectedImages.length));
  }
  const cards = shuffle([...selectedImages, ...selectedImages]).map((image, idx) => ({
    id: idx,
    image,
    flipped: false,
    matched: false,
  }));
  return cards;
}

export default function App() {
  const [size, setSize] = useState(4);
  const [players, setPlayers] = useState(1);
  const [cards, setCards] = useState(generateCards(size));
  const [flipped, setFlipped] = useState([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [turn, setTurn] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const [gameOver, setGameOver] = useState(false);

  function startGame() {
    setCards(generateCards(size));
    setFlipped([]);
    setMatchedCount(0);
    setTurn(0);
    setScores([0, 0]);
    setGameOver(false);
  }

  function handleCardClick(idx) {
    if (cards[idx].flipped || cards[idx].matched || flipped.length === 2 || gameOver) return;
    const newCards = cards.slice();
    newCards[idx].flipped = true;
    const newFlipped = [...flipped, idx];
    setCards(newCards);
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (newCards[first].image === newCards[second].image) {
        setTimeout(() => {
          newCards[first].matched = true;
          newCards[second].matched = true;
          setCards([...newCards]);
          setFlipped([]);
          setMatchedCount(matchedCount + 1);
          const newScores = scores.slice();
          newScores[turn] += 1;
          setScores(newScores);
          if (matchedCount + 1 === (size * size) / 2) {
            setGameOver(true);
          }
        }, 800);
      } else {
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards([...newCards]);
          setFlipped([]);
          if (players === 2) setTurn((turn + 1) % 2);
        }, 800);
      }
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: 20 }}>
      <h1>Memory Game</h1>
      <div style={{ marginBottom: 16 }}>
        <label>Grid Size: </label>
        <select value={size} onChange={e => setSize(Number(e.target.value))}>
          <option value={4}>4x4</option>
          <option value={6}>6x6</option>
          <option value={8}>8x8</option>
        </select>
        <label style={{ marginLeft: 16 }}>Players: </label>
        <select value={players} onChange={e => setPlayers(Number(e.target.value))}>
          <option value={1}>1</option>
          <option value={2}>2</option>
        </select>
        <button style={{ marginLeft: 16 }} onClick={startGame}>Start Game</button>
      </div>
      <div style={{ marginBottom: 16 }}>
        {players === 2 ? (
          <div>
            <span>Player 1: {scores[0]}</span>
            <span style={{ marginLeft: 16 }}>Player 2: {scores[1]}</span>
            <span style={{ marginLeft: 16 }}>Turn: Player {turn + 1}</span>
          </div>
        ) : (
          <span>Score: {scores[0]}</span>
        )}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${size}, 120px)`,
          gridTemplateRows: `repeat(${size}, 120px)`,
          gap: '10px',
          justifyContent: 'center',
        }}
      >
        {cards.map((card, idx) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(idx)}
            style={{
              width: 120,
              height: 120,
              background: card.flipped || card.matched ? '#fff' : '#333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              cursor: card.flipped || card.matched ? 'default' : 'pointer',
              transition: 'background 0.3s, color 0.3s',
              userSelect: 'none',
              overflow: 'hidden',
              padding: 0,
            }}
          >
            {(card.flipped || card.matched) ? (
              <img
                src={card.image ? `/images/${card.image}` : ''}
                alt="card"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                draggable={false}
              />
            ) : null}
          </div>
        ))}
      </div>
      {gameOver && (
        <div style={{ marginTop: 24, fontSize: 24, color: '#1976d2' }}>
          {players === 2
            ? scores[0] === scores[1]
              ? 'It’s a tie!'
              : `Player ${scores[0] > scores[1] ? '1' : '2'} wins!`
            : 'You win!'}
        </div>
      )}
    </div>
  );
}
