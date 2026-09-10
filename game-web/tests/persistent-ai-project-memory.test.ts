import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const currentStateUrl = new URL('../../09_Development/AI_Project_Memory/CURRENT_STATE.json', import.meta.url);
const handoffsUrl = new URL('../../09_Development/AI_Project_Memory/HANDOFFS.json', import.meta.url);

function readJson(url: URL) {
  return JSON.parse(readFileSync(url, 'utf8'));
}

describe('persistent AI project memory governance', () => {
  it('keeps one deterministic live-reconciled operational state', () => {
    const state = readJson(currentStateUrl);
    expect(state.schemaVersion).toBe(1);
    expect(state.repository).toBe('caliofmarian-ai/DROPi-Tycoon');
    expect(state.mutableStateAuthority).toBe('LIVE_GITHUB');
    expect(state.liveReconciliationRequired).toBe(true);
    expect(state.observedMainSha).toMatch(/^[0-9a-f]{40}$/);
    expect(state.activePullRequests.length).toBeGreaterThan(0);
    expect(new Set(state.activePullRequests.map((item: { pr: number }) => item.pr)).size)
      .toBe(state.activePullRequests.length);
  });

  it('provides one effective durable handoff for DT-00 through DT-22', () => {
    const doc = readJson(handoffsUrl);
    expect(doc.completionInvariant).toBe('NO DURABLE HANDOFF = SESSION NOT OPERATIONALLY COMPLETE');
    expect(doc.liveReconciliationRequired).toBe(true);

    const effective = doc.handoffs.map((record: Record<string, unknown>) => ({
      ...doc.defaultFields,
      ...record,
    }));
    expect(effective).toHaveLength(23);
    expect(new Set(effective.map((item: { agentId: string }) => item.agentId)).size).toBe(23);

    for (let index = 0; index <= 22; index += 1) {
      const id = `DT-${String(index).padStart(2, '0')}`;
      const handoff = effective.find((item: { agentId: string }) => item.agentId === id);
      expect(handoff, `missing ${id}`).toBeTruthy();
      expect(handoff.ownershipBoundary).toBeTruthy();
      expect(handoff.mission).toBeTruthy();
      expect(handoff.status).toBeTruthy();
      expect(handoff.nextSafeAction).toBeTruthy();
      expect(handoff.liveReconciliationRequired).toBe(true);
      expect(handoff.observedMainSha).toMatch(/^[0-9a-f]{40}$/);
      expect(Array.isArray(handoff.forbiddenActions)).toBe(true);
      expect(handoff.forbiddenActions.length).toBeGreaterThan(0);
    }
  });

  it('prevents duplicate exclusive ownership and duplicate active PR assignment', () => {
    const doc = readJson(handoffsUrl);
    const effective = doc.handoffs.map((record: Record<string, unknown>) => ({
      ...doc.defaultFields,
      ...record,
    }));
    const pathOwners = new Map<string, string>();
    const prOwners = new Map<number, string>();

    for (const handoff of effective) {
      for (const path of handoff.exclusivePaths ?? []) {
        expect(pathOwners.has(path), `duplicate ownership for ${path}`).toBe(false);
        pathOwners.set(path, handoff.agentId);
      }
      if (Number.isInteger(handoff.pr)) {
        expect(prOwners.has(handoff.pr), `duplicate PR ownership for #${handoff.pr}`).toBe(false);
        prOwners.set(handoff.pr, handoff.agentId);
      }
    }
  });
});
