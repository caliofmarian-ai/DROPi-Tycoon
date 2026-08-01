/**
 * Pure delivery-intent selection helper.
 * Determines which delivery marker (if any) a tap is aimed at.
 * Returns the marker label, or '' when the tap lands on ordinary ground
 * or the PickupZone.  Testable without requiring Phaser or a scene.
 */
export function selectDeliveryIntentFromTap(
  pointerX: number,
  pointerY: number,
  candidates: Array<{ x: number; y: number; label: string }>,
  markerTapRadius: number,
): string {
  const hit = candidates
    .filter((pt) => pt.label !== 'PickupZone')
    .find((pt) => Math.hypot(pointerX - pt.x, pointerY - pt.y) <= markerTapRadius)
  return hit ? hit.label : ''
}
