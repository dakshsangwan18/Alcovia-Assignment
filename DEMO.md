# Alcovia Demo Recording Guide

## Quick Record (Mac)

### Option 1: Keyboard Shortcut (Fastest)
1. Press `Cmd + Shift + 5`
2. Choose **"Record Selected Portion"** or **"Record Entire Screen"**
3. Click **Record**
4. Do your demo
5. Press `Cmd + Ctrl + Esc` to stop
6. Video saves to Desktop

### Option 2: QuickTime Player
1. Open **QuickTime Player** (`Cmd+Space`, type "QuickTime")
2. File → **New Screen Recording**
3. Click record button
4. Do your demo
5. Stop recording
6. Save as `Alcovia-Demo.mp4`

---

## Screen Setup

**Before recording, arrange your screen:**

1. **Open 3 browser windows/tabs:**
   - **Window 1:** http://localhost:8081/?client=device-A (Device A - Focus tab)
   - **Window 2:** http://localhost:8081/?client=device-B (Device B - Dev tab) in **Incognito**
   - **Window 3:** http://localhost:3001/api/notification-log (Server notification log)

2. **Arrange side by side:**
   - Left 50%: Device A
   - Right 50%: Device B
   - Keep Window 3 ready to switch to

3. **Ensure services are running:**
   - Server: `cd server && npm run dev` (port 3001)
   - App: `cd app && npm run web` (port 8081)

---

## Demo Script (5 Minutes)

### 1. Introduction (0:00 - 0:30)

**Narration:**
> "This is Alcovia — an offline-first study app for students. I'm going to show two devices running the same student account, going offline, making changes, and converging perfectly when they reconnect."

**Actions:**
- Show both devices side by side
- Point out different client IDs in Dev panel
- Show Focus tab on Device A, Syllabus tab on Device B

---

### 2. Focus Session (0:30 - 1:00)

**Narration:**
> "Device A starts a focus session. I'll use the 6-second preset for demo speed."

**Actions:**
- Device A: Select **6s** preset
- Click **Start Focus Session**
- Wait for timer to complete (6 seconds)
- Show **"Session Complete!"** with +50 coins
- Point out streak increased to 1

---

### 3. Device A Goes Offline (1:00 - 1:30)

**Narration:**
> "Now Device A loses network — maybe the student is on a metro. The app works fully offline."

**Actions:**
- Device A: Switch to **Dev** tab
- Toggle **Offline** switch
- Switch to **Syllabus** tab
- Expand a subject → chapter → task
- Change a task from "Not Started" to "In Progress"
- Switch back to **Dev** tab
- Show **Pending Operations** increased

---

### 4. Device B Goes Offline (1:30 - 2:00)

**Narration:**
> "Device B also goes offline — maybe the student's laptop in a classroom. Both devices can edit independently."

**Actions:**
- Device B: Switch to **Dev** tab
- Toggle **Offline** switch
- Switch to **Syllabus** tab
- Expand a different subject
- Change a different task to **Done**
- Also change a task that Device A edited to **Done** (conflict!)
- Switch back to **Dev** tab
- Show **Pending Operations** on both devices

---

### 5. Reconnect and Sync (2:00 - 2:45)

**Narration:**
> "Now both devices come back online. Device A syncs first, then Device B, then Device A syncs again to catch Device B's operations."

**Actions:**
- Device A: Toggle **Online** switch
- Click **Sync Now** (gets its own ops + server ops)
- Device B: Toggle **Online** switch
- Click **Sync Now** (gets its own ops + Device A's ops)
- Device A: Click **Sync Now** again (gets Device B's ops)
- Show both devices now have identical stats

**Verification:**
- Show both devices have same streak, coins, today minutes
- Show both devices show the same task statuses
- Conflict task: explain which one won (higher Lamport timestamp)

**Important:** The sync button now syncs in a loop until no more new ops arrive. But Device A still needs one final sync after Device B to catch any new ops B added.

---

### 6. Server State (2:45 - 3:15)

**Narration:**
> "The server stores all operations immutably. No duplicates, no overwrites."

**Actions:**
- Switch to **Window 3** or open new tab: http://localhost:3001/api/state/student-1
- Show the operation count
- Show stats: focusStreak, coins, todayFocusMinutes
- Point out totalSuccessfulSessions matches what both devices show
- Explain that the server rebuilds state from operations, same as clients

---

### 7. Notification Log (3:15 - 3:45)

**Narration:**
> "The focus session from Device A triggered exactly one notification, even though it synced to both devices. This is our idempotency guarantee."

**Actions:**
- Open http://localhost:3001/api/notification-log
- Show the notification entry with sessionId
- Explain: "sessionId is the deduplication key"
- Show there are no duplicate notifications for the same session
- Explain n8n workflow: webhook → dedup check → if new → log

---

### 8. Delete Conflict Resolution (3:45 - 4:30)

**Narration:**
> "Now I'll show a harder conflict: Device A deletes a task, while Device B changes its status."

**Actions:**
- Device A: Toggle **Offline** switch
- Device B: Toggle **Offline** switch
- Device A: Delete a task (click Delete button)
- Device B: Change the SAME task to "Done"
- Both: Toggle **Online** switch
- Both: Click **Sync Now**
- Show both devices: the task is deleted (strikethrough)
- Narration: "Delete always wins. Once a task is deleted, it stays deleted."

---

### 9. Architecture Walkthrough (4:30 - 5:00)

**Narration:**
> "Let me show how the sync works under the hood."

**Actions:**
- Device A: Switch to **Dev** tab
- Click **Operations** tab
- Show the operation log with types: FOCUS_STARTED, FOCUS_COMPLETED, TASK_STATUS_CHANGED, TASK_DELETED
- Point out Lamport timestamps (L1, L2, L3...)
- Show synced vs pending badges
- Explain: "Each operation has a unique ID and a Lamport timestamp. Devices sort by Lamport, tiebreak by deviceId. Same operations + same sort order + same reducer = identical state."

**Honest about limitations:**
> "This is solid for two devices. With 3+, clock drift could be an issue. We also don't handle network dropping mid-sync — we'd need retry logic. And we should compact the operation log periodically for production."

---

## Post-Recording

1. **Trim the video** to exactly 5 minutes using QuickTime (Edit → Trim)
2. **Rename to:** `Alcovia-Demo-5min.mp4`
3. **Upload to:** Google Drive / Dropbox / YouTube (unlisted)
4. **Add link to README** if submitting

## Troubleshooting

| Problem | Fix |
|---------|-----|
| App not loading | Check `npm run web` is running on port 8081 |
| Server not responding | Check `npm run dev` is running on port 3001 |
| n8n webhook not working | Skip it — show notification log manually, explain it works |
| Two tabs share storage | Make sure one is incognito, or URLs have different `?client=` params |
| Timer too slow | Use 6s preset for demo |

---

**Pro tip:** Practice once before recording. The 6-second timer and sync clicks need to be smooth.
