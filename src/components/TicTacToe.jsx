import React from "react";
import Board from "./Board"
import { useState, useEffect } from "react";
import GameOver from "./GameOver";
import GameState from "./GameState";
import Reset from "./Reset";
import winAudio from "../sounds/tada.mp3";
import clickAudio from "../sounds/tile.wav";
import drawAudio from "../sounds/draw.wav";
import loseAudio from "../sounds/lose.mp3";

// audio sounds
const winSound = new Audio(winAudio);
winSound.volume = 0.2;
const clickSound = new Audio(clickAudio);
clickSound.volume = 0.5;
const drawSound = new Audio(drawAudio);
drawSound.volume = 0.5;
const loseSound = new Audio(loseAudio);
loseSound.volume = 0.5;


// player characters
const Player_X = "X";
const Player_O = "O";

const winningCombo = [
    // combination of rows
    {combo:[0,1,2], strikeClass: "strike-row-1"},
    {combo:[3,4,5], strikeClass: "strike-row-2"},
    {combo:[6,7,8], strikeClass: "strike-row-3"},

    //combination of columns
    {combo:[0,3,6], strikeClass: "strike-column-1"},
    {combo:[1,4,7], strikeClass: "strike-column-2"},
    {combo:[2,5,8], strikeClass: "strike-column-3"},

    //diagonal combinations
    {combo:[0,4,8], strikeClass: "strike-diagonal-1"},
    {combo:[2,4,6], strikeClass: "strike-diagonal-2"}

];

function checkWinner(tiles, setStrikeClass, setGameState, gameMode){
    for(const {combo, strikeClass} of winningCombo){
        const tileValue1 = tiles[combo[0]];
        const tileValue2 = tiles[combo[1]];
        const tileValue3 = tiles[combo[2]];

        // give the winner, if a combo is found
        if(tileValue1 !== null && tileValue1 === tileValue2 && tileValue1 === tileValue3){
            setStrikeClass(strikeClass);
            if(tileValue1 === Player_X){
                if(gameMode === "computer"){
                    setGameState(GameState.computerLose);
                }
                else{
                    setGameState(GameState.playerXwins);
                }
            }
            else if(tileValue1 === Player_O){
                if(gameMode === "computer"){
                    setGameState(GameState.computerwins);
                }
                else{
                    setGameState(GameState.playerOwins);
                }
            }
            return true;
        }
    }
    // if a combo is not found, check if all tiles are filled
    const tilesFilled = tiles.every((tile) => tile!== null);
    if(tilesFilled){
        setGameState(GameState.draw);
        return true;
    }
    return false;  // else indicates no winner yet
}

