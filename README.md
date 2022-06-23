Alerta Web UI 8.0
=================

[![Actions Status](https://github.com/alerta/alerta-webui/workflows/CI%20Tests/badge.svg)](https://github.com/alerta/alerta-webui/actions) [![Slack chat](https://img.shields.io/badge/chat-on%20slack-blue?logo=slack)](https://slack.alerta.dev)

Version 8.0 of the Alerta web UI is a [VueJS](https://vuejs.org/) web app.

![webui](/docs/images/alerta-webui-v7.png?raw=true&v=1)

Installation
------------

To install the web console:

    $ wget https://github.com/alerta/alerta-webui/releases/latest/download/alerta-webui.tar.gz
    $ tar zxvf alerta-webui.tar.gz
    $ cd dist
    $ python3 -m http.server 8000

    >> browse to http://localhost:8000

Configuration
-------------

Most configuration will come from the Alerta API server. The minimum,
and most common, configuration is simply to tell the web UI where the
API server is located.

Environment variables for some settings can be used at build time:

    $ export VUE_APP_ALERTA_ENDPOINT=https://alerta-api.example.com
    $ npm install
    $ npm run build

or place a `config.json` configuration file in the `dist` directory
for run time configuration:

    {
        "endpoint": "https://alerta-api.example.com"
    }

Any setting from the API server can be overridden if included in
the local `config.json` file. For a full list of supported settings
see the web UI config settings in the [online docs][1].

[1]: https://docs.alerta.io/en/latest/webui.html#configuration-from-api-server

As a special case, support for setting an OAuth Client ID using a
build-time environment variable is possible but should not be be
necessary for most deployments.

    $ export VUE_APP_CLIENT_ID=0ffe5d26-6c66-4871-a6fa-593d9fa972b1

Quick Start
-----------

A docker container that is built using the most recent master branch is
available for download from Docker Hub.

    $ docker pull alerta/alerta-beta

 It can also be built locally using the `Dockerfile` in this repository.

    $ docker build -t alerta/alerta-beta .

To run, create a `config.json` file and mount the file into the container

    $ echo '{"endpoint": "https://alerta-api.example.com"}' > config.json
    $ docker run -v "$PWD/config.json:/usr/share/nginx/html/config.json" \
      -it -p 8000:80 --rm --name alerta-beta alerta/alerta-beta

Note: Update the `CORS_ORIGINS` setting in the Alerta API server config
to include the URL that the beta web console is hosted at otherwise
the browser will throw "blocked by CORS policy" errors and not work.

Deployment
----------

Since this is a static web app then a production deployment of Alerta web UI
is simply a matter of downloading the release tarball and copying the `dist`
directory to the a location that can be served via a web server or CDN.

See the [VueJS platform guide][2] for more information.

[2]: https://cli.vuejs.org/guide/deployment.html#general-guidelines

Troubleshooting
---------------

The two main issues with deployment in production involve CORS and HTML5
history mode.

### Cross-origin Errors (CORS) ###

All modern browsers restrict access of a web app running at one domain to
resources at a different origin (domain). This mechanism is known as [CORS][3].

[3]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

To ensure that the Alerta web app has permission to access the Alerta API
at a different origin the web URL needs to be added to the `CORS_ORIGINS`
settings for the API.

See [API server configuration][4] for more details.

[4]: https://docs.alerta.io/en/latest/configuration.html#cors-config

### HTML5 History Mode

The web app uses [HTML5 history mode][4] so you must ensure to configure
the web server or CDN correctly otherwise users will get `404` errors when
accessing deep links such as `/alert/:id` directly in their browser.

The fix is to provide a [catch-all fallback route][5] so that any URL that
doesn't match a static asset will be handled by the web app and redirected.

**Example using nginx**
```
location / {
  try_files $uri $uri/ /index.html;
}
```

[5]: https://router.vuejs.org/guide/essentials/history-mode.html
[6]: https://router.vuejs.org/guide/essentials/history-mode.html#example-server-configurations

Development
-----------

Project setup
```
npm install
```

Compiles and hot-reloads for development
```
npm run serve
```

Compiles and minifies for production
```
npm run build
```

Tests
-----

Run your tests
```
npm run test
```

Lints and fixes files
```
npm run lint
```

Run your end-to-end tests
```
npm run test:e2e
```

Run your unit tests
```
npm run test:unit
```

License
-------

    Alerta monitoring system and console
    Copyright 2019-2021 Nick Satterly

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
