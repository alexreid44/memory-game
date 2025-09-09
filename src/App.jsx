
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
  const size = 4;
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
          // Do NOT change turn on a match
        }, 800);
      } else {
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards([...newCards]);
          setFlipped([]);
          // Change turn on a miss in 2-player mode
          if (players === 2) setTurn((turn + 1) % 2);
        }, 800);
      }
    }
  }

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        textAlign: 'center',
        minHeight: '100vh',
  background: 'linear-gradient(135deg, #00332d 0%, #005046 80%, #FF7F02 100%)',
        margin: 0,
        padding: 0,
      }}
    >
      <h1 style={{
        color: '#FF7F02',
        letterSpacing: 2,
        fontWeight: 900,
        fontSize: 48,
        marginBottom: 8,
        textTransform: 'uppercase',
        textShadow: '2px 2px 0 #fff, 4px 4px 0 #00332d',
      }}>MEMORY GAME</h1>
  <div style={{ marginBottom: 24, background: '#fffdfa', borderRadius: 12, display: 'inline-block', padding: '12px 32px', boxShadow: '0 2px 12px rgba(0,0,0,0.10)', border: '2px solid #FF7F02' }}>
        <label style={{ color: '#333', fontWeight: 700, fontSize: 20 }}>Players: </label>
        <select value={players} onChange={e => setPlayers(Number(e.target.value))} style={{ fontSize: 18, borderRadius: 6, padding: '4px 12px', marginLeft: 8, marginRight: 16, border: '2px solid #bbb', background: '#fff', color: '#222', fontWeight: 700 }}>
          <option value={1}>1</option>
          <option value={2}>2</option>
        </select>
        <button
          style={{
            marginLeft: 16,
            fontSize: 18,
            fontWeight: 700,
            background: 'linear-gradient(90deg, #FF7F02 0%, #FFAE00 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 24px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'background 0.2s',
            letterSpacing: 1,
            textShadow: '1px 1px 0 #b85c00',
          }}
          onClick={startGame}
        >
          Start Game
        </button>
      </div>
      <div style={{ marginBottom: 20 }}>
        {players === 2 ? (
          <div style={{ color: '#333', fontWeight: 700, fontSize: 22 }}>
            <span style={{ color: '#FF7F02' }}>Player 1: {scores[0]}</span>
            <span style={{ marginLeft: 24, color: '#FFAE00' }}>Player 2: {scores[1]}</span>
            <span style={{ marginLeft: 24, color: '#00332d' }}>Turn: Player {turn + 1}</span>
          </div>
        ) : (
          <span style={{ color: '#444', fontWeight: 700, fontSize: 22, background: '#fffdfa', borderRadius: 8, padding: '4px 16px', boxShadow: '0 1px 4px #eee', border: '1.5px solid #FF7F02' }}>Score: {scores[0]}</span>
        )}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${size}, 90px)`,
          gridTemplateRows: `repeat(${size}, 90px)`,
          gap: '18px',
          justifyContent: 'center',
          background: '#fff8f2',
          borderRadius: 18,
          padding: 24,
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
          margin: '0 auto 24px auto',
          width: 'max-content',
        }}
      >
        {cards.map((card, idx) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(idx)}
            style={{
              width: 90,
              height: 90,
              background: card.flipped || card.matched ? '#fff' : '#00332d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 16,
              boxShadow: card.flipped || card.matched ? '0 4px 16px #bbb' : '0 2px 8px #aaa',
              cursor: card.flipped || card.matched ? 'default' : 'pointer',
              transition: 'background 0.3s, color 0.3s, box-shadow 0.3s',
              userSelect: 'none',
              overflow: 'hidden',
              padding: 0,
              border: card.flipped || card.matched ? '2px solid #FF7F02' : '2px solid #00332d',
              filter: card.flipped || card.matched ? 'none' : 'blur(0.5px)',
            }}
          >
            {(card.flipped || card.matched) ? (
              <img
                src={card.image ? `/images/${card.image}` : ''}
                alt="card"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12, boxShadow: '0 1px 4px #ccc' }}
                draggable={false}
              />
            ) : null}
          </div>
        ))}
      </div>
      {gameOver && (
  <div style={{ marginTop: 24, fontSize: 28, color: '#FF7F02', fontWeight: 900, textShadow: '1px 1px 0 #fff' }}>
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
