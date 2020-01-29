import mustBe from '@agte/type/mustBe';
import Item from '@agte/bg-engine/Item';

export default class Cell extends Item {
  #mark;

  get mark() {
    return this.#mark;
  }

  set mark(value) {
    mustBe.string(value);
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
