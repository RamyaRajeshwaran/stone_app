import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [gameState, setGameState] = useState({
    player1: '',
    player2: '',
    rounds: [],
    gameStarted: false,
    gameOver: false,
    currentRound: 1,
    player1Choice: '',
    player2Choice: '',
    gameId: null
  });

  const startGame = async () => {
    const { player1, player2 } = gameState;
    if (player1.trim() === '' || player2.trim() === '') {
      alert('Please enter names for both players.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/games', { player1, player2 });
      const { data } = response;
      setGameState(prevState => ({
        ...prevState,
        gameId: data._id,
        gameStarted: true,
        currentRound: 1,
        rounds: [],
        player1Choice: '',
        player2Choice: '',
        gameOver: false
      }));
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please check your network connection and try again.');
    }
  };

  useEffect(() => {
    if (gameState.currentRound > 6) {
      setGameState(prevState => ({ ...prevState, gameOver: true }));
    }
  }, [gameState.currentRound]);

  const handlePlayer1Choice = (choice) => {
    setGameState(prevState => ({ ...prevState, player1Choice: choice }));
  };

  const handlePlayer2Choice = (choice) => {
    setGameState(prevState => ({ ...prevState, player2Choice: choice }));
  };

  const determineWinner = async () => {
    const { player1Choice, player2Choice, gameId, currentRound } = gameState;
    if (player1Choice === '' || player2Choice === '') {
      alert('Both players need to make a selection.');
      return;
    }

    const winner = determineRoundWinner(player1Choice, player2Choice);

    try {
      const response = await axios.put(`http://localhost:5000/api/games/${gameId}`, {
        round: currentRound,
        player1Choice,
        player2Choice,
        winner
      });
      const { data } = response;
      setGameState(prevState => ({
        ...prevState,
        rounds: [...prevState.rounds, { round: currentRound, player1: prevState.player1, player2: prevState.player2, winner }],
        currentRound: currentRound + 1,
        player1Choice: '',
        player2Choice: '',
        gameOver: currentRound === 6
      }));
    } catch (error) {
      console.error('Error determining winner:', error);
      alert('Failed to determine winner. Please check your network connection and try again.');
    }
  };

  const determineRoundWinner = (choice1, choice2) => {
    const { player1, player2 } = gameState;
    if (choice1 === choice2) {
      return 'tie';
    } else if (
      (choice1 === 'stone' && choice2 === 'scissors') ||
      (choice1 === 'scissors' && choice2 === 'paper') ||
      (choice1 === 'paper' && choice2 === 'stone')
    ) {
      return player1;
    } else {
      return player2;
    }
  };

  const calculateFinalScores = useMemo(() => {
    const { rounds, player1, player2 } = gameState;
    let player1Score = 0;
    let player2Score = 0;
    rounds.forEach(round => {
      if (round.winner === player1) {
        player1Score++;
      } else if (round.winner === player2) {
        player2Score++;
      }
    });
    return { player1Score, player2Score };
  }, [gameState.rounds, gameState.player1, gameState.player2]);

  return (
    <div className="App">
      <h1 className='heading'>Stone Paper Scissors Game</h1>
      {!gameState.gameStarted && (
        <div className='inputbox'>
          <input type="text" placeholder="Player 1 Name" value={gameState.player1} onChange={e => setGameState(prevState => ({ ...prevState, player1: e.target.value }))} />
          <input type="text" placeholder="Player 2 Name" value={gameState.player2} onChange={e => setGameState(prevState => ({ ...prevState, player2: e.target.value }))} />
          <button onClick={startGame}>Start Game</button>
        </div>
      )}
      {gameState.gameStarted && !gameState.gameOver && gameState.currentRound <= 6 && (
        <div className="choices">
          <h2>{gameState.player1}'s Turn:</h2>
          <button onClick={() => handlePlayer1Choice('stone')}>Stone</button>
          <button onClick={() => handlePlayer1Choice('paper')}>Paper</button>
          <button onClick={() => handlePlayer1Choice('scissors')}>Scissors</button>
          <h2>{gameState.player2}'s Turn:</h2>
          <button onClick={() => handlePlayer2Choice('stone')}>Stone</button>
          <button onClick={() => handlePlayer2Choice('paper')}>Paper</button>
          <button onClick={() => handlePlayer2Choice('scissors')}>Scissors</button>
          
          <button onClick={determineWinner}>Submit</button>
          
          <div className="rounds">
            {gameState.rounds.map((round, index) => (
              <div key={index} className="round">
                <h5>
                  Round {round.round}: {round.player1} vs {round.player2} - Winner: {round.winner}
                </h5>
              </div>
            ))}
          </div>
        </div>
      )}
      {gameState.gameOver && (
        <div className="scoreboard">
          <h2>Game Over!</h2>
          <h3>Final Scores:</h3>
          <h5>{gameState.player1}: {calculateFinalScores.player1Score} - {gameState.player2}: {calculateFinalScores.player2Score}</h5>
          <h3>Winner</h3>
          <h5>{calculateFinalScores.player1Score > calculateFinalScores.player2Score ? gameState.player1 : calculateFinalScores.player1Score < calculateFinalScores.player2Score ? gameState.player2 : 'It\'s a Tie!'}</h5>
        </div>
      )}
    </div>
  );
}

export default App;
