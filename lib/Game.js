import mustBe from '@agte/type/mustBe';
import BasicGame from '@agte/bg-engine';
import Items from '@agte/bg-engine/Items';
import Cell from './Cell.js';

const DEFAULT_CELLS = [
  { id: '0:0' },
  { id: '0:1' },
  { id: '0:2' },
  { id: '1:0' },
  { id: '1:1' },
  { id: '1:2' },
  { id: '2:0' },
  { id: '2:1' },
  { id: '2:2' },
];

const DEFAULT_PLAYERS = [
  { id: 'x', actions: ['mark'] },
  { id: 'o' },
];

const WINNING_LINES = [
  ['1:1', '0:0', '2:2'],
  ['1:1', '0:2', '2:0'],
  ['1:1', '0:1', '2:1'],
  ['1:1', '1:0', '1:2'],
  ['0:0', '0:1', '0:2'],
  ['0:0', '1:0', '2:0'],
  ['2:2', '2:1', '2:0'],
  ['2:2', '1:2', '0:2'],
];

export default class Game extends BasicGame {
  constructor({ cells = DEFAULT_CELLS, players = DEFAULT_PLAYERS, ...others } = {}) {
    super({ players, ...others });
    this.cells = new Items(cells, Cell);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      cells: this.cells.toJSON(),
    };
  }

  mark(player, { id }, diff) {
    mustBe.nonEmptyString(id);
    const cell = this.cells.get(id);
    if (!cell) {
      throw new Error('Wrong cell');
    }
    if (cell.mark) {
      throw new Error('The cell is already marked');
    }

    const otherPlayer = this.players.nextAfter(player.id);

    cell.mark = player.id;
    diff.push('cells', cell);
    player.actions.delete('mark');
    diff.push('players', player);

    if (this.getWinningLine()) {
      player.score = 1;
      this.finished = true;
      diff.set('finished', this.finished);
    } else if (this.cells.toArray().every(tile => tile.mark)) {
      player.score = 0.5;
      otherPlayer.score = 0.5;
      this.finished = true;
      diff.set('finished', this.finished);
    } else {
      otherPlayer.actions.add('mark');
      diff.push('players', otherPlayer);
    }
  }

  getWinningLine() {
    return WINNING_LINES.find(([a, b, c]) => {
      const A = this.cells.get(a);
      const B = this.cells.get(b);
      const C = this.cells.get(c);
      return A.mark !== '' && A.mark === B.mark && B.mark === C.mark;
    });
  }
}
