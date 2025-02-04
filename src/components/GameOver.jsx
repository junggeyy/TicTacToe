import GameState from "./GameState";
function GameOver({ gameState}){
    switch(gameState){
        case GameState.inProgress:
            return <></>;

        case GameState.playerOwins:
            return <div className="game-over">🏆 O Wins! 🏆</div>;

        case GameState.playerXwins:
            return <div className="game-over">🏆 X Wins! 🏆</div>;
            
        case GameState.draw:
            return <div className="game-over">It's a draw!</div>;

        case GameState.computerwins:
            return <div className="game-over">🦾 You lose! 🦾</div>;

        case GameState.computerLose:
            return <div className="game-over">🏆 You win! 🏆</div>;
        
        default:
            return <></>;

    }
}

export default GameOver;