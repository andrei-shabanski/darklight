import React from 'react';
import PropTypes from 'prop-types';

import Tools from './Tools';
import Options from './Options';
import Menu from './Menu';

const Toolbar = props => {
  const {
    user,
    activeDeskTool,
    activeScale,
    activeColor,
    activeTextSize,
    activeLineSize,
    signIn,
    signOut,
    setDeskTool,
    setColor,
    setFontSize,
    setLineSize,
    setScale,
    fillIn,
    copyLink,
    copyDirectLink,
    download,
    saveImage,
    saveStatus,
  } = props;

  return (
    <nav className="toolbar">
      <Tools activeTool={activeDeskTool} onToolChange={setDeskTool} />
      <Options
        tool={activeDeskTool}
        scale={activeScale}
        color={activeColor}
        textSize={activeTextSize}
        lineSize={activeLineSize}
        setColor={setColor}
        setFontSize={setFontSize}
        setLineSize={setLineSize}
        setScale={setScale}
        fillIn={fillIn}
      />
      <Menu
        saveImage={saveImage}
        saveStatus={saveStatus}
        user={user}
        signIn={signIn}
        signOut={signOut}
        download={download}
        copyDirectLink={copyDirectLink}
        copyLink={copyLink}
      />
    </nav>
  );
};

Toolbar.propTypes = {
  user: PropTypes.shape([]).isRequired,
  activeDeskTool: PropTypes.string,
  activeScale: PropTypes.number.isRequired,
  activeColor: PropTypes.string.isRequired,
  activeTextSize: PropTypes.number.isRequired,
  activeLineSize: PropTypes.number.isRequired,
  saveStatus: PropTypes.string.isRequired,
  signIn: PropTypes.func.isRequired,
  signOut: PropTypes.func.isRequired,
  setDeskTool: PropTypes.func.isRequired,
  setColor: PropTypes.func.isRequired,
  setFontSize: PropTypes.func.isRequired,
  setLineSize: PropTypes.func.isRequired,
  setScale: PropTypes.func.isRequired,
  fillIn: PropTypes.func.isRequired,
  saveImage: PropTypes.func.isRequired,
  copyLink: PropTypes.func.isRequired,
  copyDirectLink: PropTypes.func.isRequired,
  download: PropTypes.func.isRequired,
};

Toolbar.defaultProps = {
  activeDeskTool: null,
};

export default Toolbar;
