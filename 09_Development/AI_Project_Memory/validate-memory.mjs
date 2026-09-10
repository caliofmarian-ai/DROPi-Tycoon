#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const failures = [];
const warnings = [];
const sha40 = /^[0-9a-f]{40}$/;
const allowedStatuses = new Set([
  'UNKNOWN','ACTIVE','IMPLEMENTATION_BACKFILL_VALIDATION','PARALLEL_PREP',
  'WAIT_MERGE_LANE','HOLD_SCOPE','HOLD_FINAL_AUDIT','HOLD',
  'WAITING_DEPENDENCY','ACTIVE_GOVERNANCE','MERGED_EXACT_MAIN_VERIFIED',
  'READY_FOR_DT00_REAUDIT','READY_FOR_EXTERNAL_RECOVERY'
]);

function readJson(name) {
  try {
    return JSON.parse(fs.readFileSync(path.join(here, name), 'utf8'));
  } catch (error) {
    failures.push(`${name} malformed or unreadable: ${error.message}`);
    return null;
  }
}

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    failures.push(`${label} must be an object`);
    return false;
  }
  return true;
}

function requireKeys(value, keys, label) {
  if (!requireObject(value, label)) return;
  for (const key of keys) if (!(key in value)) failures.push(`${label} missing required field: ${key}`);
}

function requireArray(value, label) {
  if (!Array.isArray(value)) failures.push(`${label} must be an array`);
}

function requireNonEmptyString(value, label) {
  if (typeof value !== 'string' || !value.trim()) failures.push(`${label} must be a non-empty string`);
}

const state = readJson('CURRENT_STATE.json');
const doc = readJson('HANDOFFS.json');

if (state) {
  requireKeys(state, [
    'schemaVersion','snapshotId','snapshotType','projectIdentity','repository','observedAt',
    'observedMainSha','liveReconciliationRequired','mutableStateAuthority',
    'canonicalAuthorityPointers','authorityLayers','activePullRequests','dependencyAndMergeOrder',
    'nextSafeOrchestratorAction'
  ], 'CURRENT_STATE');
  if (!sha40.test(state.observedMainSha ?? '')) failures.push('CURRENT_STATE observedMainSha must be a 40-character lowercase Git SHA');
  if (state.liveReconciliationRequired !== true) failures.push('CURRENT_STATE must require live GitHub reconciliation');
  if (state.mutableStateAuthority !== 'LIVE_GITHUB') failures.push('CURRENT_STATE mutableStateAuthority must be LIVE_GITHUB');
  requireObject(state.projectIdentity, 'CURRENT_STATE.projectIdentity');
  requireNonEmptyString(state.projectIdentity?.name, 'CURRENT_STATE.projectIdentity.name');
  requireNonEmptyString(state.projectIdentity?.owner, 'CURRENT_STATE.projectIdentity.owner');
  requireObject(state.canonicalAuthorityPointers, 'CURRENT_STATE.canonicalAuthorityPointers');
  for (const key of ['vision','projectStatus','architecture','mobileApplicationPlatform','rule']) {
    requireNonEmptyString(state.canonicalAuthorityPointers?.[key], `CURRENT_STATE.canonicalAuthorityPointers.${key}`);
  }
  requireArray(state.activePullRequests, 'CURRENT_STATE.activePullRequests');
  requireArray(state.dependencyAndMergeOrder, 'CURRENT_STATE.dependencyAndMergeOrder');

  const seenPr = new Set();
  for (const item of state.activePullRequests ?? []) {
    requireKeys(item, ['pr','dt','issue','baseSha','headSha','branch','state','draft','mergeable','workState','ci'], `CURRENT_STATE PR ${item?.pr ?? 'UNKNOWN'}`);
    if (seenPr.has(item.pr)) failures.push(`duplicate active PR record: ${item.pr}`);
    seenPr.add(item.pr);
    if (!/^DT-\d{2}$/.test(item.dt ?? '')) failures.push(`PR ${item.pr} has invalid DT id`);
    if (!sha40.test(item.baseSha ?? '')) failures.push(`PR ${item.pr} has malformed baseSha`);
    if (!sha40.test(item.headSha ?? '')) failures.push(`PR ${item.pr} has malformed headSha`);
  }
}

