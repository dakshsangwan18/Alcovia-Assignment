#!/bin/bash
curl -s -X POST http://localhost:5678/webhook/focus-complete \
  -H 'Content-Type: application/json' \
  -d '{"sessionId":"s1","studentId":"student-1","streak":3,"coins":150,"idempotencyKey":"s1"}'
echo ""
echo "--- notification log ---"
curl -s http://localhost:3001/api/notification-log
