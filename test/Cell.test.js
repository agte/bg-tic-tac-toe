import test from 'ava';
import Cell from '../src/Cell.js';

test('constructor: no args', (t) => {
  t.throws(() => new Cell());
});

test('constructor: bad args', (t) => {
  t.throws(() => new Cell({ id: 'abc', mark: 0 }));
});

test('property "mark": default value', (t) => {
  const cell = new Cell({ id: 'abc' });
  t.is(cell.mark, '');
});

test('property "mark": initial value', (t) => {
  const cell = new Cell({ id: 'abc', mark: 'x' });
  t.is(cell.mark, 'x');
});

test('property "mark": manipulating', (t) => {
  const cell = new Cell({ id: 'abc' });
  t.throws(() => { cell.mark = 0; });
  cell.mark = 'o';
  t.is(cell.mark, 'o');
});

test('method "toJSON"', (t) => {
  const cell = new Cell({ id: 'abc', mark: 'x' });
  t.deepEqual(cell.toJSON(), { id: 'abc', mark: 'x' });
});