if (doc) {
  requireKeys(doc, [
    'schemaVersion','recordType','repository','observedAt','observedMainSha',
    'liveReconciliationRequired','completionInvariant','inheritanceRule',
    'defaultFields','handoffs'
  ], 'HANDOFFS');
  if (doc.completionInvariant !== 'NO DURABLE HANDOFF = SESSION NOT OPERATIONALLY COMPLETE') failures.push('HANDOFFS completion invariant is missing or altered');
  if (doc.liveReconciliationRequired !== true) failures.push('HANDOFFS must require live reconciliation');
  if (!sha40.test(doc.observedMainSha ?? '')) failures.push('HANDOFFS observedMainSha must be a 40-character lowercase Git SHA');
  requireObject(doc.defaultFields, 'HANDOFFS.defaultFields');
  requireArray(doc.handoffs, 'HANDOFFS.handoffs');

  const required = [
    'agentId','role','ownershipBoundary','mission','observedMainSha',
    'liveReconciliationRequired','issue','pr','branch','headSha','status',
    'materialFindings','evidence','ownerDirectives','rejectedAssumptions',
    'unknowns','blockersDependencies','exactHeadCi','forbiddenActions',
    'nextSafeAction','canonicalReportReferences'
  ];
  const seenAgent = new Set();
  const seenPr = new Map();
  const exclusiveClaims = new Map();

  for (const stored of doc.handoffs ?? []) {
    const handoff = { ...doc.defaultFields, ...stored };
    requireKeys(handoff, required, `handoff ${handoff.agentId ?? 'UNKNOWN'}`);
    if (!/^DT-\d{2}$/.test(handoff.agentId ?? '')) failures.push(`invalid agentId: ${handoff.agentId}`);
    if (seenAgent.has(handoff.agentId)) failures.push(`duplicate current handoff for ${handoff.agentId}`);
    seenAgent.add(handoff.agentId);
    if (!allowedStatuses.has(handoff.status)) failures.push(`${handoff.agentId} has invalid status: ${handoff.status}`);
    if (!sha40.test(handoff.observedMainSha ?? '')) failures.push(`${handoff.agentId} has malformed observedMainSha`);
    if (handoff.liveReconciliationRequired !== true) failures.push(`${handoff.agentId} must require live reconciliation`);

    for (const key of ['materialFindings','evidence','ownerDirectives','rejectedAssumptions','unknowns','blockersDependencies','forbiddenActions','canonicalReportReferences']) {
      requireArray(handoff[key], `${handoff.agentId}.${key}`);
    }
    requireObject(handoff.exactHeadCi, `${handoff.agentId}.exactHeadCi`);

    const head = handoff.headSha;
    if (head !== 'UNKNOWN' && head !== 'MERGED' && !sha40.test(head ?? '')) failures.push(`${handoff.agentId} headSha must be UNKNOWN, MERGED, or a 40-character Git SHA`);
    if (!handoff.nextSafeAction || typeof handoff.nextSafeAction !== 'string') failures.push(`${handoff.agentId} must have nextSafeAction`);
    if (!handoff.forbiddenActions?.length) failures.push(`${handoff.agentId} must preserve forbidden actions`);
    if (handoff.status === 'UNKNOWN' && !handoff.unknowns?.length) failures.push(`${handoff.agentId} status UNKNOWN requires an explicit unknowns entry`);

    for (const claim of stored.exclusivePaths ?? []) {
      const previous = exclusiveClaims.get(claim);
      if (previous && previous !== handoff.agentId) failures.push(`duplicate exclusive ownership claim ${claim}: ${previous} and ${handoff.agentId}`);
      exclusiveClaims.set(claim, handoff.agentId);
    }
    if (Number.isInteger(handoff.pr)) {
      const previous = seenPr.get(handoff.pr);
      if (previous && previous !== handoff.agentId) failures.push(`PR #${handoff.pr} assigned to multiple current agents: ${previous} and ${handoff.agentId}`);
      seenPr.set(handoff.pr, handoff.agentId);
    }
  }

  for (let i = 0; i <= 22; i += 1) {
    const id = `DT-${String(i).padStart(2, '0')}`;
    if (!seenAgent.has(id)) failures.push(`missing durable handoff for ${id}`);
  }
}

if (state && doc && state.observedMainSha !== doc.observedMainSha) failures.push('CURRENT_STATE and HANDOFFS observedMainSha contradict each other');

const args = process.argv.slice(2);
const idx = args.indexOf('--current-main');
if (idx !== -1) {
  const supplied = args[idx + 1];
  if (!sha40.test(supplied ?? '')) failures.push('--current-main requires a 40-character lowercase Git SHA');
  else if (state && supplied !== state.observedMainSha) warnings.push(`STALE: persisted observedMainSha=${state.observedMainSha}; supplied live main=${supplied}`);
}

if (failures.length) {
  console.error('PERSISTENT_AI_MEMORY_VALIDATION = FAIL');
  for (const item of failures) console.error(`- ${item}`);
  for (const item of warnings) console.error(`- WARNING: ${item}`);
  process.exit(1);
}

console.log('PERSISTENT_AI_MEMORY_VALIDATION = PASS');
console.log(`handoffs=${doc?.handoffs?.length ?? 0}`);
console.log(`activePullRequests=${state?.activePullRequests?.length ?? 0}`);
for (const item of warnings) console.log(`WARNING: ${item}`);
if (warnings.length) process.exitCode = 2;
