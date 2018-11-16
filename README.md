# Controls

### Modal

```html
    <div class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h1>Modal header here</h1>
            </div>
            <div class="modal-body">
                <p>Modal body here</p>
            </div>
            <div class="modal-footer">
                <p>Modal footer here</p>
            </div>
        </div>
    </div>
```

```js
    var modalElement = document.getELementById('#any-model');
    modalElement.open();
    // ...
    modalElement.close();
```

### Buttons

```html
    <button class="btn">Click</button> /* Green button */
    <button class="btn btn-dark">Click</button> /* Dark button */
    <button class="btn btn-flat">Click</button> /* Flat button */
```

### Dropdown

```html
    <div class="dropdown">
        <button class="dropdown-toggle btn">Click</button>
        <div class="dropdown-menu">
            <div class="dropdown-group">
                <button data-dropdown-noclose class="btn">+</button>
                <span>90%</span>
                <button data-dropdown-noclose class="btn">-</button>
            </div>
            <button class="btn">Zoom in</button>
            <button class="btn">Zoom out</button>
            <button class="btn">100%</button>
        </div>
    </div>
```

```js
    var dropdownElement = document.getELementById('#any-dropdown');
    dropdownElement.open();
    // ...
    dropdownElement.close();
```
