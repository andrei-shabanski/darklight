import React from 'react';
import { connect } from 'react-redux';

import WelcomeModal from '../components/WelcomeModal';
import { uploadImage } from '../actions/desk/media';

const WelcomeModalContainer = props => <WelcomeModal {...props} />;

const mapStateToProps = state => ({
  opened: !state.desk.image.id,
});

const mapDispatchToProps = dispatch => ({
  onUploadImage: file => dispatch(uploadImage(file)),
});

export default connect(mapStateToProps, mapDispatchToProps)(WelcomeModalContainer);
