#!/usr/bin/env python3
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / '04_World/Country_Catalog/GEOMETRY_ID_REGISTRY.json'


def load_geometry_id_registry():
    data = json.loads(REGISTRY_PATH.read_text())
    entries = data.get('entries', {})
    by_name = {}
    for rendered_name, entry in entries.items():
        project_id = str(entry.get('projectGeometryId') or '').strip()
        if not project_id:
            raise ValueError(f'GEOMETRY_ID_REGISTRY: missing projectGeometryId for {rendered_name}')
        if project_id.isdigit():
            raise ValueError(f'GEOMETRY_ID_REGISTRY: project-owned ID must not masquerade as ISO numeric: {rendered_name} -> {project_id}')
        by_name[str(rendered_name).strip()] = project_id
    return data, by_name


def stable_geometry_id(raw_id, rendered_name, by_name):
    if raw_id is not None:
        text = str(raw_id).strip()
        if text and text.casefold() not in {'none', 'null'}:
            return text
    name = str(rendered_name or '').strip()
    project_id = by_name.get(name)
    if project_id:
        return project_id
    raise ValueError(f'Rendered geometry {name!r} has no usable source ID and no project-owned registry entry')


def topology_names(topology, by_name):
    result = {}
    geometries = topology['objects']['countries']['geometries']
    for geometry in geometries:
        name = str((geometry.get('properties') or {}).get('name') or '').strip()
        geometry_id = stable_geometry_id(geometry.get('id'), name, by_name)
        if geometry_id in result:
            raise ValueError(f'Duplicate stable geometry ID {geometry_id}: {result[geometry_id]!r} and {name!r}')
        result[geometry_id] = name
    return result
