/** Reusable metric presentation geometry. Contains no city identity, gameplay or collision state. */
export type Point3 = readonly [number, number, number]
export type GeometryBuffers = { positions: number[]; normals: number[]; uvs: number[]; indices: number[] }
export type ArchitectureSpec = { width: number; depth: number; height: number; roof: 'hip' | 'mansard'; bevel: number }
export type ArchitectureGeometry = { walls: GeometryBuffers; glazing: GeometryBuffers; reveals: GeometryBuffers; roof: GeometryBuffers; windowCount: number; eaves: number }
const empty = (): GeometryBuffers => ({ positions: [], normals: [], uvs: [], indices: [] })
const cross = (a: Point3, b: Point3): Point3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const sub = (a: Point3, b: Point3): Point3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a: Point3, b: Point3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const polygon = (out: GeometryBuffers, points: Point3[], outward: Point3, uv: number[][]): void => {
  if (points.length < 3 || points.length > 4) throw new Error('Invalid architectural polygon')
  let n = cross(sub(points[2]!, points[0]!), sub(points[1]!, points[0]!))
  if (dot(n, outward) < 0) { points = [...points].reverse(); uv = [...uv].reverse(); n = [-n[0], -n[1], -n[2]] }
  const length = Math.hypot(...n)
  if (length < 1e-8) throw new Error('Degenerate architectural polygon')
  const base = out.positions.length / 3
  for (let i = 0; i < points.length; i++) { out.positions.push(...points[i]!); out.normals.push(...n.map(v => v / length)); out.uvs.push(...uv[i]!) }
  out.indices.push(base, base + 1, base + 2)
  if (points.length === 4) out.indices.push(base, base + 2, base + 3)
}
export const compileArchitecture = (spec: ArchitectureSpec): ArchitectureGeometry => {
  const { width, depth, height, bevel, roof } = spec
  if (![width, depth, height, bevel].every(Number.isFinite) || width < 4 || depth < 4 || height < 5 || width > 60 || depth > 60 || height > 60 || bevel < .04 || bevel > .3 || !['hip', 'mansard'].includes(roof)) throw new Error('Invalid bounded architecture specification')
  const result: ArchitectureGeometry = { walls: empty(), glazing: empty(), reveals: empty(), roof: empty(), windowCount: 0, eaves: 0 }
  const hw = width / 2, hd = depth / 2
  // Preserve the uppermost existing front windows and the original total envelope.
  const frontRows = Math.max(2, Math.floor(height / 3.2))
  const eaves = Math.min(height - .2, Math.max(height - 1.6, 2.1 + (frontRows - 1) * 3 + 1.05))
  result.eaves = eaves
  const faces = [
    { origin: [0, -hd], tangent: [1, 0], normal: [0, -1], span: width - 2 * bevel, opening: false },
    { origin: [hw, 0], tangent: [0, 1], normal: [1, 0], span: depth - 2 * bevel, opening: true },
    { origin: [0, hd], tangent: [-1, 0], normal: [0, 1], span: width - 2 * bevel, opening: true },
    { origin: [-hw, 0], tangent: [0, -1], normal: [-1, 0], span: depth - 2 * bevel, opening: true },
  ]
  for (const face of faces) {
    const point = (s: number, y: number, inset = 0): Point3 => [face.origin[0]! + face.tangent[0]! * s - face.normal[0]! * inset, y, face.origin[1]! + face.tangent[1]! * s - face.normal[1]! * inset]
    const normal: Point3 = [face.normal[0]!, 0, face.normal[1]!]
    const panel = (out: GeometryBuffers, a: number, b: number, lo: number, hi: number, inset = 0): void => polygon(out, [point(a, lo, inset), point(b, lo, inset), point(b, hi, inset), point(a, hi, inset)], normal, [[a/2,lo/2],[b/2,lo/2],[b/2,hi/2],[a/2,hi/2]])
    const openings: Array<{ a: number; b: number; lo: number; hi: number }> = []
    if (face.opening) {
      const cols = Math.max(1, Math.floor((face.span - 1) / 3.1)), spacing = face.span / cols
      for (let y = 2.1; y + .82 < eaves - .3; y += 3) for (let i = 0; i < cols; i++) {
        const center = -face.span / 2 + (i + .5) * spacing
        openings.push({ a: center - .72, b: center + .72, lo: y - .77, hi: y + .77 })
      }
    }
    const xs = [...new Set([-face.span/2, face.span/2, ...openings.flatMap(o => [o.a, o.b])])].sort((a,b)=>a-b)
    const ys = [...new Set([0, eaves, ...openings.flatMap(o => [o.lo, o.hi])])].sort((a,b)=>a-b)
    for (let xi = 0; xi < xs.length - 1; xi++) for (let yi = 0; yi < ys.length - 1; yi++) {
      const a=xs[xi]!, b=xs[xi+1]!, lo=ys[yi]!, hi=ys[yi+1]!
      if (openings.some(o => (a+b)/2>o.a && (a+b)/2<o.b && (lo+hi)/2>o.lo && (lo+hi)/2<o.hi)) continue
      panel(result.walls, a, b, lo, hi)
    }
    for (const {a,b,lo,hi} of openings) {
      // Actual wall opening and 16-cm reveal: not a painted rectangle on a box.
      const inset = .16, lip = .075
      panel(result.glazing, a+lip, b-lip, lo+lip, hi-lip, inset)
      panel(result.reveals, a, b, lo, lo+lip, inset)
      panel(result.reveals, a, b, hi-lip, hi, inset)
      panel(result.reveals, a, a+lip, lo+lip, hi-lip, inset)
      panel(result.reveals, b-lip, b, lo+lip, hi-lip, inset)
      panel(result.reveals, (a+b)/2-.025, (a+b)/2+.025, lo, hi, inset-.015)
      const quad = (p: Point3[], n: Point3): void => polygon(result.reveals, p, n, [[0,0],[1,0],[1,1],[0,1]])
      quad([point(a,lo),point(a,lo,inset),point(a,hi,inset),point(a,hi)], [face.tangent[0]!,0,face.tangent[1]!])
      quad([point(b,lo),point(b,hi),point(b,hi,inset),point(b,lo,inset)], [-face.tangent[0]!,0,-face.tangent[1]!])
      quad([point(a,lo),point(b,lo),point(b,lo,inset),point(a,lo,inset)], [0,1,0])
      quad([point(a,hi),point(a,hi,inset),point(b,hi,inset),point(b,hi)], [0,-1,0])
      result.windowCount++
    }
  }
  // Rounded architectural edges, subdivided only at the silhouette (not whole walls).
  for (const [cx, cz, start] of [[hw-bevel,-hd+bevel,-Math.PI/2],[hw-bevel,hd-bevel,0],[-hw+bevel,hd-bevel,Math.PI/2],[-hw+bevel,-hd+bevel,Math.PI]] as const) {
    for (let i=0;i<4;i++) {
      const a=start+i*Math.PI/8, b=start+(i+1)*Math.PI/8
      const p=(angle:number,y:number):Point3=>[cx+bevel*Math.cos(angle),y,cz+bevel*Math.sin(angle)]
      polygon(result.walls,[p(a,0),p(b,0),p(b,eaves),p(a,eaves)],[Math.cos((a+b)/2),0,Math.sin((a+b)/2)],[[0,0],[bevel*Math.PI/16,0],[bevel*Math.PI/16,eaves/2],[0,eaves/2]])
    }
  }
  const e: Point3[] = [[-hw+bevel,eaves,-hd],[hw-bevel,eaves,-hd],[hw,eaves,-hd+bevel],[hw,eaves,hd-bevel],[hw-bevel,eaves,hd],[-hw+bevel,eaves,hd],[-hw,eaves,hd-bevel],[-hw,eaves,-hd+bevel]]
  const roofPoly=(points:Point3[]):void=>polygon(result.roof,points,[0,1,0],points.map(p=>[p[0]/2,p[2]/2]))
  const top = height + .3
  if (roof==='mansard') {
    const inner=e.map((p):Point3=>[p[0]*.78,top,p[2]*.78])
    for(let i=0;i<8;i++)roofPoly([e[i]!,e[(i+1)%8]!,inner[(i+1)%8]!,inner[i]!])
    for(let i=0;i<8;i++)roofPoly([inner[i]!,inner[(i+1)%8]!,[0,top,0]])
  } else {
    const ridge=Math.max(.4,(width-depth)*.5), l:Point3=[-ridge,top,0],r:Point3=[ridge,top,0]
    roofPoly([e[0]!,e[1]!,r,l]); roofPoly([e[4]!,e[5]!,l,r])
    for(const i of [1,2,3])roofPoly([e[i]!,e[i+1]!,r])
    for(const i of [5,6,7])roofPoly([e[i]!,e[(i+1)%8]!,l])
  }
  return result
}
