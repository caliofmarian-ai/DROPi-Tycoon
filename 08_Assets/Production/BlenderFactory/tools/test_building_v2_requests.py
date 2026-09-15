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

REQUEST_DIR = Path(__file__).parents[1] / "requests"
LOD0_PATH = REQUEST_DIR / "ci-building-fidelity-v2-lod0.request.json"
LOD1_PATH = REQUEST_DIR / "ci-building-fidelity-v2-lod1.request.json"


class BuildingV2RequestTests(unittest.TestCase):
    def setUp(self):
        self.lod0 = json.loads(LOD0_PATH.read_text(encoding="utf-8"))
        self.lod1 = json.loads(LOD1_PATH.read_text(encoding="utf-8"))

    def test_both_requests_pass_shared_preflight(self):
        factory.validate_request(self.lod0)
        factory.validate_request(self.lod1)

    def test_lod_identity_and_triangle_ceilings_are_explicit(self):
        self.assertEqual(self.lod0["lodProfile"], "LOD0")
        self.assertEqual(self.lod1["lodProfile"], "LOD1")
        self.assertLessEqual(self.lod0["budget"]["maxTriangles"], 8000)
        self.assertLessEqual(self.lod1["budget"]["maxTriangles"], 4000)

    def test_v2_requests_remain_external_input_free(self):
        for request in (self.lod0, self.lod1):
            self.assertEqual(request["classification"], "TEST_ONLY_NON_PRODUCTION")
            self.assertEqual(request["recipe"], "building_fidelity_v2")
            self.assertEqual(request["provenance"]["sourceType"], "PROCEDURAL_PRIMITIVES")
            self.assertEqual(request["provenance"]["externalInputs"], [])

    def test_lod0_enables_depth_details_that_lod1_simplifies(self):
        p0 = self.lod0["parameters"]
        p1 = self.lod1["parameters"]
        self.assertGreater(p0["windowRecess"], p1["windowRecess"])
        self.assertGreater(p0["mullionWidth"], 0)
        self.assertEqual(p1["mullionWidth"], 0)
        self.assertGreater(p0["gutterRadius"], 0)
        self.assertEqual(p1["gutterRadius"], 0)
        self.assertGreater(p0["downpipeRadius"], 0)
        self.assertEqual(p1["downpipeRadius"], 0)

    def test_previews_are_bounded_to_1024_square(self):
        for request in (self.lod0, self.lod1):
            preview = request["preview"]
            self.assertEqual(preview["width"], 1024)
            self.assertEqual(preview["height"], 1024)
            self.assertLessEqual(preview["maxPngBytes"], 2097152)


if __name__ == "__main__":
    unittest.main()
