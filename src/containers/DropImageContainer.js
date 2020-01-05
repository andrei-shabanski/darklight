import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import ScreenLock from '../components/ScreenLock';
import { extractFileFromDataTransfer } from '../utils/files';
import { uploadImage } from '../actions/desk/media';

// Note that dragstart and dragend events are not fired when dragging a file into the browser from the OS.
// (https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop)

// So we will set up a timer to hide droparea when dragover event will no longer fire
class DropImageContainer extends React.Component {
  static propTypes = {
    onUploadImage: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      dropareaHiddingTimerID: null,
    };

    this.dragImageHandle = this.dragImageHandle.bind(this);
    this.dropImageHandle = this.dropImageHandle.bind(this);
  }

  componentDidMount() {
    window.addEventListener('dragover', this.dragImageHandle, false);
    window.addEventListener('drop', this.dropImageHandle, false);
  }

  componentWillUnmount() {
    window.removeEventListener('dragover', this.dragImageHandle);
    window.removeEventListener('drop', this.dropImageHandle);
  }

  dragImageHandle(event) {
    event.preventDefault();

    const { dropareaHiddingTimerID } = this.state;

    const dataTypes = event.dataTransfer.types;
    if (!dataTypes.length || dataTypes[0] !== 'Files') {
      return;
    }

    // set up a new timer
    const dragoverFiredAt = new Date();
    const timerId = setInterval(() => {
      const now = new Date();
      if (now - dragoverFiredAt < 400) {
        return;
      }

      clearInterval(timerId);
      this.setState({ dropareaHiddingTimerID: null });
    }, 100);

    this.setState({ dropareaHiddingTimerID: timerId });

    // clean up an old timer
    if (dropareaHiddingTimerID) {
      clearInterval(dropareaHiddingTimerID);
    }
  }

  dropImageHandle(event) {
    event.preventDefault();
    const { onUploadImage } = this.props;
    const file = extractFileFromDataTransfer(event.dataTransfer);
    if (file) {
      onUploadImage(file);
    }
  }

  render() {
    const { dropareaHiddingTimerID } = this.state;

    if (!dropareaHiddingTimerID) {
      return null;
    }

    return <ScreenLock message="Drop an image here" iconName="image" />;
  }
}

const mapDispatchToProps = dispatch => ({
  onUploadImage: file => dispatch(uploadImage(file)),
});

export default connect(null, mapDispatchToProps)(DropImageContainer);
