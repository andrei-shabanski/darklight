'use strict';

(function() {
    function openDropdown(event) {
        // if (event.target != this) {
        //     return
        // }

        this.dataset.open = this.dataset.open == 'true' ? 'false' : 'true';

        this.removeEventListener('click', this.open);
        this.addEventListener('click', this.close, false);
        window.addEventListener('click', this.close, false);

        event.preventDefault();
        return false;
    }

    function closeDropdown(event) {
        var currentNode = event.target;
        while (currentNode) {
            if (currentNode == document.body) {
                break;
            }
            if (currentNode == this) {
                if (event.target.dataset.dropdownButton == undefined) {
                    return false;
                } else if (!event.returnValue) {
                    return false;
                } else {
                    break;
                }
            }
            currentNode = currentNode.parentNode;
        }

        this.dataset.open = 'false';
        this.addEventListener('click', this.open, false);
        this.removeEventListener('click', this.close);
        window.removeEventListener('click', this.close);

        event.stopPropagation();
    }

    function initializeDropdowns(dropdown) {
        dropdown.open = openDropdown.bind(dropdown);
        dropdown.close = closeDropdown.bind(dropdown);

        dropdown.querySelector('[data-dropdown-button]').addEventListener('click', dropdown.open, false);
    }

    window.addEventListener('load', function() {
        document.querySelectorAll('[data-dropdown]').forEach(initializeDropdowns);
    });
})();
