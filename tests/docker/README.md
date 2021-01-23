Tests

## Test Scenarios

Test matrix is a combination of subpath configs and reverse proxy:

- no subpath
- build time subpath
- run time subpath

- no reverse proxy
- reverse proxy

## Test Routes

config.json
static assets, like fonts and images
root path
route to subpath eg /alerta/alert/1234
direct to subpath route

## Web UIs

### Non-proxied Endpoints
http://webui.local.alerta.io:9000/ (direct to web server, no subpath, works as expected)
http://webui.local.alerta.io:9001/alerta/ui1 (does not respond at all)
http://webui.local.alerta.io:9002/alerta/ui2 (web UI responds but subpath is redirected to root)

### Proxied Endpoints
http://webui.local.alerta.io:8000/alerta/ui0 (BASE_URL not set, not expected to work)
http://webui.local.alerta.io:8000/alerta/ui1 (BASE_URL set at build time, works as designed)
http://webui.local.alerta.io:8000/alerta/ui2 (BASE_URL set at run time, does not work without hacking paths, support this approach was withdrawn)

### API Server Endpoint
http://proxy.local.alerta.io:8000/alerta/api/config


## Run Tests

### Send a test alert

    $nalerta --endpoint-url http://localhost:8000/alerta/api send -E Development -S Web -r web01 -e node_down -s critical
    22cf40d0-020f-4650-b6e9-8309cab81538 (indeterminate -> critical)

### Build and run containers using docker-compose

    $ docker-compose -f docker-compose.ci.yaml up --build


