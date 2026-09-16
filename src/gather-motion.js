// Presentation timing only: inventory, XP and channel duration stay in main.js.
export const GATHER_MOTIONS = {
  chop: { tool: 'hatchet', duration: 1.05, impact: .58 },
  mine: { tool: 'pickaxe', duration: 1.15, impact: .58 },
  fish: { tool: 'rod', duration: 2.8, impact: .3 },
  harpoon: { tool: 'harpoon', duration: 1.65, impact: .58 },
  cook: { tool: 'ladle', duration: 1.65, impact: .5 },
  smith: { tool: 'hammer', duration: 1.15, impact: .58 },
  forage: { tool: null, duration: 1.2, impact: .6 },
};
const ease = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
// [time, gripX, gripY, gripZ, toolPitch, toolYaw, torsoTwist, lean]
const CHOP = [[0,.25,1.34,.3,.25,0,0,0],[.38,.32,1.8,.34,.08,.24,-.16,-.03],[.58,.14,1.35,.38,1.36,-.08,.14,.07],[.7,.1,1.29,.37,1.54,-.12,.16,.09],[1,.25,1.34,.3,.25,0,0,0]];
const MINE = [[0,.08,1.4,.3,.45,0,0,.02],[.38,.08,1.76,.33,.05,0,-.16,-.02],[.58,.1,1.23,.35,2.04,0,.26,.11],[.7,.1,1.2,.35,2.15,0,.3,.12],[1,.08,1.4,.3,.45,0,0,.02]];
export function gatherPose(kind, phase, out = {}) {
  const p = Math.max(0, Math.min(1, phase));
  out.phase = p < .38 ? 'wind-up' : p < .58 ? 'strike' : p < .7 ? 'contact' : 'recover';
  out.x=.06; out.y=1.3; out.z=.28; out.pitch=.5; out.yaw=0; out.twist=0; out.lean=0; out.crouch=0;
  if (kind === 'chop' || kind === 'mine' || kind === 'smith' || kind === 'harpoon') {
    const keys = kind === 'chop' ? CHOP : MINE;
    let i=0; while(i<keys.length-2 && p>keys[i+1][0])i++;
    const a=keys[i],b=keys[i+1],t=ease((p-a[0])/(b[0]-a[0]));
    ['x','y','z','pitch','yaw','twist','lean'].forEach((k,n)=>out[k]=a[n+1]+(b[n+1]-a[n+1])*t);
    out.crouch = -out.lean * .7;
  } else if (kind === 'fish') {
    out.y=1.46;out.z=.24;
    if(p<.18){out.pitch=.7-1.05*ease(p/.18);out.phase='lift';}
    else if(p<.3){out.pitch=-.35+1.3*ease((p-.18)/.12);out.phase='cast';}
    else if(p<.78){out.pitch=.95+Math.sin((p-.3)/.48*Math.PI*2)*.025;out.phase='wait';}
    else {out.pitch=.95-.25*ease((p-.78)/.22);out.phase='retrieve';}
  } else if (kind === 'cook') {
    out.x=.07+Math.cos(p*Math.PI*2)*.06;out.z=.32+Math.sin(p*Math.PI*2)*.06;
    out.y=1.28;out.pitch=2.15;out.lean=.07;out.phase='stir';
  } else {
    const reach=Math.sin(p*Math.PI)**2;
    out.x=.12;out.y=1.18-.1*reach;out.z=.24+.1*reach;out.pitch=0;out.lean=.2*reach;out.crouch=-.16*reach;
    out.phase=p<.6?'reach':'collect';
  }
  return out;
}
