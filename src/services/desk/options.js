const DEFAULT_OPTIONS = {
  scale: 1,
  size: 5,
  textSize: 18,
  color: '#ff0000',
};

export default class Options {
  constructor(parent = null) {
    this.parent = parent;

    this.options = parent ? { ...parent.options } : DEFAULT_OPTIONS;
  }

  clone() {
    const parent = this.parent || this;
    return new Options(parent);
  }

  zoomIn(value) {
    return value * this.scale;
  }

  zoomOut(value) {
    return value / this.scale;
  }

  get scale() {
    return this.parent ? this.parent.scale : this.options.scale;
  }

  set scale(value) {
    if (this.parent) {
      this.parent.scale = value;
    } else {
      this.options.scale = value;
    }
  }

  get size() {
    return this.options.size;
  }

  set size(value) {
    this.options.size = value;
  }

  get textSize() {
    return this.options.textSize;
  }

  set textSize(value) {
    this.options.textSize = value;
  }

  get color() {
    return this.options.color;
  }

  set color(value) {
    this.options.color = value;
  }
}
