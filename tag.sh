#!/bin/bash

BRANCH=$(git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/\1/')
if [ "$BRANCH" != "master" ]; then
	echo "Must be on master branch to tag"
	exit 1
fi

TAG=$(TZ="UTC" date +"%Y-%m-%d.%s")
HASH=$(git rev-parse HEAD)
git tag -a -m "$HASH" $TAG
git push origin $TAG
