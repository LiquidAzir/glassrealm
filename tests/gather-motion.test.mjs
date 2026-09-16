import test from 'node:test';
import assert from 'node:assert/strict';
import {GATHER_MOTIONS,gatherPose} from '../src/gather-motion.js';

test('repeating gathering cycles return to the same pose without a restart snap',()=>{
  for(const kind of Object.keys(GATHER_MOTIONS)){
    const start=gatherPose(kind,0),end=gatherPose(kind,1);
    for(const k of ['x','y','z','pitch','yaw','twist','lean','crouch'])assert(Math.abs(start[k]-end[k])<1e-8,`${kind} ${k}`);
    const motion=GATHER_MOTIONS[kind];assert(motion.duration>.8&&motion.impact>0&&motion.impact<1);
  }
});
test('every work pose keeps the hand grips within the actual two-bone arm reach',()=>{
  for(const kind of Object.keys(GATHER_MOTIONS))for(let frame=0;frame<=240;frame++){
    const p=gatherPose(kind,frame/240);
    assert(Object.values(p).every(v=>typeof v!=='number'||Number.isFinite(v)));
    const right=Math.hypot(p.x-.42,p.y-1.5,p.z);
    assert(right<.62,`${kind} right grip beyond reach at ${frame}: ${right}`);
    if(GATHER_MOTIONS[kind].tool&&kind!=='chop'){
      const left=Math.hypot(p.x+.42,p.y-.192*Math.cos(p.pitch)-1.5,p.z-.192*Math.sin(p.pitch));
      assert(left<.62,`${kind} left grip beyond reach at ${frame}: ${left}`);
    }
  }
});
test('woodcutting and mining have different strike heights and the correct tools',()=>{
  assert.equal(GATHER_MOTIONS.chop.tool,'hatchet');assert.equal(GATHER_MOTIONS.mine.tool,'pickaxe');assert.equal(GATHER_MOTIONS.forage.tool,null);
  assert(gatherPose('mine',.58).pitch>gatherPose('chop',.58).pitch+.5);
  assert(gatherPose('mine',.58).y<gatherPose('chop',.58).y);
  assert.equal(GATHER_MOTIONS.harpoon.tool,'harpoon');assert.equal(GATHER_MOTIONS.fish.tool,'rod');
});
