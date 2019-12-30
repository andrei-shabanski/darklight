import React from 'react';
import { connect } from 'react-redux';

import { signIn, signOut } from '../actions/user';
import Toolbar from '../components/Toolbar';

const ToolbarContainer = props => <Toolbar {...props} />;

const mapStateToProps = state => ({
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
  signIn: () => dispatch(signIn()),
  signOut: () => dispatch(signOut()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarContainer);
