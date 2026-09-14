#!/usr/bin/env python3
"""DT-19 Blender Asset Factory preflight/postflight validator.

This script intentionally uses only the Python standard library so CI can
validate requests before Blender is installed or invoked.
"""

from __future__ import annotations

import argparse
import json
import struct
import sys
from pathlib import Path

CANONICAL_INVENTORY = "08_Assets/Production/asset-inventory.v1.json"
ALLOWED_CLASSIFICATIONS = {"TEST_ONLY_NON_PRODUCTION", "CANDIDATE_GENERATION_REQUEST"}
ALLOWED_SOURCE_TYPES = {"PROCEDURAL_PRIMITIVES"}


class ValidationError(Exception):
    pass


def load_json(path: Path) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ValidationError(f"missing file: {path}") from exc
    except json.JSONDecodeError as exc:
        raise ValidationError(f"invalid JSON in {path}: {exc}") from exc
    if not isinstance(value, dict):
        raise ValidationError(f"top-level JSON must be an object: {path}")
    return value


def require_nonempty_string(obj: dict, key: str, where: str) -> str:
    value = obj.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValidationError(f"{where}.{key} must be a non-empty string")
    return value.strip()


def require_positive_int(obj: dict, key: str, where: str) -> int:
    value = obj.get(key)
    if not isinstance(value, int) or isinstance(value, bool) or value <= 0:
        raise ValidationError(f"{where}.{key} must be a positive integer")
    return value


def validate_request(request: dict) -> None:
    if request.get("schemaVersion") != 1:
        raise ValidationError("schemaVersion must equal 1")

    require_nonempty_string(request, "requestId", "request")
    issue = request.get("issue")
    if not isinstance(issue, int) or isinstance(issue, bool) or issue <= 0:
        raise ValidationError("request.issue must be a positive integer")

    classification = require_nonempty_string(request, "classification", "request")
    if classification not in ALLOWED_CLASSIFICATIONS:
        raise ValidationError(f"unsupported request.classification: {classification}")

    require_nonempty_string(request, "semanticFamily", "request")
    reason = require_nonempty_string(request, "generationReason", "request")
    if len(reason) < 40:
        raise ValidationError("request.generationReason is too short to establish a concrete missing capability")

    audit = request.get("inventoryAudit")
    if not isinstance(audit, dict):
        raise ValidationError("request.inventoryAudit must be an object")
    if audit.get("checked") is not True:
        raise ValidationError("request.inventoryAudit.checked must be true")
    if audit.get("inventoryRef") != CANONICAL_INVENTORY:
        raise ValidationError(f"request.inventoryAudit.inventoryRef must equal {CANONICAL_INVENTORY}")
    require_nonempty_string(audit, "missingCapability", "request.inventoryAudit")
    require_nonempty_string(audit, "reuseDecision", "request.inventoryAudit")
    checked_families = audit.get("checkedFamilies")
    if not isinstance(checked_families, list):
        raise ValidationError("request.inventoryAudit.checkedFamilies must be an array")

    provenance = request.get("provenance")
    if not isinstance(provenance, dict):
        raise ValidationError("request.provenance must be an object")
    if provenance.get("generator") != "Blender":
        raise ValidationError("request.provenance.generator must equal Blender")
    source_type = provenance.get("sourceType")
    if source_type not in ALLOWED_SOURCE_TYPES:
        raise ValidationError(f"unsupported request.provenance.sourceType: {source_type}")
    external_inputs = provenance.get("externalInputs")
    if not isinstance(external_inputs, list):
        raise ValidationError("request.provenance.externalInputs must be an array")
    if external_inputs:
        raise ValidationError("baseline factory does not authorize externalInputs; govern that source type in a later issue")
    if provenance.get("legalQualificationAuthority") != "DT-13":
        raise ValidationError("request.provenance.legalQualificationAuthority must equal DT-13")

    budget = request.get("budget")
    if not isinstance(budget, dict):
        raise ValidationError("request.budget must be an object")
    require_positive_int(budget, "maxTriangles", "request.budget")
    require_positive_int(budget, "maxMaterials", "request.budget")
    require_positive_int(budget, "maxGlbBytes", "request.budget")
    if not isinstance(budget.get("requireCollisionProxy"), bool):
        raise ValidationError("request.budget.requireCollisionProxy must be boolean")

    params = request.get("parameters")
    if not isinstance(params, dict) or not params:
        raise ValidationError("request.parameters must be a non-empty object")

    if classification == "TEST_ONLY_NON_PRODUCTION":
        forbidden_claims = {
            "APPROVED_SOURCE",
            "PRODUCTION_READY",
            "RUNTIME_INTEGRATED",
            "ANDROID_VERIFIED",
            "CLEARED",
        }
        serialized = json.dumps(request, sort_keys=True)
        for claim in forbidden_claims:
            if f'"lifecycleState": "{claim}"' in serialized:
                raise ValidationError(f"test-only request may not claim lifecycle state {claim}")


