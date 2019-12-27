import React from 'react';

import Icon from '../Icon';
import Button from '../Button';

const Toolbar = () => {
  const colorPatterns = [
    [
      { color: 'ff0000', isActive: true },
      { color: '00ff00', isActive: false },
      { color: '0000ff', isActive: false },
    ],
    [
      { color: 'ffffff', isActive: false },
      { color: 'ffff00', isActive: false },
      { color: '000000', isActive: false },
    ],
  ];

  const lineSizePatterns = [2, 5, 8, 14, 24, 36, 72];
  const fontSizePatterns = [10, 14, 18, 24, 36, 72];
  const scalePatterns = [0.5, 1, 2];

  return (
    <nav className="toolbar">
      <div className="tools">
        <Button
          isDark
          isFlat
          className="flex-stretch"
          data-tool="text"
          data-options="color textSize"
        >
          <Icon name="text" />
        </Button>
        <Button isDark isFlat className="flex-stretch" data-tool="pen" data-options="color size">
          <Icon name="pen" />
        </Button>
        <Button isDark isFlat className="flex-stretch" data-tool="line" data-options="color size">
          <Icon name="line" />
        </Button>
        <Button
          isDark
          isFlat
          className="flex-stretch"
          data-tool="rectangle"
          data-options="color size"
        >
          <Icon name="rectangle" />
        </Button>
        <Button
          isDark
          isFlat
          className="flex-stretch"
          data-tool="ellipse"
          data-options="color size"
        >
          <Icon name="ellipse" />
        </Button>
        <Button isDark isFlat className="flex-stretch" data-tool="arrow" data-options="color size">
          <Icon name="arrow" />
        </Button>
        <Button isDark isFlat id="cropBtn" className="flex-stretch" data-tool="crop">
          <Icon name="crop" />
        </Button>
      </div>

      <div className="options">
        <div id="sizeOption" className="dropdown dropdown-dark dropdown-flat flex-stretch hidden">
          <Button isDark isFlat className="dropdown-toggle">
            <input id="sizeOptionInput" type="text" defaultValue="5px" />
            <Icon name="chevron-down" className="round-180" isSmall />
          </Button>
          <div className="dropdown-menu">
            <div className="dropdown-group">
              <Button isDark isFlat data-dropdown-noclose data-option-action="decrease">
                <Icon name="minus" />
              </Button>
              <Button isDark isFlat data-dropdown-noclose data-option-action="increase">
                <Icon name="plus" />
              </Button>
            </div>
            {lineSizePatterns.map(size => (
              <Button key={size} isDark isFlat data-option-value={size}>
                {`${size}px`}
              </Button>
            ))}
          </div>
        </div>

        <div
          id="textSizeOption"
          className="dropdown dropdown-dark dropdown-flat flex-stretch hidden"
        >
          <Button isDark isFlat className="dropdown-toggle">
            <input id="textSizeOptionInput" type="text" defaultValue="18px" />
            <Icon name="chevron-down" className="round-180" isSmall />
          </Button>
          <div className="dropdown-menu">
            <div className="dropdown-group">
              <Button isDark isFlat data-option-action="decrease">
                <Icon name="minus" />
              </Button>
              <Button isDark isFlat data-option-action="increase">
                <Icon name="plus" />
              </Button>
            </div>
            {fontSizePatterns.map(size => (
              <Button key={size} isDark isFlat data-option-value={size}>
                {`${size}px`}
              </Button>
            ))}
          </div>
        </div>

        <div id="colorOption" className="dropdown dropdown-dark dropdown-flat flex-stretch hidden">
          <Button isDark isFlat className="dropdown-toggle">
            <Icon name="rectangle" style={{ fill: '#ff0000', stroke: '#ff0000' }} />
          </Button>
          <div className="dropdown-menu">
            {colorPatterns.map(colorGroupPatterns => (
              <div className="dropdown-group">
                {colorGroupPatterns.map(({ color, isActive }) => (
                  <Button
                    key={color}
                    isDark
                    isFlat
                    isActive={isActive}
                    data-color-set={`#${color}`}
                  >
                    <Icon name="rectangle" style={{ fill: color, strokeWidth: 0 }} />
                  </Button>
                ))}
              </div>
            ))}
            <Button isDark isFlat className="picker-button" dataColorPicker>
              <Icon name="rectangle" />
              Other
            </Button>
          </div>
        </div>
        <input id="colorPicker" className="hidden" type="color" />

        <div id="scaleOption" className="dropdown dropdown-dark dropdown-flat flex-stretch">
          <Button className="dropdown-toggle" isDark isFlat>
            <input id="scaleOptionInput" type="text" defaultValue="100%" />
            <Icon name="chevron-down" isSmall className="round-180" />
          </Button>
          <div className="dropdown-menu">
            <div className="dropdown-group">
              <Button isDark isFlat data-dropdown-noclose data-option-action="decrease">
                <Icon name="minus" />
              </Button>
              <Button isDark isFlat data-option-action="fillIn">
                <Icon name="maximize" />
              </Button>
              <Button isDark isFlat data-dropdown-noclose data-option-action="increase">
                <Icon name="plus" />
              </Button>
            </div>
            {scalePatterns.map(scale => (
              <Button key={scale} isDark isFlat data-option-value={scale}>
                {`${scale * 100}%`}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Button id="menu-toggle" className="flex-stretch" isDark isFlat>
        <Icon name="menu" />
      </Button>

      <div className="menu">
        <Button id="saveBtn" className="flex-stretch" isDark isFlat>
          <span className="light light-green" />
          <span id="savingStatus">Saved</span>
        </Button>

        <div className="dropdown dropdown-dark dropdown-flat flex-stretch">
          <Button isDark isFlat className="dropdown-toggle">
            <Icon name="save" />
          </Button>
          <div className="dropdown-menu dropdown-menu--right">
            <Button id="imageEditLinkBtn" isDark isFlat>
              <Icon name="link" isSmall />
              <span>Copy a link</span>
            </Button>
            <Button id="imageDirectLinkBtn" isDark isFlat>
              <Icon name="link" isSmall />
              <span>Copy a direct link</span>
            </Button>
            <Button id="downloadBtn" isDark isFlat>
              <Icon name="download" isSmall />
              <span>Download</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Toolbar;
