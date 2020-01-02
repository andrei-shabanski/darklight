import React from 'react';
import PropTypes from 'prop-types';

import Modal from '../Modal';
import './modal.scss';

const WelcomeModal = ({ opened, onUploadImage }) => {
  const fileUpload = e => {
    const { files } = e.target;
    if (files.length) {
      const file = e.target.files[0];
      onUploadImage(file);
    }
  };

  return (
    <Modal id="welcome" isOpen={opened}>
      <Modal.Body>
        <section className="getting-started">
          <h1 className="center">Welcome</h1>
          <p className="center">
            Click <kbd>Ctrl+V</kbd> to paste an image from the clipboard
          </p>
          <p className="center">or drag an image to the browser</p>
          <p className="center">or choose an image from your computer</p>
          <div className="center">
            <input className="center" type="file" accept="image/*" onChange={fileUpload} />
          </div>
        </section>
        <section className="guide">
          <article>
            <h3>You can...</h3>
            <p>* load an image from the clipboard and your computer</p>
            <p>* draw lines, rectangles, ellipses, arrows, text</p>
            <p>* use a <code>Pen</code> to draw anything else</p>
            <p>* download a PNG image</p>
          </article>
          <article>
            <h3>Controls</h3>
            <p>
              <kbd>Ctrl+V</kbd> to paste an image from the clipboard
            </p>
            <p>
              <kbd>Ctrl+S</kbd> to download an image
            </p>
            <p>
              <kbd>Ctrl+Z</kbd> to undo an action
            </p>
            <p>
              <kbd>Ctrl+Scroll</kbd> to zoom
            </p>
          </article>
        </section>
        <section>
          <p>
            Read and agree with our <a href="/policy/">Privacy Policy</a> and
            <a href="/terms/">Terms of Use</a> before using our app.
          </p>
        </section>
      </Modal.Body>
    </Modal>
  );
};

WelcomeModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onUploadImage: PropTypes.func.isRequired,
};

export default WelcomeModal;
