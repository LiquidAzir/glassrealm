# Original Glass Realm 3D kit

The six village buildings, six environment props, eight character parts, three interior furnishings, and five village stations are original Blender-authored geometry. They use a shared timber, warm plaster, worn stone, slate, copper and russet tile palette. The artwork is inspired by the readable scale and silhouettes of classic fantasy role-playing games; no third-party game models, textures or trademarks are included.

`realm-kit.json` contains one indexed, merged geometry per asset. Runtime integration uses one vertex-colored Lambert material and one draw call per building, or instancing for repeated vegetation and props. There are no texture requests, generated shadows, postprocessing passes, or animation updates associated with this kit.

## Reproduce

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --python scripts/build-realm-art.py
```

The script writes the compact runtime JSON, an editable `source/realm-kit.blend`, and real Blender renders plus metrics under the workspace's `.visual-review/realm-round2/assets/`. All generation uses a fixed random seed. Each asset is a named joined mesh in the Blender source; environment, furniture and station assets have separate contact sheets, and the character meshes have an assembly study. Export happens before the display layout is applied. The saved scene opens with the station study visible; original source meshes are retained, hidden for viewport/render clarity, and can be unhidden in Blender.

## Runtime contract

- `version: 1`; `models[key]` supplies flat `position`, `normal`, `color`, and `index` arrays.
- Coordinates are already converted to Three.js: +Y up, +Z front, ground at Y=0. Triangle order is counterclockwise and normals are outward.
- Colors are **linear RGB**, suitable for direct BufferGeometry color attributes. Do not convert them from sRGB again.
- Building entry doors face +Z. The centered step ends at Z=2.85, leaving the existing Z=3.8 interaction approach clear.
- Roof eaves fit X/Z approximately ±2.6. Existing circular building collision radii and entry locations remain authoritative.
- Every building fits the 5.5–8.5 height budget. The oak and pine both remain below 400 triangles.
- Input bindings, character animation, world placement, save identifiers, and procedural world RNG behavior remain owned by the game runtime.

| Model | Triangles | Height | Distinguishing detail |
| --- | ---: | ---: | --- |
| home | 2,522 | 6.09 | Blue slate cottage, attic window, chimney stonework |
| store | 2,320 | 6.03 | Copper hip roof, striped canopy, grain trade sign |
| bank | 2,838 | 7.14 | Heavy masonry, barred windows, coin sign, bronze finial |
| workshop | 2,138 | 6.00 | Broad russet roof, loft hoist, hammer trade sign |
| tavern | 2,986 | 7.44 | Projecting timber upper story, lit windows, tankard sign |
| forge | 1,874 | 6.61 | Tapered stone flue, inset side hearth, soot-colored roof |
| oak | 256 | 5.91 | Irregular broad canopy, branching trunk, buttress roots |
| pine | 160 | 5.90 | Four layered, serrated bough tiers |
| rock | 80 | 1.45 | Irregular facets with a flat ground contact |
| barrel | 204 | 1.21 | Bulging staves, lid seams, iron hoops |
| crate | 372 | 1.00 | Planked sides, diagonal braces, lid boards |
| lantern | 148 | 2.24 | Crooked arm, framed warm glass, capped fixture |
| hero_torso | 144 | 0.82 | Tapered tunic, shoulders, collar and waist seam |
| hero_cuirass | 109 | 0.92 | Shaped breastplate, center ridge and rolled waist |
| hero_head | 175 | 0.58 | Modeled nose, chin, ears, hair and individual eyes |
| hero_boot | 160 | 0.70 | Cuffed shaft, shaped toe and separate sole |
| hero_shoulder | 88 | 0.26 | Faceted armor cap and rolled lower edge |
| counter | 674 | 1.30 | Paneled front, carved diamonds, ledger and coin tray |
| stocked_shelf | 884 | 3.20 | Open shelving with books, pottery, sacks, linens and boxes |
| table | 276 | 1.10 | Splayed trestles, cross stretcher and framed plank top |
| well | 820 | 2.79 | Open stone ring, water, timber canopy, windlass and crank |
| anvil | 324 | 1.11 | Forged horn, hardened face, narrowed waist and secured stump |
| furnace | 791 | 2.70 | Open arched firebox, inset coals and tapered masonry flue |
| cauldron | 497 | 1.49 | Open pot, broth, cast handles and tripod over embers |
| market_stall | 576 | 2.49 | Striped canvas, scalloped valance, counter and grouped produce |
| hero_upper_arm | 88 | 0.31 | Rounded sleeve and cuff, shoulder attachment pivot |
| hero_forearm | 121 | 0.31 | Tapered bracer, raised plate and straps, elbow pivot |
| hero_shield | 56 | 0.82 | Beveled heater shape, inset face and raised boss |

Character origins differ from grounded environment props: torso, cuirass, head, shoulder and shield are centered for attachment to existing runtime pivots; the boot starts at its hip pivot, Y=0, and extends to Y=-0.70. Upper arm and forearm start at Y=0 and extend to Y=-0.31, allowing the existing runtime shoulder and elbow transforms to articulate them. The shield has +Z front, X±0.30, Y±0.41 and Z=-0.035 to 0.085. Attach it to the animated left arm rather than the torso. All parts except the head use strictly grayscale colors so runtime cloth and armor materials can tint them. The head retains baked skin, hair and eye colors. Its bottom is Y=-0.265; attach it close enough to the existing collar/neck to avoid a gap. Complete bounds are in `realm-kit.json` metadata. Hands, belt and sword in the Blender character study are assembly context, not extra exported models or animation code.

Interior furniture is grounded at Y=0 with its front facing +Z. The counter is 3.0 wide by 1.5 deep, the shelf 3.0 wide by 0.5 deep, and the table 2.6 wide by 1.5 deep. These are one merged geometry each and remain below 1,000 triangles per item. Counter width and shelf rotation can be adapted by the runtime without altering collision or interaction logic.

Village stations use ground Y=0 and share the game's existing station positions and interaction identifiers. They are one merged mesh each and have no dynamic lights or new animation work. The well and cauldron have actual open interiors, and the furnace has an open front firebox. The market stall fits X±1.5 and Z±0.9. Runtime placement must continue to enforce character, station and building clearance.

Runtime JSON size: 2,859,819 bytes uncompressed (about 2.73 MiB), 21,681 triangles across all 28 models. Geometry checks cover finite arrays, index bounds, linear color ranges, unit normals, triangle winding, nondegenerate triangles, ground origins, station and furniture bounds, entry clearance, character grayscale tinting, and triangle budgets. SHA-256 comparisons verify that adding the stations and articulated character parts preserved all 20 previous model geometries exactly. Blender contact sheets verify authored forms; the independent game review must verify their appearance and performance in the actual renderer. Blender's contact-sheet lighting includes soft shadows for asset inspection; runtime lighting remains the responsibility of the game renderer. The roof palette was narrowed after independent review to remove distracting checkerboard contrast while preserving shingle courses. The station study caught and corrected roof-post penetration and an anvil horn proportion issue before handoff.
