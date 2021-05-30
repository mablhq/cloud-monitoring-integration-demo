#!/bin/bash

BRANCH=$(git branch --no-color 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/\1/')
if [ "$BRANCH" != "main" ]; then
	echo "Must be on default branch to tag"
	exit 1
fi

TAG=$(TZ="UTC" date +"%Y-%m-%d.%s")
HASH=$(git rev-parse HEAD)
git tag -a -m "$HASH" $TAG
git push origin $TAG
