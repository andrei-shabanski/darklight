import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '../../Button';
import Icon from '../../Icon';
import Dropdown from '../../Dropdown';

export default function ImageMenu({ copyLink, copyDirectLink, download }) {
  const [opened, setOpened] = useState(false);

  return (
    <Dropdown
      className="flex-stretch"
      variant="secondary"
      rounded="0"
      opened={opened}
      onBackgroundClick={() => setOpened(false)}
    >
      <Dropdown.Toggle onClick={() => setOpened(!opened)}>
        <Icon name="save" />
      </Dropdown.Toggle>
      <Dropdown.Menu position="right">
        <Button variant="secondary" rounded="0" onClick={copyLink}>
          <Icon name="link" size="small" />
          <span>Copy a link</span>
        </Button>
        <Button variant="secondary" rounded="0" onClick={copyDirectLink}>
          <Icon name="link" size="small" />
          <span>Copy a direct link</span>
        </Button>
        <Button variant="secondary" rounded="0" onClick={download}>
          <Icon name="download" size="small" />
          <span>Download</span>
        </Button>
      </Dropdown.Menu>
    </Dropdown>
  );
}

ImageMenu.propTypes = {
  copyLink: PropTypes.func.isRequired,
  copyDirectLink: PropTypes.func.isRequired,
  download: PropTypes.func.isRequired,
};
