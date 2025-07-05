#!/bin/bash
set -e

npm run backend &
BACK_PID=$!

npm run dev:start --prefix frontend &
FRONT_PID=$!

cd frontend
npx playwright test --project=chromium --reporter=list --timeout=60000
STATUS=$?
cd ..

kill $BACK_PID $FRONT_PID
wait $BACK_PID || true
wait $FRONT_PID || true

exit $STATUS
