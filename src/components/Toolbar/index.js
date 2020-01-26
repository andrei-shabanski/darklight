import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  TEXT_TOOL,
  PEN_TOOL,
  LINE_TOOL,
  RECTANGLE_TOOL,
  ELLIPSE_TOOL,
  ARROW_TOOL,
  CROP_TOOL,
  COLOR_OPTION,
  FONT_SIZE_OPTION,
  LINE_SIZE_OPTION,
  TOOL_OPTIONS_MAP,
  NOT_SAVED_STATUS,
  SAVING_STATUS,
} from '../../constants/desk';
import Icon from '../Icon';
import Button from '../Button';
import LightIndicator from '../LightIndicator';
import { matchPattern } from '../../utils/regexp';
import ScaleOptionDropdown from './ScaleOptionDropdown';

const SIZE_VALUE_REGEXP = /^(\d{0,2})?px$/;

const Toolbar = props => {
  const {
    user,
    activeDeskTool,
    activeScale,
    activeColor,
    activeTextSize,
    activeLineSize,
    saveStatus,
    imageId,
    signIn,
    signOut,
    setDeskTool,
    setColor,
    setFontSize,
    setLineSize,
    setScale,
    fillIn,
    saveImage,
    copyLink,
    copyDirectLink,
    download,
  } = props;

  const colorPicker = React.createRef();

  const activeOptions = activeDeskTool ? TOOL_OPTIONS_MAP[activeDeskTool] : [];

  const colorPatterns = [
    ['#ff0000', '#00ff00', '#0000ff'],
    ['#ffffff', '#ffff00', '#000000'],
  ];
  const colorOptionEnabled = activeOptions.includes(COLOR_OPTION);

  const lineSizePatterns = [2, 5, 8, 14, 24, 36, 72];
  const lineSizeOptionEnabled = activeOptions.includes(LINE_SIZE_OPTION);

  const fontSizePatterns = [10, 14, 18, 24, 36, 72];
  const fontSizeOptionEnabled = activeOptions.includes(FONT_SIZE_OPTION);

  let indicatorMessage;
  let indicatorMode;
  let indicatorColor;
  switch (saveStatus) {
    case NOT_SAVED_STATUS:
      indicatorMessage = 'Not saved';
      indicatorColor = 'red';
      indicatorMode = 'shine';
      break;
    case SAVING_STATUS:
      indicatorMessage = 'Saving';
      indicatorColor = 'green';
      indicatorMode = 'blink';
      break;
    default:
      indicatorMessage = 'Saved';
      indicatorColor = 'green';
      indicatorMode = 'shine';
      break;
  }

  function onFontSizeChanged(event) {
    event.preventDefault();

    matchPattern(event.target.value, SIZE_VALUE_REGEXP, matchedValue => {
      const value = matchedValue[1];
      setFontSize(+value);
    });
  }

  function onLineSizeChanged(event) {
    event.preventDefault();

    matchPattern(event.target.value, SIZE_VALUE_REGEXP, matchedValue => {
      const value = matchedValue[1];
      setLineSize(+value);
    });
  }

  return (
    <nav className="toolbar">
      <div className="tools">
        <Button
          variant="secondary"
          rounded="0"
          isActive={activeDeskTool === TEXT_TOOL}
          onClick={() => setDeskTool(TEXT_TOOL)}
        >
          <Icon name="text" />
        </Button>
        <Button
          variant="secondary"
          rounded="0"
          isActive={activeDeskTool === PEN_TOOL}
          onClick={() => setDeskTool(PEN_TOOL)}
        >
          <Icon name="pen" />
        </Button>
        <Button
          variant="secondary"
          rounded="0"
          isActive={activeDeskTool === LINE_TOOL}
          onClick={() => setDeskTool(LINE_TOOL)}
        >
          <Icon name="line" />
        </Button>
        <Button
          variant="secondary"
          rounded="0"
          isActive={activeDeskTool === RECTANGLE_TOOL}
          onClick={() => setDeskTool(RECTANGLE_TOOL)}
        >
          <Icon name="rectangle" />
        </Button>
        <Button
          variant="secondary"
          rounded="0"
          isActive={activeDeskTool === ELLIPSE_TOOL}
          onClick={() => setDeskTool(ELLIPSE_TOOL)}
        >
          <Icon name="ellipse" />
        </Button>
        <Button
          variant="secondary"
          rounded="0"
          isActive={activeDeskTool === ARROW_TOOL}
          onClick={() => setDeskTool(ARROW_TOOL)}
        >
          <Icon name="arrow" />
        </Button>
        <Button
          id="cropBtn"
          variant="secondary"
          rounded="0"
          isActive={activeDeskTool === CROP_TOOL}
          onClick={() => setDeskTool(CROP_TOOL)}
        >
          <Icon name="crop" />
        </Button>
      </div>

      <div className="options">
        <div
          className="dropdown dropdown-dark dropdown-flat flex-stretch"
          style={{ display: lineSizeOptionEnabled || 'none' }}
        >
          <Button className="dropdown-toggle" variant="secondary" rounded="0">
            <input type="text" value={`${activeLineSize}px`} onChange={onLineSizeChanged} />
            <Icon name="chevron-down" className="round-180" size="small" />
          </Button>
          <div className="dropdown-menu">
            <div className="dropdown-group">
              <Button
                variant="secondary"
                rounded="0"
                onClick={() => setLineSize(activeLineSize - 2)}
                data-dropdown-noclose
              >
                <Icon name="minus" />
              </Button>
              <Button
                variant="secondary"
                rounded="0"
                onClick={() => setLineSize(activeLineSize + 2)}
                data-dropdown-noclose
              >
                <Icon name="plus" />
              </Button>
            </div>
            {lineSizePatterns.map(size => (
              <Button key={size} variant="secondary" rounded="0" onClick={() => setLineSize(size)}>
                {`${size}px`}
              </Button>
            ))}
          </div>
        </div>

        <div
          className="dropdown dropdown-dark dropdown-flat flex-stretch"
          style={{ display: fontSizeOptionEnabled || 'none' }}
        >
          <Button className="dropdown-toggle" variant="secondary" rounded="0">
            <input type="text" value={`${activeTextSize}px`} onChange={onFontSizeChanged} />
            <Icon name="chevron-down" className="round-180" size="small" />
          </Button>
          <div className="dropdown-menu">
            <div className="dropdown-group">
              <Button
                variant="secondary"
                rounded="0"
                onClick={() => setFontSize(activeTextSize)}
                data-dropdown-noclose
              >
                <Icon name="minus" />
              </Button>
              <Button
                variant="secondary"
                rounded="0"
                onClick={() => setFontSize(activeTextSize + 2)}
                data-dropdown-noclose
              >
                <Icon name="plus" />
              </Button>
            </div>
            {fontSizePatterns.map(size => (
              <Button key={size} variant="secondary" rounded="0" onClick={() => setFontSize(size)}>
                {`${size}px`}
              </Button>
            ))}
          </div>
        </div>

        <div
          className="dropdown dropdown-dark dropdown-flat flex-stretch"
          style={{ display: colorOptionEnabled || 'none' }}
        >
          <Button className="dropdown-toggle" variant="secondary" rounded="0">
            <Icon name="rectangle" style={{ fill: activeColor, stroke: activeColor }} />
          </Button>
          <div className="dropdown-menu">
            {colorPatterns.map((colorGroupPatterns, index) => (
              <div key={index} className="dropdown-group">
                {colorGroupPatterns.map(color => (
                  <Button
                    key={color}
                    variant="secondary"
                    rounded="0"
                    isActive={color === activeColor}
                    onClick={() => setColor(color)}
                  >
                    <Icon name="rectangle" style={{ fill: color, strokeWidth: 0 }} />
                  </Button>
                ))}
              </div>
            ))}
            <Button
              className="picker-button"
              variant="secondary"
              rounded="0"
              onClick={() => colorPicker.current.click()}
            >
              <Icon name="rectangle" />
              Other
            </Button>
          </div>
        </div>
        <input
          ref={colorPicker}
          className="hidden"
          type="color"
          onChange={e => setColor(e.target.value)}
        />

        <ScaleOptionDropdown scale={activeScale} onChangeScale={setScale} onFillIn={fillIn} />
      </div>

      <Button id="menu-toggle" className="flex-stretch" variant="secondary" rounded="0">
        <Icon name="menu" />
      </Button>

      <div className="menu">
        <Button className="flex-stretch" variant="secondary" rounded="0" onClick={saveImage}>
          <LightIndicator color={indicatorColor} mode={indicatorMode} />
          <span>{indicatorMessage}</span>
        </Button>

        <div className="dropdown dropdown-dark dropdown-flat flex-stretch">
          <Button className="dropdown-toggle" variant="secondary" rounded="0">
            <Icon name="save" />
          </Button>
          <div className="dropdown-menu dropdown-menu--right">
            <Button variant="secondary" rounded="0" onClick={copyLink}>
              <Icon name="link" size="small" />
              <span>Copy a link</span>
            </Button>
            <Button variant="secondary" rounded="0" onClick={() => copyDirectLink(imageId)}>
              <Icon name="link" size="small" />
              <span>Copy a direct link</span>
            </Button>
            <Button variant="secondary" rounded="0" onClick={download}>
              <Icon name="download" size="small" />
              <span>Download</span>
            </Button>
          </div>
        </div>

        <div
          className="dropdown dropdown-dark dropdown-flat flex-stretch"
          style={{ display: (!user || user.isAnonymous) && 'none' }}
        >
          <Button className="dropdown-toggle" variant="secondary" rounded="0">
            {user && user.displayName}
          </Button>
          <div className="dropdown-menu dropdown-menu--right">
            <Button variant="secondary" rounded="0">
              My pictures
            </Button>
            <hr />
            <Button variant="secondary" rounded="0" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>

        <Button
          className="flex-stretch"
          variant="secondary"
          rounded="0"
          onClick={signIn}
          style={{ display: user && !user.isAnonymous && 'none' }}
        >
          Sign in
        </Button>
      </div>
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
  imageId: PropTypes.string,
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
  imageId: null,
};

export default Toolbar;
