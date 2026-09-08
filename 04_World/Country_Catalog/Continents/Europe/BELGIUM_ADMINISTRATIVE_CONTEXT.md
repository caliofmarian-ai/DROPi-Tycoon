# Belgium Administrative Context

Status: canonical territorial-hierarchy note for issue #520 under Europe rollout #508.

## Territorial level used by DROPi

Belgium is a federal state with three Communities and three Regions. DROPi's geographic/economic world-map hierarchy uses the **three territorial Regions**:

1. Flemish Region
2. Brussels-Capital Region
3. Walloon Region

The Communities are person/language-oriented governance entities and are not duplicated as geographic world-map regions.

Official references:
- Belgium federal structure: https://www.belgium.be/sites/default/files/Brochure_2022_Anglais_web.pdf
- Belgian electoral/federal structure: https://verkiezingen.belgium.be/algemeen/belgische-parlementaire-verkiezingsstructuur

The retained GeoNames source aligns directly with those three territorial regions as `BE.BRU`, `BE.VLG`, and `BE.WAL`.

## Flemish Region exception

Brussels is the capital of Belgium and of Flanders. The Flemish Government, Flemish Parliament and most central Flemish administration are located in Brussels, even though the Brussels-Capital Region is territorially separate from the Flemish Region.

Official Flemish reference:
- https://www.vlaanderen.be/gemeenten-en-provincies/brussel/vlaamse-overheid-in-brussel

The retained source reflects this by giving Flanders (`BE.VLG`) no `PPLA` or `PPLC` locality. DROPi therefore uses:

- **Brussels-Capital Region → Brussels** as the national-capital territorial node;
- **Flemish Region → Antwerp** as the highest-population source-backed locality inside `BE.VLG` and therefore the gameplay representative locality;
- **Walloon Region → Namur** as its source-backed `PPLA` regional node.

Antwerp is **not** labeled as the capital of Flanders. The real capital/institutional relationship to Brussels remains explicit metadata. This prevents one Brussels locality identity from being owned by two territorial regions.

## Economy rule

All three territorial regional nodes participate in the shared Belgian multiplayer economy. Their prominence and development are not personal-player progression unlocks.
