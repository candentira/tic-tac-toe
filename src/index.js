import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  let className = 'square ';
  if (props.isWinner) {
    className += 'winner';
  }
  return (
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const isWinner = this.props.winner && this.props.winner.includes(i);
    return (
      <Square 
        key={i} 
        isWinner={isWinner}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />);
  }

  render() {
    const size = Math.sqrt(this.props.squares.length);
    const row = (initial) => Array(size).fill(1).map((el, i) => {
      return this.renderSquare(initial * size + i);
    });
    const columns = Array(size).fill(1).map((el, i) => 
      <div className="board-row" key={i}>{row(i)}</div>
    );
    return <div>{columns}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        id: 0,
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      sortHistoryAsc: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = this.state.sortHistoryAsc ? history[history.length - 1] : history[0];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    const newHistoryStep = [{
      id: history.length,
      squares: squares,
      changedSquare: i
    }];
    const newHistory = this.state.sortHistoryAsc ? history.concat(newHistoryStep) : newHistoryStep.concat(history);
    this.setState({
      history: newHistory,
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  reverseHistory() {
    this.setState({
      history: this.state.history.slice().reverse(),
      sortHistoryAsc: !this.state.sortHistoryAsc
    });
  }

  render() {
    let history = this.state.history;
    const current = history.find((el) => el.id === this.state.stepNumber);
    const winner = calculateWinner(current.squares);
    const moves = history.map((step, move) => {     
      let desc = step.id ? 
        `Go to move # ${step.id} (${step.changedSquare % 3 + 1}, ${Math.floor(step.changedSquare / 3) + 1})` :
        'Go to game start';
      if (step.id === this.state.stepNumber) {
        desc = <strong>{desc}</strong>;
      }
      return (
        <li key={step.id}>
          <button onClick={() => this.jumpTo(step.id)}>
            {desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner)  {
      status = 'Winner: ' + (this.state.xIsNext ? 'O' : 'X') + winner;
    } else if (current.squares.filter(el => !el).length === 0) {
      status = 'It\'s a draw.';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            winner={winner}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
          <button onClick={() => this.reverseHistory()}>sort</button>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return null;
}