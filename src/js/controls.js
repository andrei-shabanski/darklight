export function Dropdown(element) {
  element.dropdown = this;

  this.openHandler = function(event) {
    this.open();
  }.bind(this);

  this.closeHandler = function(event) {
    if (event.target.closest("[data-dropdown-noclose]") != null) {
      event.preventDefault();
      return;
    }

    this.close();
  }.bind(this);

  this.dropdownElement = element;
  this.dropdownToggleElement = element.querySelector(".dropdown-toggle");

  this.dropdownToggleElement.addEventListener("click", this.openHandler, false);
}

Dropdown.prototype.open = function() {
  this.dropdownElement.dataset.open = "open";

  this.dropdownToggleElement.removeEventListener("click", this.openHandler);
  this.dropdownToggleElement.addEventListener("click", this.closeHandler, false);
  window.addEventListener("click", this.closeHandler, true);
};

Dropdown.prototype.close = function() {
  delete this.dropdownElement.dataset.open;

  this.dropdownToggleElement.removeEventListener("click", this.closeHandler);
  this.dropdownToggleElement.addEventListener("click", this.openHandler, false);
  window.removeEventListener("click", this.closeHandler);
};
