// Small shared shader tweaks injected via Material.onBeforeCompile.

// Fresnel RIM LIGHT: a soft glow along the silhouette edges (faces turned away from the camera).
// On the additive waveguide this makes characters read crisply against the see-through background
// instead of dissolving into it. Applied only to LIT (Lambert) materials — they carry the `normal`
// and `vViewPosition` the rim needs. Kept subtle; tune `strength` to taste.
export function rimLight(material, strength = 0.5, tint = [0.04, 0.07, 0.10], power = 3.0) {
  const prev = material.onBeforeCompile;
  material.onBeforeCompile = (sh) => {
    if (prev) prev(sh);
    sh.fragmentShader = sh.fragmentShader.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
{
  float rimF = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), ${power.toFixed(1)});
  gl_FragColor.rgb += gl_FragColor.rgb * rimF * ${strength.toFixed(2)} + vec3(${tint[0]}, ${tint[1]}, ${tint[2]}) * rimF;
}`
    );
  };
  return material;
}
