## Potman Beta 0.2

Potman is a chrome extension

# How to install?

// TODO

# License

MIT

# File struct

- root
    - manifest.json                 chrome extensions need
    - background                    background script in chrome
        - *.js
    - main                          content script in game page
        - *.js
    - option                        option page
        - index.html
        - index.js
    - popup                         popup page
        - index.html
        - index.js
    - prpr                          content script in prpr page
        - index.js
    - public                        public package
        - common.js                 constant & event type
        - *.js                      public package
    - resource                      resource
