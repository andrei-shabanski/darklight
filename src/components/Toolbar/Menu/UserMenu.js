import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '../../Button';
import Dropdown from '../../Dropdown';

export default function UserMenu({ user, signIn, signOut }) {
  const [opened, setOpened] = useState(false);

  if (!user) {
    return (
      <Button className="flex-stretch" variant="secondary" rounded="0" onClick={signIn}>
        Sign in
      </Button>
    );
  }

  return (
    <Dropdown
      className="flex-stretch"
      variant="secondary"
      rounded="0"
      opened={opened}
      onBackgroundClick={() => setOpened(false)}
    >
      <Dropdown.Toggle onClick={() => setOpened(!opened)}>{user.displayName}</Dropdown.Toggle>
      <Dropdown.Menu position="right">
        <Button variant="secondary" rounded="0">
          My pictures
        </Button>
        <hr />
        <Button variant="secondary" rounded="0" onClick={signOut}>
          Sign out
        </Button>
      </Dropdown.Menu>
    </Dropdown>
  );
}

UserMenu.propTypes = {
  user: PropTypes.shape.isRequired,
  signIn: PropTypes.func.isRequired,
  signOut: PropTypes.func.isRequired,
};
