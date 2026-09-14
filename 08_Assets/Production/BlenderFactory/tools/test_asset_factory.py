#!/usr/bin/env python3
import importlib.util
import json
import struct
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("asset_factory.py")
SPEC = importlib.util.spec_from_file_location("asset_factory", MODULE_PATH)
factory = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(factory)

REQUEST_PATH = Path(__file__).parents[1] / "requests" / "ci-proof-building.request.json"


def fake_glb(path: Path, payload: bytes = b"\x00\x00\x00\x00") -> None:
    total = 12 + len(payload)
    path.write_bytes(struct.pack("<4sII", b"glTF", 2, total) + payload)


class AssetFactoryTests(unittest.TestCase):
    def setUp(self):
        self.request = json.loads(REQUEST_PATH.read_text(encoding="utf-8"))

    def test_proof_request_passes_preflight(self):
        factory.validate_request(self.request)

    def test_missing_inventory_audit_fails_closed(self):
        request = json.loads(json.dumps(self.request))
        request["inventoryAudit"]["checked"] = False
        with self.assertRaises(factory.ValidationError):
            factory.validate_request(request)

    def test_external_inputs_fail_closed_in_baseline(self):
        request = json.loads(json.dumps(self.request))
        request["provenance"]["externalInputs"] = [{"path": "unknown.png"}]
        with self.assertRaises(factory.ValidationError):
            factory.validate_request(request)

    def test_postflight_budget_passes_for_bounded_report(self):
        with tempfile.TemporaryDirectory() as tmp:
            glb = Path(tmp) / "proof.glb"
            fake_glb(glb)
            report = {
                "schemaVersion": 1,
                "requestId": self.request["requestId"],
                "classification": self.request["classification"],
                "generator": "Blender",
                "meshObjectCount": 3,
                "materialCount": 2,
                "triangleCount": 36,
                "hasCollisionProxy": True,
                "automaticPromotion": False
            }
            factory.validate_postflight(self.request, report, glb)

    def test_postflight_triangle_overrun_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            glb = Path(tmp) / "proof.glb"
            fake_glb(glb)
            report = {
                "schemaVersion": 1,
                "requestId": self.request["requestId"],
                "classification": self.request["classification"],
                "generator": "Blender",
                "meshObjectCount": 3,
                "materialCount": 2,
                "triangleCount": self.request["budget"]["maxTriangles"] + 1,
                "hasCollisionProxy": True,
                "automaticPromotion": False
            }
            with self.assertRaises(factory.ValidationError):
                factory.validate_postflight(self.request, report, glb)

    def test_invalid_glb_header_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            glb = Path(tmp) / "bad.glb"
            glb.write_bytes(b"not-a-glb")
            with self.assertRaises(factory.ValidationError):
                factory.validate_glb_header(glb)


if __name__ == "__main__":
    unittest.main()
