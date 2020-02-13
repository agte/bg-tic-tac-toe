import { createRequire } from 'module';
import Ajv  from 'ajv';
import mustBe from '@agte/type/mustBe';
import State from '@agte/bg-engine/State';

const require = createRequire(import.meta.url);
const dataSchema = require('./DataSchema.json');

const ajv = new Ajv();
const validate = ajv.compile(dataSchema);

const WINNING_COMBINATIONS = [
  [0, 4, 8],
  [2, 4, 6],
  [1, 2, 7],
  [3, 4, 5],
  [0, 1, 2],
  [0, 3, 6],
  [6, 7, 8],
  [2, 5, 8],
];

export default class Game {
  constructor(data) {
    const valid = validate(data);
    if (!valid) {
      throw new Error(`Bad params: ${JSON.stringify(validate.errors)}`);
    }

    const { cells, currentPlayer, finished, winner } = data;
    this.cells = cells;
    this.currentPlayer = currentPlayer;
    this.finished = finished;
    this.winner = winner;
  }

  toJSON() {
    return {
      cells: this.cells,
      currentPlayer: this.currentPlayer,
      finished: this.finished,
      winner: this.winner,
    };
  }

  /**
   * @typedef {object} PlayerData
   * @property {string} id
   * @property {number} score
   */

  /**
   * @returns {Array.<PlayerData>}
   */
  getPlayers() {
    return [
      { id: 'x', score: this.winner === 'x' ? 1 : 0 },
      { id: 'o', score: this.winner === 'o' ? 1 : 0 },
    ];
  }

  /**
   * @returns {State} Full state
   */
  getState() {
    const state = new State();
    state.set('cells', this.cells);
    state.set('currentPlayer', this.currentPlayer);
    state.set('finished', this.finished);
    state.set('winner', this.winner);
    return state;
  }

  /**
   * @param {string} player
   * @param {string} action
   * @param {object} params
   * @param {string} params.id
   * @returns {State} Diff state
   */
  move(player, action, { id }) {
    mustBe.nonEmptyString(player);
    mustBe.nonEmptyString(action);
    mustBe.nonEmptyString(id);

    if (player !== 'x' && player !== 'o') {
      throw new Error('Wrong player id');
    }

    if (this.finished) {
      throw new Error('The game is finished');
    }

    if (player !== this.currentPlayer) {
      throw new Error('Disallowed action');
    }

    const diff = new State(); // partial state

    if (this.cells[id] === undefined) {
      throw new Error('Wrong cell');
    }

    if (this.cells[id] !== '') {
      throw new Error('The cell is already marked');
    }

    this.cells[id] = player;
    diff.set('cells', this.cells);

    if (this.getWinningLine()) {
      this.winner = player;
      this.finished = true;
      diff.set('winner', this.winner);
      diff.set('finished', this.finished);
    } else if (this.cells.every((mark) => !!mark)) {
      this.finished = true;
      diff.set('finished', this.finished);
    } else {
      this.currentPlayer = player === 'x' ? 'o' : 'x';
      diff.set('currentPlayer', this.currentPlayer);
    }

    return diff;
  }

  static create() {
    const state = {
      cells: ['', '', '', '', '', '', '', '', ''],
      currentPlayer: 'x',
      finished: false,
      winner: '',
    };
    return new this(state);
  }

  /**
   * @private
   */
  getWinningLine() {
    return WINNING_COMBINATIONS.find(([a, b, c]) => {
      const A = this.cells[a];
      const B = this.cells[b];
      const C = this.cells[c];
      return A && (A === B) && (B === C);
    });
  }
}
