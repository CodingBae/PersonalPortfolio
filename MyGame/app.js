/*
GAME RULES:

- The game has 2 players, playing in rounds
- In each turn, a player rolls a dice as many times as he whishes. Each result get added to his ROUND score
- BUT, if the player rolls a 1, all his ROUND score gets lost. After that, it's the next player's turn
- The player can choose to 'Hold', which means that his ROUND score gets added to his GLOBAL score. After that, it's the next player's turn
- The first player to reach 100 points on GLOBAL score wins the game

*/
var scores, roundScore, activePlayer, isGamePlaying, firstRoll, winningPoints;

newGame();

document.querySelector(".btn-roll").addEventListener("click", function () {
    if (isGamePlaying) {
        var dice1 = Math.floor(Math.random() * 6) + 1;
        var dice2 = Math.floor(Math.random() * 6) + 1;
        var diceDOM = document.querySelector(".dice1");
        var diceDOM2 = document.querySelector(".dice2");
        diceDOM.style.display = "block";
        diceDOM.src = "dice-" + dice1 + ".png";
        diceDOM2.style.display = "block";
        diceDOM2.src = "dice-" + dice2 + ".png";

        if (dice1 > 1 && dice2>1) {
            sumOfDices= dice1+dice2;
            roundScore+=sumOfDices;
            document.querySelector("#current-" + activePlayer).textContent = roundScore;

        } else {
            nextPlayer();
        }
        if (firstRoll === dice1 && firstRoll === 6) {
            scores[activePlayer] = 0;
            document.querySelector("#score-" + activePlayer).textContent = 0;
            nextPlayer();
        }
        firstRoll = dice1;
    }

});



document.querySelector(".btn-hold").addEventListener("click", function () {

    if (isGamePlaying) {
        scores[activePlayer] += roundScore;
        document.querySelector("#score-" + activePlayer).textContent = scores[activePlayer];

        if (scores[activePlayer]>100) {
            document.getElementById("name-" + activePlayer).textContent = "WINNER";
            document.querySelector(".player-" + activePlayer + "-panel").classList.remove("active");
            document.querySelector(".player-" + activePlayer + "-panel").classList.add("winner");
            isGamePlaying = false;
            document.querySelector(".dice").style.display = "none";

        }
        else {
            nextPlayer();

        }
    }
});

document.querySelector(".btn-new").addEventListener("click", newGame);

function newGame() {
    scores = [0, 0];
    roundScore = 0;
    activePlayer = 0;
    firstRoll = 0;
    isGamePlaying = true;
    document.getElementById("score-0").textContent = 0;
    document.getElementById("score-1").textContent = 0;

    document.getElementById("current-0").textContent = 0;
    document.getElementById("current-1").textContent = 0;

    document.querySelector(".dice1").style.display = "none";
    document.querySelector(".dice2").style.display = "none";

    document.querySelector(".player-0-panel").classList.remove("active");
    document.querySelector(".player-1-panel").classList.remove("active");
    document.querySelector(".player-1-panel").classList.remove("active");

    document.querySelector(".player-0-panel").classList.remove("winner");
    document.querySelector(".player-1-panel").classList.remove("winner");

    document.querySelector(".player-0-panel").classList.add("active");

    document.getElementById("name-0").textContent = "Player 1";
    document.getElementById("name-1").textContent = "Player 2";



}

function nextPlayer() {
    firstRoll = 0;
    roundScore = 0;

    document.getElementById("current-0").textContent = 0;
    document.getElementById("current-1").textContent = 0;

    activePlayer === 0 ? activePlayer = 1 : activePlayer = 0;

    document.querySelector(".player-0-panel").classList.toggle("active");
    document.querySelector(".player-1-panel").classList.toggle("active");

    document.querySelector(".dice1").style.display = "none";
    document.querySelector(".dice2").style.display = "none";

}