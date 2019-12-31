import React from 'react';
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
} from '../../constants/desk';
import Icon from '../Icon';
import Button from '../Button';

const SIZE_VALUE_REGEXP = /^(\d{0,2})?px$/;

const Toolbar = props => {
  const {
    user,
    activeDeskTool,
    activeColor,
    activeTextSize,
    activeLineSize,
    signIn,
    signOut,
    setDeskOption,
    setDeskTool,
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

  const scalePatterns = [0.5, 1, 2];

  function onFontSizeChanged(event) {
    event.preventDefault();

    const { value: rawValue } = event.target;
    const matchedValue = rawValue.match(SIZE_VALUE_REGEXP);
    if (matchedValue) {
      const value = matchedValue[1];
      setDeskOption(FONT_SIZE_OPTION, parseInt(value, 10));
    }
  }

  function onLineSizeChanged(event) {
    event.preventDefault();

    const { value: rawValue } = event.target;
    const matchedValue = rawValue.match(SIZE_VALUE_REGEXP);
    if (matchedValue) {
      const value = matchedValue[1];
      setDeskOption(LINE_SIZE_OPTION, parseInt(value, 10));
    }
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
                onClick={() => setDeskOption(LINE_SIZE_OPTION, Math.max(1, activeLineSize - 2))}
                data-dropdown-noclose
              >
                <Icon name="minus" />
              </Button>
              <Button
                variant="secondary"
                rounded="0"
                onClick={() => setDeskOption(LINE_SIZE_OPTION, Math.min(99, activeLineSize + 2))}
                data-dropdown-noclose
              >
                <Icon name="plus" />
              </Button>
            </div>
            {lineSizePatterns.map(size => (
              <Button
                key={size}
                variant="secondary"
                rounded="0"
                onClick={() => setDeskOption(LINE_SIZE_OPTION, size)}
              >
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
                onClick={() => setDeskOption(FONT_SIZE_OPTION, Math.max(1, activeTextSize - 2))}
                data-dropdown-noclose
              >
                <Icon name="minus" />
              </Button>
              <Button
                variant="secondary"
                rounded="0"
                onClick={() => setDeskOption(FONT_SIZE_OPTION, Math.min(99, activeTextSize + 2))}
                data-dropdown-noclose
              >
                <Icon name="plus" />
              </Button>
            </div>
            {fontSizePatterns.map(size => (
              <Button
                key={size}
                variant="secondary"
                rounded="0"
                onClick={() => setDeskOption(FONT_SIZE_OPTION, size)}
              >
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
                    onClick={() => setDeskOption(COLOR_OPTION, color)}
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
          onChange={e => setDeskOption(COLOR_OPTION, e.target.value)}
        />

        <div id="scaleOption" className="dropdown dropdown-dark dropdown-flat flex-stretch">
          <Button className="dropdown-toggle" variant="secondary" rounded="0">
            <input id="scaleOptionInput" type="text" defaultValue="100%" />
            <Icon name="chevron-down" size="small" className="round-180" />
          </Button>
          <div className="dropdown-menu">
            <div className="dropdown-group">
              <Button
                variant="secondary"
                rounded="0"
                data-dropdown-noclose
                onClick={() => setDeskOption(LINE_SIZE_OPTION, Math.max(0, activeLineSize - 2))}
              >
                <Icon name="minus" />
              </Button>
              <Button variant="secondary" rounded="0" data-option-action="fillIn">
                <Icon name="maximize" />
              </Button>
              <Button
                variant="secondary"
                rounded="0"
                data-dropdown-noclose
                onClick={() => setDeskOption(LINE_SIZE_OPTION, Math.min(99, activeLineSize + 2))}
              >
                <Icon name="plus" />
              </Button>
            </div>
            {scalePatterns.map(scale => (
              <Button
                key={scale}
                variant="secondary"
                rounded="0"
                onClick={() => setDeskOption(LINE_SIZE_OPTION, scale)}
              >
                {`${scale * 100}%`}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Button id="menu-toggle" className="flex-stretch" variant="secondary" rounded="0">
        <Icon name="menu" />
      </Button>

      <div className="menu">
        <Button id="saveBtn" className="flex-stretch" variant="secondary" rounded="0">
          <span className="light light-green" />
          <span id="savingStatus">Saved</span>
        </Button>

        <div className="dropdown dropdown-dark dropdown-flat flex-stretch">
          <Button className="dropdown-toggle" variant="secondary" rounded="0">
            <Icon name="save" />
          </Button>
          <div className="dropdown-menu dropdown-menu--right">
            <Button id="imageEditLinkBtn" variant="secondary" rounded="0">
              <Icon name="link" size="small" />
              <span>Copy a link</span>
            </Button>
            <Button id="imageDirectLinkBtn" variant="secondary" rounded="0">
              <Icon name="link" size="small" />
              <span>Copy a direct link</span>
            </Button>
            <Button id="downloadBtn" variant="secondary" rounded="0">
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
  activeColor: PropTypes.string.isRequired,
  activeTextSize: PropTypes.number.isRequired,
  activeLineSize: PropTypes.number.isRequired,
  signIn: PropTypes.func.isRequired,
  signOut: PropTypes.func.isRequired,
  setDeskOption: PropTypes.func.isRequired,
  setDeskTool: PropTypes.func.isRequired,
};

Toolbar.defaultProps = {
  activeDeskTool: null,
};

export default Toolbar;
