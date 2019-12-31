import React from 'react';
import { connect } from 'react-redux';

import { signIn, signOut } from '../actions/user';
import Toolbar from '../components/Toolbar';
import { setDeskOption, setDeskTool } from '../actions/desk';

const ToolbarContainer = props => <Toolbar {...props} />;

const mapStateToProps = state => ({
  user: state.user,
  activeDeskTool: state.desk.activeTool,
  activeColor: state.desk.options.color,
  activeTextSize: state.desk.options.textSize,
  activeLineSize: state.desk.options.lineSize,
});

const mapDispatchToProps = dispatch => ({
  signIn: () => dispatch(signIn()),
  signOut: () => dispatch(signOut()),
  setDeskOption: (optionName, optionValue) => dispatch(setDeskOption(optionName, optionValue)),
  setDeskTool: toolName => dispatch(setDeskTool(toolName)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarContainer);
