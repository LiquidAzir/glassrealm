import * as THREE from 'three';

// Renderer, scene, camera, lights, fog. Black clear color is transparent on the
// additive waveguide; fog fades distant geometry to black so the world melts into
// the real world rather than hard-clipping at the far plane.
export function createEngine(canvas) {
  const requestedDisplay=new URLSearchParams(location.search).get('display');
  const screenDisplay=requestedDisplay==='screen'||(requestedDisplay!=='glasses'&&window.matchMedia&&matchMedia('(pointer: fine), (pointer: coarse)').matches);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,   // PERF: disabled — saves ~30% GPU fill on mobile/glasses (low-poly style hides jaggies)
    alpha: false,
    powerPreference: 'high-performance',
  });
  // The glasses are 600x600 @ 1x; cap the ratio so we never render a 1200px+
  // buffer (also keeps software-GL preview captures responsive).
  renderer.setPixelRatio(1);
  renderer.setSize(600, 600, false);
  renderer.setClearColor(0x000000, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true; // opaque architectural cutaways; no extra rendering pass

  const scene = new THREE.Scene();
  const FOG = 0x000000;
  scene.fog = new THREE.Fog(FOG, 26, 110);

  // Fog is fully opaque at 110; reject scenery beyond it before submission.
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 120);
  camera.position.set(0, 12, 14);

  // Hemisphere for soft sky/ground ambient + a warm directional sun for facets.
  // Kept modest so vivid vertex colors don't blow out to white.
  const hemi = new THREE.HemisphereLight(0xbfe3ff, 0x16241c, 0.62);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff0d0, 0.85);
  sun.position.set(60, 90, 30);
  scene.add(sun);

  // Gentle fill so faces turned away from the sun stay readable on the display.
  const fill = new THREE.DirectionalLight(0x88b8ff, 0.22);
  fill.position.set(-50, 40, -30);
  scene.add(fill);

  const clock = new THREE.Clock();

  return { renderer, scene, camera, sun, hemi, fill, clock, THREE, screenDisplay };
}
