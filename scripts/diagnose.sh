#!/bin/bash

echo "=========================================="
echo "ALCOVIA DIAGNOSTIC REPORT"
echo "=========================================="
echo ""

# Check Server
echo "1. SERVER (http://localhost:3001)"
echo "--------------------------------------"
if curl -s http://localhost:3001/api/state/student-1 > /dev/null 2>&1; then
    echo "✅ Server is running"
    curl -s http://localhost:3001/api/state/student-1 | python3 -m json.tool 2>/dev/null | grep -E "(focusStreak|coins|todayFocusMinutes|totalSuccessfulSessions)" | head -4
else
    echo "❌ Server is NOT running"
    echo "   Fix: cd server && npm run dev"
fi
echo ""

# Check App
echo "2. APP (http://localhost:8081)"
echo "--------------------------------------"
if curl -s http://localhost:8081 > /dev/null 2>&1; then
    echo "✅ App server is running"
    if curl -s http://localhost:8081 | grep -q "Choose Duration"; then
        echo "✅ New UI is loaded (6s preset available)"
    else
        echo "⚠️  Old UI might be cached"
        echo "   Fix: Hard refresh browser (Cmd+Shift+R)"
    fi
else
    echo "❌ App is NOT running"
    echo "   Fix: cd app && npm run web"
fi
echo ""

# Check n8n
echo "3. N8N (http://localhost:5678)"
echo "--------------------------------------"
if curl -s http://localhost:5678 > /dev/null 2>&1; then
    echo "✅ n8n is running"
    
    # Test webhook
    WEBHOOK_TEST=$(curl -s -X POST http://localhost:5678/webhook/focus-complete -H "Content-Type: application/json" -d '{"sessionId":"diag","studentId":"student-1","streak":3,"coins":150}' 2>&1)
    
    if echo "$WEBHOOK_TEST" | grep -q "success"; then
        echo "✅ Webhook is working"
    elif echo "$WEBHOOK_TEST" | grep -q "not registered"; then
        echo "❌ Webhook is NOT registered"
        echo "   Fix: Open http://localhost:5678 in browser"
        echo "   1. Click Workflows"
        echo "   2. Click 'Alcovia - Focus Session Notification'"
        echo "   3. Toggle OFF → Save → Toggle ON → Save"
    else
        echo "⚠️  Webhook returned: $WEBHOOK_TEST"
    fi
else
    echo "❌ n8n is NOT running"
    echo "   Fix: bash scripts/start-n8n-dev.sh"
fi
echo ""

# Check notification log
echo "4. NOTIFICATION LOG"
echo "--------------------------------------"
curl -s http://localhost:3001/api/notification-log | python3 -m json.tool 2>/dev/null | grep -c "sessionId" || echo "0 entries"
echo ""

# Check browser tabs
echo "5. BROWSER SETUP"
echo "--------------------------------------"
echo "Device A: http://localhost:8081/?client=device-A"
echo "Device B: http://localhost:8081/?client=device-B (Incognito)"
echo ""

echo "=========================================="
echo "QUICK FIXES"
echo "=========================================="
echo ""
echo "If n8n webhook fails:"
echo "  1. Open http://localhost:5678"
echo "  2. Delete old workflow"
echo "  3. Import n8n/n8n-workflow.json"
echo "  4. Toggle ON → Save"
echo ""
echo "If app shows old UI:"
echo "  1. Hard refresh: Cmd+Shift+R"
echo "  2. Or clear browser cache"
echo ""
echo "If server is down:"
echo "  cd server && npm run dev"
echo ""
echo "=========================================="
