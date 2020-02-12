const test = require('ava');

let Game;

test.before(async (t) => {
  Game = (await import('../lib/Game.js')).default;
});

test('method "move": bad arg "playerId"', (t) => {
  const game = Game.create();
  t.throws(() => game.move(0, 'mark', { id: '4' }));
  t.throws(() => game.move('X', 'mark', { id: '4' }));
});

test('method "move": bad arg "action"', (t) => {
  const game = Game.create();
  t.throws(() => game.move('x', null, { id: '4' }));
});

test('method "move": bad arg "params"', (t) => {
  const game = Game.create();
  t.throws(() => game.move('x', 'mark', null));
  t.throws(() => game.move('x', 'mark', {}));
  t.throws(() => game.move('x', 'mark', { id: 'abc' }));
});

test('method "move": good args', (t) => {
  const game = Game.create();
  t.notThrows(() => game.move('x', 'mark', { id: '4' }));
});

test('method "toJSON"', (t) => {
  const game = Game.create();
  game.move('x', 'mark', { id: '2' });
  const json = game.toJSON();
  t.deepEqual(json.currentPlayer, 'o');
  t.deepEqual(json.cells[0], '');
  t.deepEqual(json.cells[2], 'x');
  const gameRestored = new Game(json);
  t.pass();
});

test('move order', (t) => {
  const game = Game.create();
  t.throws(() => game.move('o', 'mark', { id: '4' }));
  game.move('x', 'mark', { id: '4' });
  game.move('o', 'mark', { id: '5' });
  t.throws(() => game.move('o', 'mark', { id: '1' }));
});

test('disallowed cell', (t) => {
  const game = Game.create();
  game.move('x', 'mark', { id: '4' });
  game.move('o', 'mark', { id: '5' });
  game.move('x', 'mark', { id: '7' });
  t.throws(() => game.move('o', 'mark', { id: '5' }));
});

test('full play: draw', (t) => {
  const game = Game.create();
  game.move('x', 'mark', { id: '4' });
  game.move('o', 'mark', { id: '2' });
  game.move('x', 'mark', { id: '1' });
  game.move('o', 'mark', { id: '7' });
  game.move('x', 'mark', { id: '8' });
  game.move('o', 'mark', { id: '0' });
  game.move('x', 'mark', { id: '3' });
  game.move('o', 'mark', { id: '5' });
  game.move('x', 'mark', { id: '6' });
  t.true(game.finished);
  t.is(game.winner, '');
});

test('full play: x wins', (t) => {
  const game = Game.create();
  game.move('x', 'mark', { id: '4' });
  game.move('o', 'mark', { id: '5' });
  game.move('x', 'mark', { id: '7' });
  game.move('o', 'mark', { id: '1' });
  game.move('x', 'mark', { id: '8' });
  game.move('o', 'mark', { id: '0' });
  game.move('x', 'mark', { id: '6' });
  t.true(game.finished);
  t.is(game.winner, 'x');
});

test('diff: intermediate move', (t) => {
  const game = Game.create();
  const diff = game.move('x', 'mark', { id: '4' });
  const expectedView = {
    cells: ['', '', '', '', 'x', '', '', '', ''],
    currentPlayer: 'o',
  };
  t.deepEqual(diff.view('x'), expectedView);
  t.deepEqual(diff.view('o'), expectedView);
});

test('diff: finish move', (t) => {
  const game = Game.create();
  game.move('x', 'mark', { id: '4' });
  game.move('o', 'mark', { id: '5' });
  game.move('x', 'mark', { id: '7' });
  game.move('o', 'mark', { id: '1' });
  game.move('x', 'mark', { id: '8' });
  game.move('o', 'mark', { id: '0' });
  const diff = game.move('x', 'mark', { id: '6' });
  const expectedView = {
    cells: ['o', 'o', '', '', 'x', 'o', 'x', 'x', 'x'],
    finished: true,
    winner: 'x',
  };
  t.deepEqual(diff.view('x'), expectedView);
  t.deepEqual(diff.view('o'), expectedView);
});

test('state', (t) => {
  const game = Game.create();
  const state = game.getState();
  const view = state.view('x');
  t.deepEqual(view, {
    cells: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'x',
    finished: false,
    winner: '',
  });
});
