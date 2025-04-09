#!/bin/bash
VERSION=${1:-v2}
docker build  .  -t aolifu/fxq:$VERSION
docker push aolifu/fxq:$VERSION
docker stop fxq
docker rm fxq
docker run -d --name fxq -p 11018:3000 aolifu/fxq:$VERSION