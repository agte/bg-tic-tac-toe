const test = require('ava');

let Game;

test.before(async (t) => {
  Game = (await import('../lib/Game.js')).default;
});

test('constructor: default args', (t) => {
  const game = new Game();
  t.is(game.players.size, 2);
  t.is(game.cells.size, 9);
});

test('method "move": bad arg "playerId"', (t) => {
  const game = new Game();
  t.throws(() => game.move(0, 'mark', { id: '1:1' }));
  t.throws(() => game.move('X', 'mark', { id: '1:1' }));
});

test('method "move": bad arg "action"', (t) => {
  const game = new Game();
  t.throws(() => game.move('x', null, { id: '1:1' }));
  t.throws(() => game.move('x', 'go', { id: '1:1' }));
});

test('method "move": bad arg "options"', (t) => {
  const game = new Game();
  t.throws(() => game.move('x', 'mark', null));
  t.throws(() => game.move('x', 'mark', {}));
  t.throws(() => game.move('x', 'mark', { id: 'abc' }));
});

test('method "move": good args', (t) => {
  const game = new Game();
  t.notThrows(() => game.move('x', 'mark', { id: '1:1' }));
});

test('method "toJSON"', (t) => {
  const game = new Game();
  game.move('x', 'mark', { id: '0:2' });
  const json = game.toJSON();
  t.deepEqual(json.players, [{ id: 'x', actions: [], score: 0 }, { id: 'o', actions: ['mark'], score: 0 }]);
  t.deepEqual(json.cells[0], { id: '0:0', mark: '' });
  t.deepEqual(json.cells[2], { id: '0:2', mark: 'x' });
});

test('move order', (t) => {
  const game = new Game();
  t.throws(() => game.move('o', 'mark', { id: '1:1' }));
  game.move('x', 'mark', { id: '1:1' });
  game.move('o', 'mark', { id: '1:2' });
  t.throws(() => game.move('o', 'mark', { id: '0:1' }));
});

test('disallowed cell', (t) => {
  const game = new Game();
  game.move('x', 'mark', { id: '1:1' });
  game.move('o', 'mark', { id: '1:2' });
  game.move('x', 'mark', { id: '2:1' });
  t.throws(() => game.move('o', 'mark', { id: '1:2' }));
});

test('full play: draw', (t) => {
  const game = new Game();
  game.move('x', 'mark', { id: '1:1' });
  game.move('o', 'mark', { id: '0:2' });
  game.move('x', 'mark', { id: '0:1' });
  game.move('o', 'mark', { id: '2:1' });
  game.move('x', 'mark', { id: '2:2' });
  game.move('o', 'mark', { id: '0:0' });
  game.move('x', 'mark', { id: '1:0' });
  game.move('o', 'mark', { id: '1:2' });
  game.move('x', 'mark', { id: '2:0' });
  t.true(game.finished);
  t.is(game.players.get('x').score, 0.5);
  t.is(game.players.get('o').score, 0.5);
});

test('full play: x wins', (t) => {
  const game = new Game();
  game.move('x', 'mark', { id: '1:1' });
  game.move('o', 'mark', { id: '1:2' });
  game.move('x', 'mark', { id: '2:1' });
  game.move('o', 'mark', { id: '0:1' });
  game.move('x', 'mark', { id: '2:2' });
  game.move('o', 'mark', { id: '0:0' });
  game.move('x', 'mark', { id: '2:0' });
  t.true(game.finished);
  t.is(game.players.get('x').score, 1);
  t.is(game.players.get('o').score, 0);
});

test('diff: intermediate move', (t) => {
  const game = new Game();
  const diff = game.move('x', 'mark', { id: '1:1' });
  const expectedView = {
    players: [{ id: 'x', actions: [], score: 0 }, { id: 'o', actions: ['mark'], score: 0 }],
    cells: [{ id: '1:1', mark: 'x' }],
  };
  t.deepEqual(diff.view('x'), expectedView);
  t.deepEqual(diff.view('o'), expectedView);
});

test('diff: finish move', (t) => {
  const game = new Game();
  game.move('x', 'mark', { id: '1:1' });
  game.move('o', 'mark', { id: '1:2' });
  game.move('x', 'mark', { id: '2:1' });
  game.move('o', 'mark', { id: '0:1' });
  game.move('x', 'mark', { id: '2:2' });
  game.move('o', 'mark', { id: '0:0' });
  const diff = game.move('x', 'mark', { id: '2:0' });
  const expectedView = {
    players: [{ id: 'x', actions: [], score: 1 }],
    cells: [{ id: '2:0', mark: 'x' }],
    finished: true,
  };
  t.deepEqual(diff.view('x'), expectedView);
  t.deepEqual(diff.view('o'), expectedView);
});

test('state', (t) => {
  const game = new Game();
  const state = game.state;
  const view = state.view('x');
  t.truthy(view.players);
  t.truthy(view.cells);
  t.is(view.finished, false);
});
