import {InteractiveShape} from "./base";


export default class Text extends InteractiveShape {
  constructor(canvasContext, point, options, commitCallback) {
    super(canvasContext, point, options, commitCallback);

    var self = this;
    this.text = '';

    this.keybindings = [{
      code: 'Enter',
      ctrl: true,
      callback: this.commit.bind(this)
    }, {
      code: 'Escape',
      callback: this.commit.bind(this)
    }, {
      code: 'Backspace',
      callback: function (event) {
        if (self.text.length) {
          self.update({text: self.text.slice(0, self.text.length - 1)});
        }
      }
    }, {
      callback: function (event) {
        var char;

        if (event.which === 13) {
          char = '\n';
        } else if (event.which < 32) {
          return;
        } else {
          char = event.key;
        }

        if (char.length) {
          self.update({text: self.text + char});
        }
      }
    }];

    this.draw(); // draw the border
  }

  isEmpty() {
    return !this.text.length;
  }

  onCanvasMouseDown(event) {
    this.commit();
  }

  draw(scale) {
    super.draw(scale);

    const lines = this.text.split('\n');
    const textHeight = this.options.textSize;

    this.canvasCtx.textBaseline = 'top';
    this.canvasCtx.fillStyle = this.options.color;
    this.canvasCtx.font = Math.round(this.options.textSize) + 'px arial';

    lines.forEach(function (line, index) {
      this.canvasCtx.fillText(line, this.startPoint.x, this.startPoint.y + textHeight * index);
    }.bind(this));

    // draw a border
    if (!this.committed) {
      var maxLine = lines.sort(function (line1, line2) {
        return line2.length - line1.length
      })[0];
      var textWith = this.canvasCtx.measureText(maxLine).width;
      this.canvasCtx.setLineDash([3]);
      this.canvasCtx.strokeStyle = '#000000';
      this.canvasCtx.lineWidth = 1;
      this.canvasCtx.strokeStyle = this.options.color;
      this.canvasCtx.strokeRect(
        this.startPoint.x - 4,
        this.startPoint.y - 4,
        textWith + 8,
        this.options.zoomIn(this.options.textSize * lines.length + 8)
      );
    }
  }

}
