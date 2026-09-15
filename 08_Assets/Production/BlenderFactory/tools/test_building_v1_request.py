#!/usr/bin/env python3
import importlib.util
import json
import unittest
from pathlib import Path

FACTORY_PATH = Path(__file__).with_name("asset_factory.py")
SPEC = importlib.util.spec_from_file_location("asset_factory", FACTORY_PATH)
factory = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(factory)

REQUEST_PATH = Path(__file__).parents[1] / "requests" / "ci-building-detail-v1.request.json"


class BuildingV1RequestTests(unittest.TestCase):
    def setUp(self):
        self.request = json.loads(REQUEST_PATH.read_text(encoding="utf-8"))

    def test_shared_preflight_accepts_request(self):
        factory.validate_request(self.request)

    def test_request_uses_only_governed_procedural_inputs(self):
        self.assertEqual(self.request["classification"], "TEST_ONLY_NON_PRODUCTION")
        self.assertEqual(self.request["recipe"], "building_facade_v1")
        self.assertEqual(self.request["provenance"]["sourceType"], "PROCEDURAL_PRIMITIVES")
        self.assertEqual(self.request["provenance"]["externalInputs"], [])

    def test_geometry_budget_is_bounded(self):
        params = self.request["parameters"]
        budget = self.request["budget"]
        self.assertLessEqual(params["floors"], 6)
        self.assertLessEqual(params["frontBays"], 8)
        self.assertLessEqual(params["sideBays"], 6)
        self.assertLessEqual(budget["maxTriangles"], 5000)
        self.assertLessEqual(budget["maxMaterials"], 8)
        self.assertLessEqual(params["bodyTextureSize"], 256)

    def test_preview_budget_is_bounded_high_resolution(self):
        preview = self.request["preview"]
        self.assertEqual(preview["width"], 1024)
        self.assertEqual(preview["height"], 1024)
        self.assertLessEqual(preview["maxPngBytes"], 2097152)


if __name__ == "__main__":
    unittest.main()
