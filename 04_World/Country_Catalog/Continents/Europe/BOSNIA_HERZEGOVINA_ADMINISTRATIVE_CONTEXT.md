# Bosnia and Herzegovina Administrative Context

Status: canonical top-level territorial/governance note for issue #522 under Europe rollout #508.

## Top-level territorial model

Bosnia and Herzegovina is represented with three governed territorial surfaces:

1. Federation of Bosnia and Herzegovina
2. Republika Srpska
3. Brčko District of Bosnia and Herzegovina

The first two are the country's two Entities. Brčko District is **not a third Entity**.

References:
- Bosnia and Herzegovina Agency for Statistics: https://bhas.gov.ba/data/Publikacije/Metodologije/IndeksRodneRavnopravnosti_E.pdf
- Brčko District Statute / OHR: https://www.ohr.int/ohr_archive/statute-of-the-brcko-district-of-bosnia-and-herzegovina/?print=print
- OHR status clarification: https://www.ohr.int/is-brcko-district-a-condominium-an-entity-or-a-municipality/

The Brčko Statute describes the District as a single administrative unit of local self-government under the sovereignty of Bosnia and Herzegovina. DROPi therefore gives it a separate territorial gameplay node while preserving its non-Entity classification.

## Retained source alignment

The retained GeoNames snapshot maps directly to the three governed surfaces:
- `BA.01` Federation of B&H → Sarajevo (`PPLC`);
- `BA.02` Srpska → Banja Luka (`PPLA`);
- `BA.BRC` Brčko → Brčko (`PPLA`).

No fallback or invented coordinate is necessary.

Sarajevo remains the national-capital locality and also the representative node inside the Federation source ownership. Banja Luka and Brčko are source-backed regional representatives.

## Economy rule

All three nodes participate in shared Bosnia and Herzegovina regional/national multiplayer economic simulation. Their future prominence and development are not personal-player progression unlocks.
