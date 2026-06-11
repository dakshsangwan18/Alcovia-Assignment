const API = "http://localhost:3001";
const STUDENT = "student-1";

// Simulated client storage
const deviceA = { ops: [], watermark: 0, deviceId: "device-A" };
const deviceB = { ops: [], watermark: 0, deviceId: "device-B" };

async function syncDevice(device) {
  const unsynced = device.ops.filter(o => !o.synced);
  
  const res = await fetch(`${API}/api/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentId: STUDENT,
      deviceId: device.deviceId,
      lastPulledSeqNo: device.watermark,
      operations: unsynced,
    }),
  });
  
  if (!res.ok) {
    console.log(`${device.deviceId}: Sync failed with status ${res.status}`);
    return false;
  }
  
  const data = await res.json();
  
  // Store pulled ops
  for (const op of data.operations) {
    const exists = device.ops.find(o => o.operationId === op.operationId);
    if (!exists) {
      device.ops.push({ ...op, synced: true });
    }
  }
  
  // Mark local ops as synced
  for (const op of unsynced) {
    op.synced = true;
  }
  
  const changed = data.currentSeqNo !== device.watermark;
  device.watermark = data.currentSeqNo;
  console.log(`${device.deviceId}: Synced. Watermark=${device.watermark}, Ops=${device.ops.length} ${changed ? "(got new ops)" : ""}`);
  return changed;
}

async function syncUntilConvergence(device) {
  let changed = true;
  let rounds = 0;
  while (changed && rounds < 5) {
    changed = await syncDevice(device);
    rounds++;
  }
  console.log(`${device.deviceId}: Converged after ${rounds} round(s)`);
}

async function test() {
  console.log("=== TESTING TWO DEVICE SYNC (WITH CONVERGENCE) ===\n");
  
  // Initial sync for both devices
  console.log("1. Initial sync for both devices...");
  await syncUntilConvergence(deviceA);
  await syncUntilConvergence(deviceB);
  
  // Device A goes offline, creates a task status change
  console.log("\n2. Device A goes offline, changes task status...");
  const aOp = {
    operationId: `op-a-${Date.now()}`,
    deviceId: "device-A",
    lamportTimestamp: 200,
    entityId: "subject-math-ch-algebra-t1",
    type: "TASK_STATUS_CHANGED",
    payload: { status: "done" },
    clientTimestamp: new Date().toISOString(),
    synced: false,
  };
  deviceA.ops.push(aOp);
  
  // Device B goes offline, creates a different task status change
  console.log("3. Device B goes offline, changes different task...");
  const bOp = {
    operationId: `op-b-${Date.now()}`,
    deviceId: "device-B",
    lamportTimestamp: 201,
    entityId: "subject-math-ch-algebra-t2",
    type: "TASK_STATUS_CHANGED",
    payload: { status: "done" },
    clientTimestamp: new Date().toISOString(),
    synced: false,
  };
  deviceB.ops.push(bOp);
  
  // Both come back online and sync
  // In real app: user clicks Sync Now on both devices
  // Order matters: A syncs, B syncs (adds new ops), A syncs again to catch up
  console.log("\n4. Device A syncs...");
  await syncUntilConvergence(deviceA);
  
  console.log("5. Device B syncs...");
  await syncUntilConvergence(deviceB);
  
  console.log("6. Device A syncs again to catch Device B's ops...");
  await syncUntilConvergence(deviceA);
  
  // Verify both have same ops
  console.log("\n=== VERIFICATION ===");
  console.log(`Device A has ${deviceA.ops.length} ops`);
  console.log(`Device B has ${deviceB.ops.length} ops`);
  
  const aIds = deviceA.ops.map(o => o.operationId).sort();
  const bIds = deviceB.ops.map(o => o.operationId).sort();
  
  const same = JSON.stringify(aIds) === JSON.stringify(bIds);
  console.log(`\nBoth devices have same operations: ${same ? "✅ YES" : "❌ NO"}`);
  
  if (!same) {
    console.log("\nMissing in A:", bIds.filter(id => !aIds.includes(id)));
    console.log("Missing in B:", aIds.filter(id => !bIds.includes(id)));
  }
  
  // Check server state
  console.log("\n=== SERVER STATE ===");
  const state = await (await fetch(`${API}/api/state/${STUDENT}`)).json();
  console.log(`Server has ${state.operationsTotal} ops`);
  
  return same;
}

test().then(success => {
  console.log(`\n=== TEST ${success ? "PASSED" : "FAILED"} ===`);
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
