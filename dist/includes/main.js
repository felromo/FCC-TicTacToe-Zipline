angular.module('tictacmod', [])
.factory('gameFactory', [function () {
  game = {};
  game.player = {piece: "X", className: "game-piece-x"};
  game.ai = {piece: "O", className: "game-piece-o"};
  game.tiles = [];
  game.inProgress = false;

  game.setBoard = function () {
    // should run before every match to ensure board is clean
    for (var i = 0; i < 9; i++) {
      game.tiles[i] = {
          position: i,  // is the same as its array index
          occupied: false,

          occupant: null   // takes a player object. player or ai
      };
    }
  };

  game.occupyTile = function (tile, occupant) {
    // checks for whether or not the given tile is occupied are performed elsewhere (see: isTileOccupied)
    tile.occupied = true;
    tile.occupant = occupant;
  };

  game.isTileOccupied = function (tile) {
    return tile.occupied;
  };

  game.getEmptyTiles = function () {
    if (game.referee(game.ai) || game.referee(game.player)) {
      return [];
    }
    return game.tiles.filter(function (value, index) {
      return !value.occupied;
    });
  };

  game.isBoardFull = function () {
    return !game.tiles.find(function (value) {
      // if occupied is false return true (meaning there are blocks not used still)
      return !value.occupied;
    });
  };

  game.changePiece = function (piece) {
    if (piece === "X") {
      game.player.piece = "X";
      game.player.className = "game-piece-" + game.player.piece;
      game.ai.piece = "O";
      game.ai.className = "game-piece-" + game.ai.piece;
    }
    else {
      game.player.piece = "O";
      game.player.className = "game-piece-" + game.player.piece;
      game.ai.piece = "X";
      game.ai.className = "game-piece-" + game.ai.piece;
    }
  };

  game.playerMove = function (id) {
    console.log(id);
    var tile = game.tiles[Number(id)];
    if (game.isTileOccupied(tile)) {
      console.log("is being used by: " + tile.occupant);
    } else {
      console.log("is empty");
      game.occupyTile(tile, game.player);
    }
  };

  game.aiReasoning = function () {
    return game.miniMaxImplementation(1, game.ai).tile;
  };

  game.evaluate = function () {
    // has to run through all the line combinations Total: 8
    var score = 0;
    score += game.evaluateLine(0,3,6);
    score += game.evaluateLine(1,4,7);
    score += game.evaluateLine(2,5,8);
    score += game.evaluateLine(0,1,2);
    score += game.evaluateLine(3,4,5);
    score += game.evaluateLine(6,7,8);
    score += game.evaluateLine(0,4,8);
    score += game.evaluateLine(6,4,2);
    return score;
  };

  game.evaluateLine = function (c1, c2, c3) {
    var score = 0;
    if (game.tiles[c1].occupant == game.ai) {
      score = 1;
    } else if (game.tiles[c1].occupant == game.player) {
      score = -1;
    }

    if (game.tiles[c2].occupant == game.ai) {
      if (score == 1) {
        score = 10;
      } else if (score == -1) {
        return 0;
      } else {
        score = 1;
      }
    } else if (game.tiles[c2].occupant == game.player) {
      if (score == -1) {
        score = -10;
      } else if (score == 1) {
        return 0;
      } else {
        score = -1;
      }
    }

    if (game.tiles[c3].occupant == game.ai) {
      if (score > 0) {
        score *= 10;
      } else if (score < 0) {
        return 0;
      } else {
        score = 1;
      }
    } else if (game.tiles[c3].occupant == game.player) {
      if (score < 0) {
        score *= 10;
      } else if (score > 1) {
        return 0;
      } else {
        score = -1;
      }
    }
    return score;
  };

  game.miniMaxImplementation = function (depth, occupant) {
    // generate moves
    var unused_tiles = game.getEmptyTiles();
    var bestScore = (occupant == game.ai) ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
    var currentScore = 0;
    var tile = -1;

    if (unused_tiles.length === 0 || depth === 0) {
      bestScore = game.evaluate();
    } else {
      unused_tiles.forEach(function (current_tile) {
        game.tiles[current_tile.position].occupant = game.ai;
        game.tiles[current_tile.position].occupied = true;
        if (occupant == game.ai) {
          currentScore = game.miniMaxImplementation(depth - 1, game.player).bestScore;
          if (currentScore > bestScore) {
            bestScore = currentScore;
            tile = current_tile;
          }
        } else {
          currentScore = game.miniMaxImplementation(depth -1, game.ai).bestScore;
          if (currentScore < bestScore) {
            bestScore = currentScore;
            tile = current_tile;
          }
        }
        game.tiles[current_tile.position].occupant = null;
        game.tiles[current_tile.position].occupied = false;
      });
    }

    return {bestScore: bestScore, tile: tile};
    // if there are no more moves are the depth is 0 run evaluate function and store in bestScore
    // else for every move in moves do the same thing but for different variation depending on the occupant
    // replace game.tile.occupant with the passed in occupant 
    // if player is the occupant run minimax with depth - 1 and opposite player as occupant and store that value on currentScore
    // if currentScore is better than bestScore replace it, and replace bestRow and bestCol with the current tile
    // else if the opponent is the occupant run minimax with depth -1 and opposite player as occupant and store that value on currentScore
    // if current score is less than bestScore store it, and store the tile in bestRow, bestCol
    // after all that return game.tiles to being empty
    // finally return bestSCore with the best tile
  };

  game.aiMove = function () {
    var tmp = game.aiReasoning();
    if (tmp !== null) game.occupyTile(tmp, game.ai);
  };

  game.referee = function (player) {
    // TODO: implement how to check if player/ai has won (3 in a row)
    // check for top row
    if (game.tiles[0].occupant == player && game.tiles[3].occupant == player && game.tiles[6].occupant == player)
      return player;
      // console.log("winner top row!");
    // check for mid row
    if (game.tiles[1].occupant == player && game.tiles[4].occupant == player && game.tiles[7].occupant == player)
      return player;
      // console.log("winner mid row!");
    // check for bot row
    if (game.tiles[2].occupant == player && game.tiles[5].occupant == player && game.tiles[8].occupant == player)
      return player;
      // console.log("winner bot row!");
    // check for first col
    if (game.tiles[0].occupant == player && game.tiles[1].occupant == player && game.tiles[2].occupant == player)
      return player;
      // console.log("winner first col!");
    // check for second col
    if (game.tiles[3].occupant == player && game.tiles[4].occupant == player && game.tiles[5].occupant == player)
      return player;
      // console.log("winner second col!");
    // check for third col
    if (game.tiles[6].occupant == player && game.tiles[7].occupant == player && game.tiles[8].occupant == player)
      return player;
      // console.log("winner third col!");
    // check for first diagonal (top left - bottom right)
    if (game.tiles[0].occupant == player && game.tiles[4].occupant == player && game.tiles[8].occupant == player)
      return player;
      // console.log("winner first diagonal!");
    // check for second diagonal (top right - bottom left)
    if (game.tiles[6].occupant == player && game.tiles[4].occupant == player && game.tiles[2].occupant == player)
      return player;
      // console.log("winner second diagonal!");
    return null;
  };

  return game;
}])
.controller('gameController',['gameFactory', function (gameFactory) {
  // TODO: Bug where once you win you dont get to see the final piece bieng render before the winner display alert
  var self = this;

  self.init = function () {
    gameFactory.setBoard();
    gameFactory.aiMove();
  };

  self.getTile = function (id) {
    return game.tiles[id];
  };

  self.getPlayerPiece = function () {
    return game.player.piece;
  };
  self.getPlayerClass = function () {
    return game.player.className;
  };
  self.makePlayerMove = function (event) {
    // dont apply any logic if the tile is already occupied
    if (!game.isTileOccupied(game.tiles[Number(event.target.id)])) {
      gameFactory.playerMove(event.target.id);
      var result = gameFactory.referee(game.player);
      if (result !== null || gameFactory.isBoardFull()) {
        if (result !== null) alert("Player won with: " + game.player.piece);
        else alert("Draw!");
        // gameFactory.setBoard();
      self.init();
      }

      // if the player didnt win after their move, have the ai move and check if it won
      gameFactory.aiMove();
      result = gameFactory.referee(game.ai);
      if (result !== null || gameFactory.isBoardFull()) {
        if (result !== null) alert("Ai Won with: " + game.ai.piece);
        else alert("Draw!");
        // gameFactory.setBoard();
        self.init();
      }
    }
  };

  self.switchPieces = function (piece) {
    gameFactory.changePiece(piece);
  };

  self.init();


}]);
