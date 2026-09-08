#!/usr/bin/env python3
import json
import pathlib
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / '04_World/Country_Catalog/COUNTRY_SEMANTICS_REGISTRY.json'


def norm(value):
    value = unicodedata.normalize('NFKD', str(value or ''))
    return ''.join(ch for ch in value.lower() if not unicodedata.combining(ch) and ch.isalnum())


def load_country_semantics():
    data = json.loads(REGISTRY_PATH.read_text())
    entries = data.get('entries', {})
    if not isinstance(entries, dict):
        raise ValueError('COUNTRY_SEMANTICS_REGISTRY entries must be an object')
    return data, entries


def source_place_for_spec(places, spec):
    aliases = {norm(alias) for alias in spec.get('sourceAliases', []) if str(alias).strip()}
    if not aliases:
        raise ValueError(f'semantic place spec has no sourceAliases: {spec}')
    matches = [place for place in places if norm(place.get('name')) in aliases]
    if not matches:
        raise ValueError(f"semantic place not found in pinned source; aliases={spec.get('sourceAliases')}")
    matches.sort(key=lambda place: (
        0 if place.get('isCapital') else 1,
        int(place.get('scalerank') or 99),
        -int(place.get('population') or 0),
        str(place.get('name') or ''),
    ))
    return matches[0]


def runtime_semantics(entries):
    allowed = (
        'entityKind', 'kindLabel', 'displayName', 'capitalMode',
        'capitalSummary', 'statusNote', 'issue',
    )
    result = {}
    for country_id, entry in entries.items():
        result[country_id] = {key: entry[key] for key in allowed if key in entry}
    return result


def semantic_functions(spec):
    return [str(value) for value in spec.get('functions', []) if str(value).strip()]
