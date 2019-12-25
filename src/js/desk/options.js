export default class Options {
  constructor(parent) {
    var self = this;

    this._parent = parent;

    if (!!parent) {
      this._globalOptions = parent._globalOptions;
      this._localOptions = Object.assign({}, parent._localOptions);
    } else {
      this._globalOptions = {
        scale: 1
      };
      this._localOptions = {
        size: 5,
        textSize: 18,
        color: '#ff0000',
      };
    }

    Object.defineProperties(this, {
      scale: {
        get: function () {
          return self._globalOptions.scale;
        },
        set: function (value) {
          self._globalOptions.scale = value
        }
      },
      size: {
        get: function () {
          return self._localOptions.size;
        },
        set: function (value) {
          self._localOptions.size = value
        }
      },
      textSize: {
        get: function () {
          return self._localOptions.textSize;
        },
        set: function (value) {
          self._localOptions.textSize = value
        }
      },
      color: {
        get: function () {
          return self._localOptions.color;
        },
        set: function (value) {
          self._localOptions.color = value
        }
      },
    })
  }

  clone() {
    var parent = this._parent || this;
    return new Options(parent);
  }

  zoomIn(value) {
    return value * this.scale;
  }

  zoomOut(value) {
    return value / this.scale;
  }

}
