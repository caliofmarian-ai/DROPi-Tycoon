import { describe, expect, it } from 'vitest';
import registry from '../../04_World/Country_Catalog/EXPANDED_LOCALITY_SOURCE_REGISTRY.json';

describe('expanded locality retained source snapshot', () => {
  it('pins the exact retained GeoNames snapshot used by production importers', () => {
    expect(registry.version).toBe('1.1.0');
    expect(registry.retainedSnapshot.status).toBe('RETAINED');
    expect(registry.retainedSnapshot.releaseTag).toBe('source-geonames-cities500-2026-09-08-f3cda4f9');
    expect(registry.retainedSnapshot.targetCommit).toBe('5e7a3339ae70eb07529135bb13bb44477aaad038');
    expect(registry.retainedSnapshot.assets['cities500.zip']).toMatchObject({
      sha256: 'f3cda4f9d256d90045121fb8eebad3ed91695c32370ed93b50fbe0cb616e2bbd',
      bytes: 13602522,
    });
    expect(registry.retainedSnapshot.assets['admin1CodesASCII.txt'].sha256).toBe(
      '590651498043f674accda2b7f46d21286cda0e290b02f8561c5005eee9a5448c',
    );
    expect(registry.retainedSnapshot.assets['geonames-readme.txt'].sha256).toBe(
      'b1957379b6c1242c700c98ac9a8aa0a09f56c3c0a50ee72175527005f48ef2c5',
    );
    expect(registry.governance.rawSnapshotRetentionSatisfied).toBe(true);
    expect(registry.governance.productionImporterMustUseRetainedSnapshot).toBe(true);
  });
});
