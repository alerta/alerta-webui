#!/bin/bash -e

yarn package

for host in $@; do
    (echo "Deploying to $host" \
    && scp -q alerta-webui.tar.gz $host:/opt/x3me/alerta/lib \
    && ssh $host "cd /opt/x3me/alerta && tar xf lib/alerta-webui.tar.gz") &
done

wait