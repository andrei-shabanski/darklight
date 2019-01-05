# Online image editor

## Development

0. Clone the repository

    ```bash
    git clone 
    ```

0. Install NPM packages

    ```bash
    npm install -g firebase-tools
    npm install
    ```

0. (Optional) Login to firebase in order to deploy the application

    ```bash
    firebase login
    ```

Use NPM scripts to test and deploy the application:

```bash
npm run serve  # start a local server
npm run deploy  # deploy the application to Firebase

```

# Custom components

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

### Light indicators

```html
    <span class="light"></span>
    <span class="light light-red"></span>
    <span class="light light-yellow"></span>
    <span class="light light-green"></span>
    <span class="light light-red lighting"></span>
    <span class="light light-yellow lighting"></span>
    <span class="light light-green lighting"></span>
```
