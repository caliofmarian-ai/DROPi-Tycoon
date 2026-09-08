# Asia Country Catalog — Semantic Capital Audit

Parent: #449
Umbrella: #446

Status: current-reality semantic audit supporting the generated Asia chapter.

## Confirmed review cases

### Japan — geometry 392
The generated catalog currently promotes Kyoto as the `capital` node. The Government of Japan's current JapanGov country profile identifies Tokyo as the capital. This is a source-semantics mismatch and must not remain PASS.

### Myanmar — geometry 104
The generated catalog currently promotes Rangoon/Yangon as the `capital` node. Current Myanmar Ministry of Information material identifies Nay Pyi Taw as the State capital and Yangon as a commercial hub. This is a source-semantics mismatch and must not remain PASS.

### Sri Lanka — geometry 144
The generated catalog currently promotes Colombo as the `capital` node. Current Sri Lankan government sources identify Sri Jayewardenepura Kotte as the national/administrative capital and Colombo as the commercial capital, with major executive/judicial functions still located in Colombo. The Country Layer needs role-aware semantics rather than one misleading label.

### Israel — geometry 376
The generated catalog currently promotes Tel Aviv-Yafo as the `capital` node. Israeli Basic Law identifies Jerusalem as Israel's capital and seat of major state institutions, while the status of Jerusalem is disputed internationally and remains subject to international-law and permanent-status considerations. The Country Layer must not encode Tel Aviv as Israel's national capital and must represent the Jerusalem status neutrally.

### State of Palestine — geometry 275
The generated catalog currently promotes Gaza as the `capital` node. UNData lists East Jerusalem as the capital city of the State of Palestine, while Palestinian official sources state East Jerusalem as the claimed capital and major Palestinian Authority institutions operate from Ramallah. Gaza must not be presented as the uncontested national capital. The Country Layer must use neutral, role-aware status semantics.

## Confirmed non-review example

### Malaysia — geometry 458
Kuala Lumpur remains Malaysia's national capital. Putrajaya is the Federal Government Administrative Centre and seat of much of the federal administration. The current `Kuala Lumpur` capital label is therefore not itself false, although future richer city-role semantics may expose Putrajaya separately.

## Transition watch — not a current correction

### Indonesia — geometry 360
The catalog currently promotes Jakarta. Current Nusantara Capital Authority and Indonesian government material targets Nusantara to function as the political capital in 2028 while government functions continue transitioning. Do not silently relabel the 2026 catalog to Nusantara before the effective transition is authoritative for the runtime's current-reality contract.

## Rule
`PASS` means more than schema validity. A country is `REVIEW` when the pinned source's capital flag is stale, semantically incomplete, geopolitically disputed, or contradicted by current authoritative evidence.