def validate_glb_header(path: Path) -> int:
    try:
        raw = path.read_bytes()
    except FileNotFoundError as exc:
        raise ValidationError(f"missing GLB: {path}") from exc
    if len(raw) < 12:
        raise ValidationError("GLB is too small")
    magic, version, declared_length = struct.unpack("<4sII", raw[:12])
    if magic != b"glTF":
        raise ValidationError("GLB magic must equal glTF")
    if version != 2:
        raise ValidationError(f"GLB version must equal 2, got {version}")
    if declared_length != len(raw):
        raise ValidationError(f"GLB declared length {declared_length} does not match file length {len(raw)}")
    return len(raw)


def validate_postflight(request: dict, report: dict, glb_path: Path) -> None:
    validate_request(request)
    glb_bytes = validate_glb_header(glb_path)

    if report.get("schemaVersion") != 1:
        raise ValidationError("report.schemaVersion must equal 1")
    if report.get("requestId") != request["requestId"]:
        raise ValidationError("report.requestId must match request.requestId")
    if report.get("generator") != "Blender":
        raise ValidationError("report.generator must equal Blender")
    if report.get("classification") != request["classification"]:
        raise ValidationError("report.classification must match request.classification")

    budget = request["budget"]
    triangles = require_positive_int(report, "triangleCount", "report")
    materials = require_positive_int(report, "materialCount", "report")
    require_positive_int(report, "meshObjectCount", "report")

    if triangles > budget["maxTriangles"]:
        raise ValidationError(f"triangle budget exceeded: {triangles} > {budget['maxTriangles']}")
    if materials > budget["maxMaterials"]:
        raise ValidationError(f"material budget exceeded: {materials} > {budget['maxMaterials']}")
    if glb_bytes > budget["maxGlbBytes"]:
        raise ValidationError(f"GLB byte budget exceeded: {glb_bytes} > {budget['maxGlbBytes']}")

    has_collision = report.get("hasCollisionProxy")
    if not isinstance(has_collision, bool):
        raise ValidationError("report.hasCollisionProxy must be boolean")
    if budget["requireCollisionProxy"] and not has_collision:
        raise ValidationError("collision proxy required but not present")

    if report.get("automaticPromotion") is not False:
        raise ValidationError("report.automaticPromotion must be false")


def cmd_preflight(args: argparse.Namespace) -> None:
    request = load_json(Path(args.request))
    validate_request(request)
    print(f"DT-19 asset factory preflight PASS: {request['requestId']}")


def cmd_postflight(args: argparse.Namespace) -> None:
    request = load_json(Path(args.request))
    report = load_json(Path(args.report))
    validate_postflight(request, report, Path(args.glb))
    print(
        "DT-19 asset factory postflight PASS: "
        f"{request['requestId']} triangles={report['triangleCount']} "
        f"materials={report['materialCount']} glb={Path(args.glb).stat().st_size}B"
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)

    pre = sub.add_parser("preflight")
    pre.add_argument("--request", required=True)
    pre.set_defaults(func=cmd_preflight)

    post = sub.add_parser("postflight")
    post.add_argument("--request", required=True)
    post.add_argument("--report", required=True)
    post.add_argument("--glb", required=True)
    post.set_defaults(func=cmd_postflight)
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        args.func(args)
        return 0
    except ValidationError as exc:
        print(f"DT-19 asset factory FAIL: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
