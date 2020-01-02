import React from 'react';
import PropTypes from 'prop-types';

import './modal.scss';

const Modal = ({ children, isOpen, ...props }) => {
  if (isOpen) {
    props['data-open'] = true;
  }

  return (
    <div className="modal" {...props}>
      <div className="modal-content">{children}</div>
    </div>
  );
};

Modal.propTypes = {
  children: PropTypes.oneOfType([PropTypes.elementType, PropTypes.object]).isRequired,
  isOpen: PropTypes.bool,
};

Modal.defaultProps = {
  isOpen: false,
};

export default Modal;

Modal.Header = ({ children }) => <div className="modal-header">{children}</div>;

Modal.Header.propTypes = {
  children: PropTypes.oneOfType([PropTypes.elementType, PropTypes.object]).isRequired,
};

Modal.Body = ({ children }) => <div className="modal-body">{children}</div>;

Modal.Body.propTypes = {
  children: PropTypes.oneOfType([PropTypes.elementType, PropTypes.object]).isRequired,
};

Modal.Footer = ({ children }) => <div className="modal-footer">{children}</div>;

Modal.Footer.propTypes = {
  children: PropTypes.oneOfType([PropTypes.elementType, PropTypes.object]).isRequired,
};
