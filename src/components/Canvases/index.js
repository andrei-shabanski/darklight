import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { fillIn, setDrawingDeskContainerSize, setScale } from '../../actions/desk';
import './canvases.scss';

const Canvases = ({
  activeScale,
  containerWidth,
  containerHeight,
  width,
  top,
  left,
  setScale,
  setCanvasContainerSize,
}) => {
  const windowWheeled = event => {
    const onCanvas = event.target.closest('canvas') !== null;
    event.preventDefault();

    if (event.ctrlKey && onCanvas) {
      if (event.deltaY > 0) {
        setScale(activeScale - 0.1);
      } else {
        setScale(activeScale + 0.1);
      }
    }
  };

  const windowResized = () => fillIn();

  const refCanvasContainer = element => {
    if (!element) return;
    const { width, height } = element.getBoundingClientRect();
    setCanvasContainerSize(width | 0, height | 0);
  };

  useEffect(() => {
    document.body.addEventListener('mousewheel', windowWheeled, { passive: false });
    window.addEventListener('resize', windowResized, { passive: false });

    return () => {
      document.body.removeEventListener('mousewheel', windowWheeled);
      window.removeEventListener('resize', windowResized);
    };
  });

  const canvasStyle = {
    width,
    left,
    top,
  };

  return (
    <div ref={refCanvasContainer} className="canvases">
      <canvas id="imageCanvas" width={containerWidth} height={containerHeight} style={canvasStyle}>
        Your browser is not supported
      </canvas>
      <canvas
        id="drawingCanvas"
        width={containerWidth}
        height={containerHeight}
        style={canvasStyle}
      />
    </div>
  );
};

const mapStateToProps = state => ({
  activeScale: state.desk.options.scale,
  containerWidth: state.desk.container.width,
  containerHeight: state.desk.container.height,
  width: state.desk.canvases.width,
  top: state.desk.canvases.top,
  left: state.desk.canvases.left,
});

const mapDispatchToProps = dispatch => ({
  setScale: scale => dispatch(setScale(scale)),
  setCanvasContainerSize: (width, height) => dispatch(setDrawingDeskContainerSize(width, height)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Canvases);
