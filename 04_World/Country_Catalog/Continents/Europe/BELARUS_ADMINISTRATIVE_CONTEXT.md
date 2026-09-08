# Belarus Administrative Context

Status: canonical exception note for issue #517 under Europe rollout #508.

## First-order model

DROPi accounts for seven first-order units: six voblasts plus Minsk City. Minsk City is governed separately as the national-capital unit.

References:
- 2025 Factbook record: https://iarpa.org/international/factbook/belarus/
- Belarus local-authority law translation: https://cis-legislation.com/document.fwx?rgn=30374

## Minsk Region exception

Minsk City is not owned by Minsk Region as a DROPi first-order geography. However, Minsk serves as the administrative centre of Minsk Region.

The retained GeoNames snapshot reflects this separation:
- `BY.04` Minsk City contains the national-capital locality `Minsk` (`PPLC`, `geonames:625144`);
- `BY.05` Minsk Region has no retained `PPLA`/`PPLC` locality inside its own admin1 ownership;
- `Barysaw` (`PPLA2`, `geonames:630376`) is the deterministic highest-population governed fallback inside `BY.05`.

Therefore DROPi uses:
- **Minsk City → Minsk** as national-capital and regional node;
- **Minsk Voblast → Barysaw** as the gameplay representative locality inside the region.

This does not claim that Barysaw is the administrative capital of Minsk Region. It is explicitly a representative gameplay locality selected to preserve unambiguous geographic ownership while the real administrative-centre relationship to Minsk remains canonical metadata.

## Economy rule

Both units participate in the shared regional/national multiplayer economy. Their future prominence and development are not personal-player progression unlocks.
