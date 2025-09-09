
import React, { useState, useRef } from 'react';


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
  const [showLose, setShowLose] = useState(false);
  const size = 4;
  const [players, setPlayers] = useState(1);
  const [cards, setCards] = useState(generateCards(size));
  const [flipped, setFlipped] = useState([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [turn, setTurn] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const [gameOver, setGameOver] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds

  // For pinging image within grid area
  const [imgPos, setImgPos] = useState({ top: 100, left: 100 });
  const gridRef = useRef(null);
  // Move image within grid area
  React.useEffect(() => {
    function randomPosInGrid() {
      const imgSize = 80;
      const pad = 4;
      if (!gridRef.current) return { top: 100, left: 100 };
      const rect = gridRef.current.getBoundingClientRect();
      // The parent div is relative, so use rect relative to viewport, and offset by scroll
      const parentRect = gridRef.current.parentElement.getBoundingClientRect();
      const offsetTop = rect.top - parentRect.top;
      const offsetLeft = rect.left - parentRect.left;
      const maxTop = rect.height - imgSize - pad;
      const maxLeft = rect.width - imgSize - pad;
      return {
        top: offsetTop + Math.floor(Math.random() * maxTop) + pad,
        left: offsetLeft + Math.floor(Math.random() * maxLeft) + pad,
      };
    }
    const interval = setInterval(() => {
      setImgPos(randomPosInGrid());
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Hide lose banner and restart game after showing
  React.useEffect(() => {
    if (showLose) {
      const timeout = setTimeout(() => {
        setShowLose(false);
        startGame();
      }, 1800);
      return () => clearTimeout(timeout);
    }
  }, [showLose]);

  React.useEffect(() => {
    if (players !== 1 || gameOver) return;
    if (matchedCount === (size * size) / 2) return;
    const interval = setInterval(() => {
      setElapsed(e => (e < 60 ? e + 1 : 60));
    }, 1000);
    return () => clearInterval(interval);
  }, [players, gameOver, matchedCount]);

  // Reset timer on new game
  React.useEffect(() => {
    setElapsed(0);
  }, [cards]);

  function startGame() {
    setCards(generateCards(size));
    setFlipped([]);
    setMatchedCount(0);
    setTurn(0);
    setScores([0, 0]);
    setGameOver(false);
    setElapsed(0);
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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Pinging image */}
      <img
        src="https://media.licdn.com/dms/image/v2/D4E03AQFwGhFX7UU_dw/profile-displayphoto-scale_400_400/B4EZgPoM.AHEAg-/0/1752608854400?e=1760572800&v=beta&t=UHFAtC7mPE4pAfBdCPLKYRfv0PqXdKYKod4L60jvEQ8"
        alt="pinging"
        onClick={() => setShowLose(true)}
        style={{
          position: 'absolute',
          top: imgPos.top,
          left: imgPos.left,
          width: 80,
          height: 80,
          borderRadius: '50%',
          boxShadow: '0 4px 16px #0008',
          border: '3px solid #fff',
          zIndex: 1000,
          transition: 'top 0.7s cubic-bezier(.5,1.5,.5,1), left 0.7s cubic-bezier(.5,1.5,.5,1)',
          pointerEvents: showLose ? 'none' : 'auto',
          userSelect: 'none',
          cursor: 'pointer',
        }}
      />
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
          <>
            <div style={{
              width: 340,
              height: 32,
              background: 'linear-gradient(90deg, #1ecb4f 0%, #ffe600 50%, #ff0000 100%)',
              borderRadius: 16,
              position: 'relative',
              margin: '0 auto',
              boxShadow: '0 1px 8px #eee',
              border: '2px solid #FF7F02',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* Sliding line */}
              <div style={{
                position: 'absolute',
                left: `${(elapsed / 60) * 100}%`,
                top: 0,
                bottom: 0,
                width: 4,
                background: '#222',
                borderRadius: 2,
                boxShadow: '0 0 6px #fff',
                transition: 'left 1s linear',
                zIndex: 2,
              }} />
              {/* Timer label */}
              <span style={{
                position: 'absolute',
                right: 16,
                color: '#fff',
                fontWeight: 900,
                fontSize: 18,
                textShadow: '1px 1px 2px #00332d',
                zIndex: 3,
                letterSpacing: 1,
              }}>{elapsed}s</span>
            </div>
            {/* Dynamic message below the bar */}
            <div style={{
              marginTop: 8,
              fontSize: 20,
              fontWeight: 700,
              color: '#fff',
              textShadow: '1px 1px 2px #000, -1px -1px 2px #000',
              minHeight: 28,
            }}>
              {elapsed <= 5 && 'transcending the ordinary'}
              {elapsed > 5 && elapsed <= 20 && 'ordinary'}
              {elapsed > 20 && elapsed <= 40 && 'descending the ordinary'}
              {elapsed > 40 && 'personally fired by Jim Olson'}
            </div>
          </>
        )}
      </div>
      <div
        ref={gridRef}
        style={{
          position: 'relative',
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
        {showLose && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(200,0,0,0.97)',
              color: '#fff',
              fontWeight: 900,
              fontSize: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              borderRadius: 18,
              letterSpacing: 4,
              textShadow: '2px 2px 8px #000',
              transition: 'opacity 0.3s',
              pointerEvents: 'none',
            }}
          >
            YOU LOSE
          </div>
        )}
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
