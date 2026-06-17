export type CaroSide = "X" | "O";

export type CaroSquare = CaroSide | null;

export type CaroGameStatus = "playing" | "won" | "draw";

export type CaroGameState = {
  board: CaroSquare[][],
  turn: number,
  turnOf: CaroSide,
  status: CaroGameStatus,
  winner: CaroSide | null
}

const boardSize = 15;
const winCondition = 5;

export function newCaroGame(playFirst: CaroSide): CaroGameState {
  const emptyBoard: CaroSquare[][] = Array.from(
    { length: boardSize },
    () => Array(boardSize).fill(null)
  );
  return {
    board: emptyBoard,
    turn: 1,
    turnOf: playFirst,
    status: "playing",
    winner: null
  }
}

export function playCaroTurn(state: CaroGameState, side: CaroSide, x: number, y: number): CaroGameState | false {
  if(state.status !== "playing") return false;
  if(side !== state.turnOf) return false;
  if(!Number.isInteger(x) || !Number.isInteger(y)) return false;
  if(x < 0 || x >= boardSize || y < 0 || y >= boardSize) return false;
  if(state.board[x][y] !== null) return false;

  const newBoard = state.board.map(row => [...row]);
  newBoard[x][y] = side;

  const won = checkWinAt(newBoard, x, y, side);
  const isDraw = !won && state.turn >= boardSize * boardSize;

  //printBoard(newBoard);

  return {
    board: newBoard,
    turn: state.turn + 1,
    turnOf: state.turnOf === "X" ? "O" : "X",
    status: won ? "won" : isDraw ? "draw" : "playing",
    winner: won ? side : null
  };
}

function checkWinAt(board: CaroSquare[][], x: number, y: number, side: CaroSide): boolean {
  const directions = [
    [0, 1],   // ngang
    [1, 0],   // dọc
    [1, 1],   // chéo xuống
    [1, -1],  // chéo lên
  ];

  function inBounds(x: number, y: number) {
    return x >= 0 && x < boardSize && y >= 0 && y < boardSize;
  }

  for (const [dx, dy] of directions) {
    let count = 1;

    for (const sign of [1, -1]) {
      let nx = x + dx * sign;
      let ny = y + dy * sign;

      while (inBounds(nx, ny) && board[nx][ny] === side) {
        count++;
        nx += dx * sign;
        ny += dy * sign;
      }
    }

    if (count >= winCondition) return true;
  }

  return false;
}

export function printBoard(board: CaroSquare[][]) {
  const size = board.length;

  const line = "+" + "-".repeat(size * 2 - 1) + "+";

  console.log(line);

  for (const row of board) {
    console.log(
      "|" +
      row.map(v => (v === null ? "." : v)).join(" ") +
      "|"
    );
  }

  console.log(line);
}