function TicTacToe(){
    const [tiles, setTiles] = useState(Array(9).fill(null)); // start with a empty set of tiles
    const [playerTurn, setPlayerTurn] = useState(Player_X); // always player X starts first
    const [strikeClass, setStrikeClass]= useState();    // no strike initially
    const [gameState, setGameState] = useState(GameState.inProgress);   // gameState initialised to in progess
    const [gameMode, setGameMode] = useState(null); // two player mode or computer mode, initially null
    const [firstMoveMade, setFirstMoveMade] = useState(false); // first move initialially false for the instruction txt

    // user selects a mode
    const handleModeSelection = (mode) => {
        setGameMode(mode);
        clickSound.play();
    };
    
    // user clicks a tile
    const handleTileClick = (index) => {
        // check if game is in progress or if tile is empty, if either false: return
        if(gameState !== GameState.inProgress || tiles[index] !== null){
            return;
        }
        
        // else: display XO on selected tile
        const newTiles = [...tiles];
        newTiles[index] = playerTurn;
        setTiles(newTiles);
        
        // set first move to true for the instruction txt to vanish
        if (!firstMoveMade) setFirstMoveMade(true);

        // check for winner before switching turns, if found: return
        if(checkWinner(newTiles, setStrikeClass, setGameState, gameMode)) return;     

        // two player mode: set character accordingly, else let computer move
        if (gameMode === "twoPlayer") {
            setPlayerTurn(playerTurn === Player_X ? Player_O : Player_X);
        }
        else {
            setTimeout(() => {
                    computerMove(newTiles);
            }, 500);
        }
    };
    
    // computer's move initialiser, computer is O
    const computerMove = (tiles) => {
        let move = smartMove(tiles);
        if(move === -1){
            move = tiles.findIndex((tile)=> tile === null);
        }
        if(move !== -1){
            const newTiles = [...tiles];
            newTiles[move] = Player_O;
            setTiles(newTiles);
            // after the move, checks winner, if  none: users turn
            if (!checkWinner(newTiles, setStrikeClass, setGameState, gameMode)) {
                setPlayerTurn(Player_X);
            }
        }
    };

    // computer's smart move code 
    const smartMove = (tiles) => {
        const winningCombo = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]            // Diagonals
        ];
    
        // Find a winning move or block opponent's win
        const findMove = (player) => {
            for (let combo of winningCombo) {
                const [a, b, c] = combo;
                const values = [tiles[a], tiles[b], tiles[c]];
                if (values.filter(v => v === player).length === 2 && values.includes(null)) {
                    return combo[values.indexOf(null)];
                }
            }
            return -1;
        };
    

        // computer tries to find a winning move first
        let move = findMove(Player_O);
        if (move !== -1) return move;
    
        // computer blocks the player's winning combo
        move = findMove(Player_X);
        if (move !== -1) return move;
    
        // tries to take the center if available
        if (tiles[4] === null) return 4;
    
        // tries to select an available corner randomly
        const corners = [0, 2, 6, 8].filter(i => tiles[i] === null);
        if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
    
        // at last, selects an empty tile
        return tiles.findIndex(tile => tile === null);
    };
    
    // reset button press handle
    const handleReset = ()=> {
        setGameState(GameState.inProgress);
        setTiles(Array(9).fill(null));
        setPlayerTurn(Player_X);
        setStrikeClass(null);
        setGameMode(null);
        setFirstMoveMade(false);
        clickSound.play();
    }

    // for winner checks
    useEffect(() => {
        checkWinner(tiles, setStrikeClass, setGameState, gameMode);
    }, [tiles, gameMode]);

    // sound on click
    useEffect(()=>{
        if(tiles.some((tile)=> tile !== null)){
            clickSound.play();
        }
    }, [tiles]);

    //sound on game end
    useEffect(() => {
        if(gameState === GameState.draw){
            drawSound.play();
        }
        else if(gameMode === "computer" && gameState !== GameState.inProgress){
            if(gameState === GameState.computerLose){
                winSound.play();
            }
            else{
                loseSound.play();
            }
        }
        else if(gameState !== GameState.inProgress){
            winSound.play();
        }
        
    }, [gameState, gameMode]);

    // the game screen displayed on call
    return (
        <div className = "container">
            <h1>Tic Tac Toe</h1>
            {gameMode === null && (
                <div className="modal-overlay">
                    <div className="modal">
                    <h2>Welcome to Tic Tac Toe!</h2>
                    <p>Select a mode to start playing:</p>
                    <div className="button-group">
                        <button onClick={() => handleModeSelection("twoPlayer")}>Two Player</button>
                        <button onClick={() => handleModeSelection("computer")}>Computer</button>
                    </div>
                    <p><i>pssst: can you beat the bot?</i> 😉</p>
                    </div>
                </div>
            )}
            {(gameMode && !firstMoveMade ) && (
                <p className="turn-info">
                    pssst: <br></br>
                    {gameMode === "twoPlayer" 
                    ? "Player X goes first!" 
                    : "Make the first move!"}
                </p>
            )}
            <div className="game-container">
                <Board tiles={tiles} 
                onTileClick={handleTileClick}
                strikeClass={strikeClass}
                />
                <GameOver gameState={gameState} />
                <Reset onReset ={handleReset} />
            </div>
            <div className="credit">© <a href="https://github.com/junggeyy">junggeyy</a> 2025</div>
        </div>
    );
}

export default TicTacToe;
