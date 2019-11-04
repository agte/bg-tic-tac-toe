import { assert } from '@agte/type';
import { Item } from '@agte/bg-engine';

export default class Cell extends Item {
  #mark;

  get mark() {
    return this.#mark;
  }

  set mark(value) {
    assert.string(value);
    this.#mark = value;
  }

  constructor({ mark = '', ...others } = {}) {
    super(others);
    this.mark = mark;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      mark: this.mark,
    };
  }
}
