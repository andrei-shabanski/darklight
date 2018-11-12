'use strict';

(function() {
    function openDropdown(event) {
        this.dataset.open = 'true';

        this.dropdownToggle.removeEventListener('click', this.open);
        this.dropdownToggle.addEventListener('click', this.close, false);
        window.addEventListener('click', this.close, false);

        event.stopPropagation();
    }

    function closeDropdown(event) {
        var currentNode = event.target;
        while (currentNode) {
            if (currentNode == document.body) {
                break;
            }
            if (event.target.classList.contains('dropdown-toggle')) {
                break;
            }
            if (event.target.classList.contains('dropdown-menu')) {
                if (event.target.dropdown == this) {
                    return;
                } else {
                    break;
                }
            }
            currentNode = currentNode.parentNode;
        }

        this.dataset.open = 'false';

        this.dropdownToggle.removeEventListener('click', this.close);
        this.dropdownToggle.addEventListener('click', this.open, false);
        window.removeEventListener('click', this.close);

        event.stopPropagation();
    }

    window.addEventListener('load', function() {
        document.querySelectorAll('[data-dropdown]').forEach(function(dropdown) {
            dropdown.dropdownToggle = dropdown.querySelector('.dropdown-toggle');
            dropdown.dropdownMenu = dropdown.querySelector('.dropdown-menu');

            dropdown.dropdownToggle.dropdown = dropdown;
            dropdown.dropdownMenu.dropdown = dropdown;

            dropdown.open = openDropdown.bind(dropdown);
            dropdown.close = closeDropdown.bind(dropdown);

            dropdown.dropdownToggle.addEventListener('click', dropdown.open, false);
        });
    });
})();
