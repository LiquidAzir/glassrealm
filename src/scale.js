// Uniform world-growth factor. World POSITIONS and land RADII scale by this; object
// and character sizes, building footprints, bridge width and interaction ranges do NOT —
// so each region simply gets bigger to move through and explore. Bump this one number to
// grow every region at once (saves auto-migrate the player position; see save.js/main.js).
export const WORLD_SCALE = 1.6;
