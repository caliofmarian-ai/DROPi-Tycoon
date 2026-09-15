import json
import math
import struct
import sys
from pathlib import Path

KEY_BONES = [
    'Root', 'pelvis', 'spine_01', 'spine_02', 'spine_03', 'neck_01', 'head',
    'clavicle_l', 'upperarm_l', 'lowerarm_l', 'hand_l',
    'clavicle_r', 'upperarm_r', 'lowerarm_r', 'hand_r',
    'thigh_l', 'calf_l', 'foot_l', 'ball_l',
    'thigh_r', 'calf_r', 'foot_r', 'ball_r',
]


def parse_glb(path: Path):
    data = path.read_bytes()
    if data[:4] != b'glTF' or struct.unpack_from('<I', data, 4)[0] != 2:
        raise RuntimeError(f'Not glTF 2 GLB: {path}')
    if struct.unpack_from('<I', data, 8)[0] != len(data):
        raise RuntimeError(f'GLB length mismatch: {path}')
    offset = 12
    document = None
    while offset < len(data):
        length, chunk_type = struct.unpack_from('<II', data, offset)
        offset += 8
        chunk = data[offset:offset + length]
        offset += length
        if chunk_type == 0x4E4F534A:
            document = json.loads(chunk.rstrip(b'\x00 ').decode('utf-8'))
    if document is None:
        raise RuntimeError(f'Missing GLB JSON: {path}')
    return document


def node_maps(document):
    nodes = document.get('nodes', [])
    by_name = {node.get('name'): node for node in nodes if node.get('name')}
    joints = set()
    for skin in document.get('skins', []):
        for index in skin.get('joints', []):
            name = nodes[index].get('name')
            if name:
                joints.add(name)
    return by_name, joints


def normalized_quaternion(node):
    value = node.get('rotation', [0.0, 0.0, 0.0, 1.0])
    if len(value) != 4:
        raise RuntimeError(f'Invalid quaternion on {node.get("name")}')
    length = math.sqrt(sum(float(component) ** 2 for component in value))
    if length < 1e-12:
        raise RuntimeError(f'Zero quaternion on {node.get("name")}')
    return tuple(float(component) / length for component in value)


def quaternion_distance_degrees(a, b):
    dot = abs(sum(x * y for x, y in zip(a, b)))
    dot = min(1.0, max(-1.0, dot))
    return math.degrees(2.0 * math.acos(dot))


def vector(node, field, default):
    value = node.get(field, default)
    return tuple(float(component) for component in value)


def translation_direction_error_degrees(a, b):
    la = math.sqrt(sum(v * v for v in a))
    lb = math.sqrt(sum(v * v for v in b))
    if la < 1e-8 or lb < 1e-8:
        return 0.0
    dot = sum(x * y for x, y in zip(a, b)) / (la * lb)
    dot = min(1.0, max(-1.0, dot))
    return math.degrees(math.acos(dot))


def main():
    if len(sys.argv) != 4:
        raise SystemExit('usage: assessHumanAnimationCompatibility.py TARGET.glb SOURCE.glb REPORT.json')
    target_path, source_path, report_path = map(Path, sys.argv[1:])
    target = parse_glb(target_path)
    source = parse_glb(source_path)
    target_nodes, target_joints = node_maps(target)
    source_nodes, source_joints = node_maps(source)

    shared = sorted(target_joints & source_joints)
    missing_target = sorted(source_joints - target_joints)
    key_missing = [bone for bone in KEY_BONES if bone not in target_joints or bone not in source_joints]

    rotations = []
    directions = []
    per_bone = []
    for name in KEY_BONES:
        if name not in target_nodes or name not in source_nodes:
            continue
        rotation_error = quaternion_distance_degrees(
            normalized_quaternion(target_nodes[name]),
            normalized_quaternion(source_nodes[name]),
        )
        direction_error = translation_direction_error_degrees(
            vector(target_nodes[name], 'translation', [0, 0, 0]),
            vector(source_nodes[name], 'translation', [0, 0, 0]),
        )
        rotations.append(rotation_error)
        directions.append(direction_error)
        per_bone.append({
            'bone': name,
            'localRestRotationErrorDeg': round(rotation_error, 4),
            'localTranslationDirectionErrorDeg': round(direction_error, 4),
        })

    max_rotation = max(rotations) if rotations else 180.0
    mean_rotation = sum(rotations) / len(rotations) if rotations else 180.0
    max_direction = max(directions) if directions else 180.0
    mean_direction = sum(directions) / len(directions) if directions else 180.0
    joint_overlap = len(shared) / max(1, len(source_joints))

    # This classification does not authorize runtime animation transfer. It only
    # decides whether direct same-name clip reuse is worth a rendered proof or
    # whether a true retargeting stage is mandatory before integration.
    if not key_missing and joint_overlap >= 0.85 and max_rotation <= 2.0 and max_direction <= 8.0:
        classification = 'DIRECT_NATIVE_CLIP_TRANSFER_RENDER_PROOF_ALLOWED'
    else:
        classification = 'RETARGET_REQUIRED_BEFORE_RUNTIME_INTEGRATION'

    report = {
        'status': 'EVIDENCE_ONLY_NOT_RUNTIME_ACCEPTANCE',
        'classification': classification,
        'target': target_path.name,
        'source': source_path.name,
        'targetJointCount': len(target_joints),
        'sourceJointCount': len(source_joints),
        'sharedJointCount': len(shared),
        'sourceJointOverlap': round(joint_overlap, 4),
        'missingSourceJointsInTarget': missing_target,
        'missingKeyBones': key_missing,
        'keyRestRotationMeanDeg': round(mean_rotation, 4),
        'keyRestRotationMaxDeg': round(max_rotation, 4),
        'keyTranslationDirectionMeanDeg': round(mean_direction, 4),
        'keyTranslationDirectionMaxDeg': round(max_direction, 4),
        'perKeyBone': per_bone,
        'truthBoundary': 'A compatible name/rest-frame result only permits the next rendered transfer proof. It does not prove deformation, foot contact, parcel pose, Android performance, or final animation quality.',
    }
    report_path.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
