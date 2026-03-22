#!/usr/bin/env bash
# Neon may be suspended on first connect; retry migrate a few times with backoff.
set -u
max=5
delay=15
for attempt in $(seq 1 "$max"); do
  echo "prisma migrate deploy (attempt $attempt/$max)..."
  if npx prisma migrate deploy; then
    exit 0
  fi
  if [ "$attempt" -lt "$max" ]; then
    echo "Waiting ${delay}s before retry (Neon cold start / transient network)..."
    sleep "$delay"
  fi
done
exit 1
