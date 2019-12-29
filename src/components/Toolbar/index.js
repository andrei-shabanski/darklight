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
          variant="secondary"
          rounded="0"
          data-tool="text"
          data-options="color textSize"
        >
          <Icon name="text" />
        </Button>
        <Button variant="secondary" rounded="0" data-tool="pen" data-options="color size">
          <Icon name="pen" />
        </Button>
        <Button variant="secondary" rounded="0" data-tool="line" data-options="color size">
          <Icon name="line" />
        </Button>
        <Button
          variant="secondary"
          rounded="0"
          data-tool="rectangle"
          data-options="color size"
        >
          <Icon name="rectangle" />
        </Button>
        <Button
          variant="secondary"
          rounded="0"
          data-tool="ellipse"
          data-options="color size"
        >
          <Icon name="ellipse" />
        </Button>
        <Button variant="secondary" rounded="0" data-tool="arrow" data-options="color size">
          <Icon name="arrow" />
        </Button>
        <Button id="cropBtn" variant="secondary" rounded="0" data-tool="crop">
          <Icon name="crop" />
        </Button>
      </div>

      <div className="options">
        <div id="sizeOption" className="dropdown dropdown-dark dropdown-flat flex-stretch hidden">
          <Button className="dropdown-toggle" variant="secondary" rounded="0">
            <input id="sizeOptionInput" type="text" defaultValue="5px" />
            <Icon name="chevron-down" className="round-180" size="small" />
          </Button>
          <div className="dropdown-menu">
            <div className="dropdown-group">
              <Button variant="secondary" rounded="0" data-dropdown-noclose data-option-action="decrease">
                <Icon name="minus" />
              </Button>
              <Button variant="secondary" rounded="0" data-dropdown-noclose data-option-action="increase">
                <Icon name="plus" />
              </Button>
            </div>
            {lineSizePatterns.map(size => (
              <Button key={size} variant="secondary" rounded="0" data-option-value={size}>
                {`${size}px`}
              </Button>
            ))}
          </div>
        </div>

        <div
          id="textSizeOption"
          className="dropdown dropdown-dark dropdown-flat flex-stretch hidden"
        >
          <Button className="dropdown-toggle" variant="secondary" rounded="0">
            <input id="textSizeOptionInput" type="text" defaultValue="18px" />
            <Icon name="chevron-down" className="round-180" size="small" />
          </Button>
          <div className="dropdown-menu">
            <div className="dropdown-group">
              <Button variant="secondary" rounded="0" data-option-action="decrease">
                <Icon name="minus" />
              </Button>
              <Button variant="secondary" rounded="0" data-option-action="increase">
                <Icon name="plus" />
              </Button>
            </div>
            {fontSizePatterns.map(size => (
              <Button key={size} variant="secondary" rounded="0" data-option-value={size}>
                {`${size}px`}
              </Button>
            ))}
          </div>
        </div>

        <div id="colorOption" className="dropdown dropdown-dark dropdown-flat flex-stretch hidden">
          <Button className="dropdown-toggle" variant="secondary" rounded="0">
            <Icon name="rectangle" style={{ fill: '#ff0000', stroke: '#ff0000' }} />
          </Button>
          <div className="dropdown-menu">
            {colorPatterns.map((colorGroupPatterns, index) => (
              <div key={index} className="dropdown-group">
                {colorGroupPatterns.map(({ color, isActive }) => (
                  <Button
                    key={color}
                    variant="secondary"
                    rounded="0"
                    isActive={isActive}
                    data-color-set={`#${color}`}
                  >
                    <Icon name="rectangle" style={{ fill: color, strokeWidth: 0 }} />
                  </Button>
                ))}
              </div>
            ))}
            <Button className="picker-button" variant="secondary" rounded="0" data-color-picker>
              <Icon name="rectangle" />
              Other
            </Button>
          </div>
        </div>
        <input id="colorPicker" className="hidden" type="color" />

        <div id="scaleOption" className="dropdown dropdown-dark dropdown-flat flex-stretch">
          <Button className="dropdown-toggle" variant="secondary" rounded="0">
            <input id="scaleOptionInput" type="text" defaultValue="100%" />
            <Icon name="chevron-down" size="small" className="round-180" />
          </Button>
          <div className="dropdown-menu">
            <div className="dropdown-group">
              <Button variant="secondary" rounded="0" data-dropdown-noclose data-option-action="decrease">
                <Icon name="minus" />
              </Button>
              <Button variant="secondary" rounded="0" data-option-action="fillIn">
                <Icon name="maximize" />
              </Button>
              <Button variant="secondary" rounded="0" data-dropdown-noclose data-option-action="increase">
                <Icon name="plus" />
              </Button>
            </div>
            {scalePatterns.map(scale => (
              <Button key={scale} variant="secondary" rounded="0" data-option-value={scale}>
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
      </div>
    </nav>
  );
};

export default Toolbar;
