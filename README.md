
*科技罐头人*
*Author: li217cca*

# chrome浏览器插件，用作granbluefantasy游戏辅助。

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