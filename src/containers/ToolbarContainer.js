import React from 'react';
import { connect } from 'react-redux';

import { signIn, signOut } from '../actions/user';
import Toolbar from '../components/Toolbar';
import { fillIn, setColor, setDeskTool, setFontSize, setLineSize, setScale } from '../actions/desk';

const ToolbarContainer = props => <Toolbar {...props} />;

const mapStateToProps = state => ({
  user: state.user,
  activeDeskTool: state.desk.activeTool,
  activeScale: state.desk.options.scale,
  activeColor: state.desk.options.color,
  activeTextSize: state.desk.options.textSize,
  activeLineSize: state.desk.options.lineSize,
});

const mapDispatchToProps = dispatch => ({
  signIn: () => dispatch(signIn()),
  signOut: () => dispatch(signOut()),
  setDeskTool: toolName => dispatch(setDeskTool(toolName)),
  setColor: color => dispatch(setColor(color)),
  setFontSize: size => dispatch(setFontSize(size)),
  setLineSize: size => dispatch(setLineSize(size)),
  setScale: scale => dispatch(setScale(scale)),
  fillIn: () => dispatch(fillIn()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarContainer);
