"""Original Glass Realm art kit. Run with Blender --background --python this_file.

Authored in logical Three.js coordinates (+Y up, +Z front), transformed into
Blender for modeling, then exported with linear vertex colors. No textures,
external model dependencies, animation rigs, or runtime Blender requirement.
"""
import bpy, math, json, random, os
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets'
REVIEW = ROOT.parent / '.visual-review' / 'realm' / 'assets'
OUT.mkdir(exist_ok=True)
(OUT / 'source').mkdir(exist_ok=True)
REVIEW.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.context.preferences.filepaths.save_version=0
RNG = random.Random(80241)
MATS = {}
PARTS = []
ASSETS = {}

def linear(c):
    return c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4

def material(name, hexcolor):
    c = tuple(linear(int(hexcolor[i:i+2], 16) / 255) for i in (0, 2, 4))
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*c, 1)
    m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = (*c, 1)
    bs.inputs['Roughness'].default_value = .86
    MATS[name] = m
    return name

for name, color in {
    'plaster':'D8C398', 'plaster_light':'EBD8AE', 'plaster_warm':'C3A879',
    'timber':'513B2D', 'timber_light':'79563A', 'endgrain':'9C7048',
    'stone':'8D9590', 'stone_light':'B3B7A6', 'stone_dark':'626F70',
    'mortar':'555F5E', 'slate':'526F80', 'slate_light':'59788A',
    'slate_dark':'4B6676', 'terracotta':'A35236', 'terracotta_light':'B25B3C',
    'terracotta_dark':'984B31', 'copper':'4D8073', 'copper_light':'548B7D',
    'copper_dark':'47766A', 'bronze':'C49B4D', 'bronze_light':'EBC775',
    'iron':'3D4950', 'window':'426475', 'window_light':'B9D2CA',
    'window_glow':'E9B75A', 'recess':'263638', 'fabric':'386E74',
    'fabric_light':'94B9A2', 'red_fabric':'9B463C', 'leaf':'547F42',
    'leaf_light':'7A9F51', 'leaf_dark':'345C3C', 'leaf_gold':'A0AD53',
    'pine':'416F52', 'pine_light':'608B5B', 'pine_dark':'2C5245',
    'bark':'67503D', 'bark_light':'937153', 'rock':'84918A',
    'rock_light':'ADB5A0', 'coal':'303A3B', 'fire':'E99942',
    'cream':'F3DFA8', 'water':'60979B', 'flower':'C48665',
}.items(): material(name, color)

def cv(p): return (p[0], -p[2], p[1])

def mesh(name, verts, faces, mat, face_mats=None):
    me = bpy.data.meshes.new(name)
    me.from_pydata([cv(v) for v in verts], [], faces)
    me.update()
    obj = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(obj)
    names = [mat] if face_mats is None else list(dict.fromkeys(face_mats))
    for n in names: me.materials.append(MATS[n])
    if face_mats:
        for f, n in zip(me.polygons, face_mats): f.material_index = names.index(n)
    PARTS.append(obj)
    return obj

def box(name, loc, size, mat):
    x, y, z = loc; a, b, c = [v / 2 for v in size]
    vs = [(x+sx*a,y+sy*b,z+sz*c) for sx,sy,sz in
          [(-1,-1,-1),(1,-1,-1),(1,-1,1),(-1,-1,1),(-1,1,-1),(1,1,-1),(1,1,1),(-1,1,1)]]
    return mesh(name, vs, [(0,1,2,3),(7,6,5,4),(4,5,1,0),(5,6,2,1),(6,7,3,2),(7,4,0,3)], mat)

def beam(name, a, b, w, mat, depth=None):
    a, b = Vector(a), Vector(b)
    up = (b-a).normalized()
    ref = Vector((0,0,1)) if abs(up.z) < .9 else Vector((1,0,0))
    right = up.cross(ref).normalized() * w/2
    front = right.normalized().cross(up).normalized() * (depth or w)/2
    vs = [tuple(p + s*right + t*front) for p in (a,b) for s,t in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    return mesh(name, vs, [(0,1,2,3),(7,6,5,4),(4,5,1,0),(5,6,2,1),(6,7,3,2),(7,4,0,3)],mat)

def cylinder(name, loc, radius, height, mat, n=8, top=None):
    x,y,z = loc; rt = radius if top is None else top
    vs = [(x + math.cos(a*2*math.pi/n)*r, yy, z + math.sin(a*2*math.pi/n)*r)
          for yy,r in [(y-height/2,radius),(y+height/2,rt)] for a in range(n)]
    faces = [tuple(reversed(range(n))), tuple(range(n,2*n))]
    faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    return mesh(name,vs,[tuple(reversed(f)) for f in faces],mat)

def ico(name, loc, scale, mat, sub=1, palette=None, irregular=.08):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub, radius=1, location=cv(loc))
    o = bpy.context.object; o.name = name
    for v in o.data.vertices:
        # Blender space x/y/z corresponds to logical x/z/y.
        f = 1 + RNG.uniform(-irregular,irregular)
        v.co.x *= scale[0]*f; v.co.y *= scale[2]*f; v.co.z *= scale[1]*f
    colors = palette or [mat]
    for c in colors: o.data.materials.append(MATS[c])
    for p in o.data.polygons:
        p.material_index = RNG.randrange(len(colors))
    PARTS.append(o)
    return o

def wedge_roof(name, w, d, eave, ridge, palette, ox=0, oz=0, courses=5):
    # Shallow stepped, staggered shingle courses: real silhouettes and self shading.
    for side in [-1,1]:
        for r in range(courses):
            t0=r/courses; t1=(r+1)/courses
            x0=side*w*(1-t0); x1=side*w*(1-t1)
            y0=eave+(ridge-eave)*t0+.10*math.sin(t0*math.pi)
            y1=eave+(ridge-eave)*t1+.10*math.sin(t1*math.pi)
            for j in range(5):
                z0=-d+j*2*d/5+.014; z1=-d+(j+1)*2*d/5-.014
                yoff=.008*((j+r)%2)
                v=[(ox+x0,y0+yoff,oz+z0),(ox+x1,y1+yoff,oz+z0),
                   (ox+x1,y1+yoff,oz+z1),(ox+x0,y0+yoff,oz+z1)]
                v += [(x,y-.075,z) for x,y,z in v]
                faces=[(0,1,2,3),(0,4,5,1),(3,2,6,7),(0,3,7,4)]
                if side<0: faces=[tuple(reversed(f)) for f in faces]
                value=(r*13+j*7+side*3)%11
                mesh(name+' shingle',v,faces,palette[1 if value<2 else 2 if value==3 else 0])
    beam(name+' ridge cap',(ox,ridge+.045,oz-d-.04),(ox,ridge+.045,oz+d+.04),.19,palette[1])
    for side in [-1,1]:
        beam(name+' eave fascia',(ox+side*w,eave-.07,oz-d),(ox+side*w,eave-.07,oz+d),.18,'timber')
    for z in [-d,d]:
        for s in [-1,1]: beam(name+' carved bargeboard',(ox+s*w,eave-.09,oz+z),(ox,ridge+.015,oz+z),.17,'timber_light')

def gable(w, d, eave, ridge, wallmat='plaster', ox=0, oz=0):
    for side in [-1,1]:
        z=oz+side*d
        f=(0,1,2) if side>0 else (2,1,0)
        mesh('plaster gable',[(ox-w,eave,z),(ox+w,eave,z),(ox,ridge,z)],[f],wallmat)
        beam('gable king post',(ox,eave,z+side*.04),(ox,ridge,z+side*.04),.17,'timber')
        for sx in [-1,1]:
            beam('gable rafter',(ox+sx*w,eave,z+side*.04),(ox,ridge,z+side*.04),.17,'timber')
            beam('gable brace',(ox+sx*.95,eave,z+side*.055),(ox,eave+1.0,z+side*.055),.12,'timber_light')

def rotate_parts(start):
    """Turn a subassembly ninety degrees about logical Y, keeping its origin."""
    for o in PARTS[start:]:
        for v in o.data.vertices:
            xx,zz=v.co.x,-v.co.y
            v.co.x=zz; v.co.y=xx

def hipped_roof(w,d,eave,ridge,palette):
    # Four roof planes with a short ridge: a merchant pavilion silhouette.
    def point(side,t,u):
        xx=w*(1-t); zz=d-(d-.70)*t; yy=eave+(ridge-eave)*t
        if side==0: return (-xx,yy,-zz+u*2*zz)
        if side==1: return (xx,yy,zz-u*2*zz)
        if side==2: return (-xx+u*2*xx,yy,zz)
        return (xx-u*2*xx,yy,-zz)
    for side in range(4):
        for r in range(5):
            for col in range(4):
                t0=r/5; t1=(r+1)/5; u0=col/4+.008; u1=(col+1)/4-.008
                v=[point(side,t0,u0),point(side,t0,u1),point(side,t1,u1),point(side,t1,u0)]
                # Keep the top outer normal pointing up for all four faces.
                n=(Vector(v[1])-Vector(v[0])).cross(Vector(v[2])-Vector(v[0]))
                if n.y<0: v.reverse()
                top=[(x,y+.035,z) for x,y,z in v]; vs=top+[(x,y-.05,z) for x,y,z in v]
                fs=[(0,1,2,3),(0,4,5,1),(1,5,6,2),(3,7,4,0)]
                value=(r*13+col*7+side*3)%11
                mesh('hip roof shingle',vs,fs,palette[1 if value<2 else 2 if value==3 else 0])
    for x in [-w,w]: beam('merchant eave',(x,eave,-d),(x,eave,d),.15,'timber')
    for z in [-d,d]: beam('merchant eave',(-w,eave,z),(w,eave,z),.15,'timber')
    for x in [-w,w]:
        for z in [-d,d]: beam('hip roof seam',(x,eave,z),(0,ridge,math.copysign(.7,z)),.105,palette[1])
    beam('merchant ridge',(0,ridge,-.74),(0,ridge,.74),.15,palette[1])

def masonry(y=.30, w=2.12, d=2.13, courses=2, wall=False):
    height=.26 if not wall else .82
    for side in [-1,1]:
        for row in range(courses):
            count=5 if not wall else 4
            for i in range(count):
                x=-w+(i+.5)*2*w/count
                box('individual foundation block',(x,y+row*height,side*d),(2*w/count-.025,height-.025,.16),['stone','stone_light','stone_dark'][(i+row)%3])
                z=-d+(i+.5)*2*d/count
                box('individual foundation block',(side*w,y+row*height,z),(.16,height-.025,2*d/count-.025),['stone','stone_light','stone_dark'][(i+2*row+1)%3])

def building_shell(w=2.02,d=2.02,h=3.35,mat='plaster'):
    box('mortar foundation',(0,.30,0),(w*2+.13,.60,d*2+.13),'mortar')
    masonry(.17,w+.07,d+.07)
    box('continuous plaster walls',(0,(h+.55)/2,0),(w*2,h-.55,d*2),mat)
    box('sill beam',(0,.68,0),(w*2+.16,.18,d*2+.16),'timber')
    box('wall plate',(0,h-.06,0),(w*2+.18,.20,d*2+.18),'timber')
    for x in [-w,w]:
        for z in [-d,d]: box('corner timber',(x,(h+.6)/2,z),(.20,h-.6,.20),'timber')
    for side in [-1,1]:
        box('side stud',(side*(w+.02),(h+.75)/2,0),(.14,h-.75,.15),'timber')
        beam('side wind brace',(side*(w+.025),.85,-d+.2),(side*(w+.025),1.7,-.25),.12,'timber')

def door(y=0,z=2.07,stone=False):
    box('deep doorway',(0,1.38+y,z+.018),(1.36,2.05,.075),'recess')
    for i in range(5): box('door plank',(-.48+i*.24,1.31+y,z+.10),(.225,1.8,.08),'timber_light' if i%2 else 'timber')
    for yy in [.77,1.85]: box('forged door strap',(0,yy+y,z+.16),(1.18,.08,.055),'iron')
    for x in [-.73,.73]: box('door frame',(x,1.40+y,z+.20),(.18,2.16,.28),'stone_light' if stone else 'timber_light')
    box('door lintel',(0,2.48+y,z+.20),(1.64,.25,.32),'stone_light' if stone else 'timber_light')
    cylinder('door handle',(.38,1.36+y,z+.235),.065,.09,'bronze',6)
    box('threshold',(0,.13+y,2.36),(1.56,.26,.66),'stone_light')
    box('door step',(0,.05+y,2.70),(1.80,.10,.30),'stone')

def window(x,y,z=2.06,w=.82,h=1.02,glow=False,shutters=True,side=None):
    start=len(PARTS)
    box('window recess',(x,y,z+.025),(w+.16,h+.14,.10),'recess')
    box('colored window glass',(x,y,z+.085),(w-.10,h-.10,.055),'window_glow' if glow else 'window')
    box('glass reflection',(x-w*.21,y+h*.15,z+.118),(w*.28,h*.50,.012),'cream' if glow else 'window_light')
    for sx in [-1,1]: box('window jamb',(x+sx*w/2,y,z+.16),(.105,h+.24,.20),'timber')
    for sy in [-1,1]: box('window lintel',(x,y+sy*h/2,z+.16),(w+.16,.10,.20),'timber_light')
    box('window mullion',(x,y,z+.165),(.07,h,.14),'timber')
    box('window transom',(x,y-.08,z+.17),(w,.075,.14),'timber')
    box('projecting window sill',(x,y-h/2-.085,z+.25),(w+.35,.12,.36),'stone_light')
    if shutters:
        for sx in [-1,1]:
            box('wood shutter',(x+sx*(w*.5+.18),y,z+.14),(.22,h-.05,.07),'timber_light')
            for dy in [-.28,.28]: box('shutter hinge',(x+sx*(w*.5+.18),y+dy,z+.19),(.23,.04,.05),'iron')
    if side is not None:
        # Rotate authored front-window geometry about origin to either side facade.
        for o in PARTS[start:]:
            for v in o.data.vertices:
                xx,zz=v.co.x,-v.co.y
                v.co.x=side*zz; v.co.y=side*xx

def chimney(x=-1.25,z=-.85,base=3.8,top=6.35):
    box('chimney core',(x,(top+base)/2,z),(.72,top-base,.68),'mortar')
    for j in range(int((top-base)/.42)):
        yy=base+.2+j*.42
        for side in [-1,1]:
            box('chimney stone',(x+side*.19,yy,z+.355),(.34,.36,.08),'stone' if j%2 else 'stone_light')
            box('chimney stone',(x+side*.19,yy,z-.355),(.34,.36,.08),'stone' if j%2 else 'stone_light')
    box('chimney crown',(x,top,z),(.94,.22,.90),'stone_dark')
    box('soot opening',(x,top+.12,z),(.53,.025,.47),'coal')

def sign(kind,x=1.55,y=3.12,z=2.33):
    beam('sign bracket',(x,y+.55,z-.26),(x,y+.55,z+.36),.09,'iron')
    beam('sign brace',(x,y+.32,z-.26),(x,y+.55,z+.22),.055,'iron')
    for sx in [-1,1]: beam('sign chain',(x+sx*.30,y+.53,z+.20),(x+sx*.30,y+.32,z+.20),.035,'iron')
    box('carved trade sign',(x,y,z+.20),(.84,.62,.12),'timber')
    for dy in [-.30,.30]: box('sign bronze border',(x,y+dy,z+.275),(.80,.035,.028),'bronze')
    # Oversized symbols remain legible on a 600-pixel display; original pictograms.
    zz=z+.278
    if kind=='store':
        for dx in [-.18,0,.18]:
            beam('grain stem',(x+dx*.7,y-.19,zz),(x+dx,y+.20,zz),.035,'cream')
            for dy in [.0,.10]:
                beam('grain ear',(x+dx,y+dy,zz),(x+dx-.10,y+dy+.06,zz),.055,'bronze_light')
    elif kind=='bank':
        for dx,dy in [(-.18,-.13),(0,.0),(.18,.13)]:
            o=cylinder('coin emblem',(x+dx,y+dy,zz),.105,.035,'bronze_light',8)
            # Cylinder's axis should face front rather than up.
            c=Vector(cv((x+dx,y+dy,zz)))
            for v in o.data.vertices:
                rel=v.co-c; v.co=c+Vector((rel.x,-rel.z,rel.y))
    elif kind=='tavern':
        box('tankard emblem',(x-.03,y-.035,zz),(.28,.30,.035),'cream')
        for dy in [-.10,.11]: box('tankard handle',(x+.20,y+dy,zz),(.18,.055,.04),'bronze_light')
        box('tankard handle',(x+.27,y,zz),(.04,.20,.04),'bronze_light')
        box('tankard foam',(x-.03,y+.15,zz),(.35,.075,.04),'cream')
    elif kind in ['forge','workshop']:
        beam('tool handle',(x-.16,y-.20,zz),(x+.13,y+.16,zz),.055,'cream')
        beam('hammer head',(x-.015,y+.23,zz),(x+.25,y+.04,zz),.15,'bronze_light')

def awning(y=2.62,z=2.05,half=1.80):
    for i in range(8):
        x0=-half+i*half/4; x1=x0+half/4-.015
        mesh('striped market canopy',[(x0,y+.28,z),(x1,y+.28,z),(x1,y-.12,z+.60),(x0,y-.12,z+.60)],[(0,3,2,1)],'fabric' if i%2 else 'fabric_light')
        box('awning valance',((x0+x1)/2,y-.18,z+.60),(x1-x0,.17,.035),'fabric' if i%2 else 'fabric_light')
    for x in [-half,half]: beam('awning wall bracket',(x,y-.3,z),(x,y-.12,z+.61),.08,'timber')

def finish(name, ground=True):
    bpy.ops.object.select_all(action='DESELECT')
    for o in PARTS: o.select_set(True)
    bpy.context.view_layer.objects.active=PARTS[0]
    if len(PARTS)>1: bpy.ops.object.join()
    obj=bpy.context.object; obj.name=name
    # Joining preserves materials. Bake any object transforms into the mesh once.
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    obj.data.validate(); obj.data.update()
    lowest=min(v.co.z for v in obj.data.vertices)
    if ground and abs(lowest)>.00001:
        for v in obj.data.vertices: v.co.z-=lowest
    ASSETS[name]=obj; PARTS.clear()
    return obj

def make_buildings():
    building_shell(h=3.3)
    gable(2.02,2.02,3.3,5.50)
    wedge_roof('blue slate cottage',2.44,2.36,3.26,5.63,['slate','slate_light','slate_dark'])
    door(); window(-1.38,1.9,w=.57,h=.88); window(1.38,1.9,w=.57,h=.88)
    window(0,2.0,w=1.12,side=1); window(0,2.0,w=1.12,side=-1)
    window(0,4.12,z=2.07,w=.68,h=.73,shutters=False)
    chimney(-1.25,-.95,4.15,5.96)
    finish('home')

    building_shell(h=3.45,mat='plaster_light')
    hipped_roof(2.44,2.34,3.43,5.65,['copper','copper_light','copper_dark'])
    door(); window(-1.38,1.77,w=.73,h=1.18,glow=True,shutters=False); window(1.38,1.77,w=.73,h=1.18,glow=True,shutters=False)
    window(0,2.1,w=1.05,side=1)
    awning(2.67,2.04,1.85); sign('store',1.45,3.53,2.04)
    cylinder('merchant roof finial',(0,5.82,0),.11,.42,'bronze',6,top=.025)
    finish('store')

    building_shell(h=4.10,mat='stone')
    masonry(.85,2.075,2.075,3,True)
    # Broad stone quoins articulate the edges of the bank's heavy masonry.
    for x in [-1.94,1.94]:
        for z in [-1.94,1.94]:
            for j in range(5): box('bank corner quoin',(x,.93+j*.61,z),(.40,.40,.40),'stone_light')
    roof_start=len(PARTS)
    gable(2.02,2.02,4.10,6.38,'stone_light')
    wedge_roof('bank patinated copper',2.45,2.36,4.08,6.54,['copper_dark','copper','copper_light'])
    rotate_parts(roof_start)
    door(stone=True)
    for x in [-1.36,1.36]:
        window(x,2.03,w=.55,h=1.45,shutters=False)
        for dx in [-.15,.15]: box('bank wrought bars',(x+dx,2.03,2.255),(.035,1.42,.05),'iron')
    window(0,2.20,w=.8,h=1.55,side=1,shutters=False)
    box('bank entablature',(0,3.63,2.16),(3.95,.24,.24),'stone_light')
    sign('bank',0,3.84,2.20)
    cylinder('copper finial',(0,6.81,0),.16,.65,'bronze',8,top=.03)
    finish('bank')

    building_shell(h=3.32,mat='plaster_warm')
    roof_start=len(PARTS)
    gable(2.02,2.02,3.32,5.55,'plaster_warm')
    wedge_roof('workshop earth tile',2.44,2.34,3.30,5.70,['terracotta_dark','terracotta','terracotta_light'])
    rotate_parts(roof_start)
    door(); window(-1.40,1.95,w=.55,h=.95,shutters=False); window(1.4,1.95,w=.55,h=.95,shutters=False)
    window(0,2.0,w=1.35,h=1.02,side=1,shutters=False)
    sign('workshop',1.3,2.98,2.09)
    chimney(-1.3,-1.0,3.9,5.87)
    # Pegged struts and a loft hoist give the craftsman's facade a distinct rhythm.
    beam('loft hoist',(0,3.35,1.85),(0,3.35,2.64),.16,'timber_light')
    beam('hoist brace',(0,2.95,2.05),(0,3.34,2.48),.10,'timber')
    beam('hoist rope',(0,3.32,2.58),(0,2.72,2.58),.024,'cream')
    finish('workshop')

    building_shell(h=4.56,mat='plaster_light')
    box('tavern overhanging story',(0,3.72,0),(4.28,1.64,4.24),'plaster')
    for yy in [2.9,4.55]: box('tavern story beam',(0,yy,0),(4.42,.20,4.36),'timber')
    for x in [-2.08,0,2.08]: box('front upper stud',(x,3.72,2.17),(.17,1.60,.14),'timber')
    for s in [-1,1]:
        beam('tavern decorative brace',(s*.18,3.0,2.185),(s*1.92,4.44,2.185),.11,'timber')
        for x in [-1.8,1.8]: beam('story corbel',(x,2.51,s*2.02),(x,2.87,s*2.21),.16,'timber_light')
    gable(2.10,2.12,4.56,6.85,'plaster_light')
    wedge_roof('tavern russet roof',2.50,2.43,4.53,7.03,['terracotta','terracotta_light','terracotta_dark'],courses=6)
    door(); window(-1.4,1.85,w=.56,h=.88,glow=True); window(1.4,1.85,w=.56,h=.88,glow=True)
    for x in [-1.07,1.07]: window(x,3.76,z=2.15,w=.68,h=.92,glow=True,shutters=False)
    window(0,3.72,z=2.14,w=1.30,h=.9,glow=True,side=1)
    window(0,5.5,z=2.16,w=.76,h=.82,glow=True,shutters=False)
    chimney(-1.38,-.92,5.0,7.31)
    sign('tavern',1.55,2.92,2.14)
    finish('tavern')

    building_shell(h=3.10,mat='stone_dark')
    gable(2.02,2.02,3.10,5.31,'plaster_warm')
    wedge_roof('forge soot slate',2.44,2.32,3.07,5.48,['slate_dark','slate','stone_dark'])
    door(stone=True); window(-1.35,1.9,w=.60,h=.83,glow=True,shutters=False)
    # Faceted tapered stone flue, well above the roof, gives the smithy its landmark.
    cylinder('forge tapered flue',(-1.2,4.55,-.75),.62,3.8,'stone_dark',6,top=.44)
    for j in range(6): cylinder('flue stone course',(-1.2,3.08+j*.56,-.75),.63-j*.025,.11,'stone',6)
    cylinder('flue lip',(-1.2,6.47,-.75),.60,.25,'stone_light',6)
    cylinder('flue dark throat',(-1.2,6.60,-.75),.37,.02,'coal',6)
    sign('forge',1.33,3.33,2.07)
    # Side forge recess and orange embers are static colored geometry, no lights.
    box('forge recess',(2.052,1.55,-.20),(.04,1.46,1.45),'recess')
    box('forge hearth',(2.085,1.02,-.20),(.08,.26,1.18),'fire')
    for z in [-.95,.55]: box('forge portal pillar',(2.11,1.58,z),(.26,1.58,.20),'stone_light')
    box('forge portal lintel',(2.11,2.38,-.20),(.29,.20,1.72),'stone')
    finish('forge')

def make_nature():
    cylinder('oak spreading trunk',(0,1.6,0),.37,3.2,'bark',7,top=.22)
    for a in [0,2.1,4.25]:
        xx,zz=math.cos(a),math.sin(a)
        beam('oak branch',(0,2.25,0),(xx*.85,3.75,zz*.85),.22,'bark_light')
        beam('oak buttress root',(xx*.57,.04,zz*.57),(xx*.15,.80,zz*.15),.22,'bark')
    ico('oak crown',(0,4.55,0),(1.57,1.24,1.45),'leaf',2,['leaf','leaf_light','leaf_dark'],.09)
    for x,y,z,s in [(-.94,3.9,.42,1.0),(.9,4.05,.52,.93),(-.45,4.15,-.93,.98),(.52,4.95,-.42,.9)]:
        ico('oak branch canopy',(x,y,z),(s,.94*s,.95*s),'leaf',1,['leaf','leaf_light','leaf_dark','leaf_gold'],.10)
    finish('oak')
    cylinder('pine trunk',(0,1.1,0),.22,2.2,'bark',7,top=.14)
    for j,(yy,r,h) in enumerate([(1.65,1.55,2.0),(2.6,1.32,1.9),(3.55,1.02,1.70),(4.42,.67,1.48)]):
        n=9; vs=[]
        for k in range(n):
            a=2*math.pi*k/n+j*.22
            vs.append((math.cos(a)*r,yy+(.12 if k%2 else 0),math.sin(a)*r))
        for k in range(n):
            a=2*math.pi*k/n+j*.22
            vs.append((math.cos(a)*r*.78,yy+h*.30,math.sin(a)*r*.78))
        vs.append((0,yy+h,0))
        fs=[tuple(reversed(range(n)))]; ms=['pine_dark']
        for k in range(n):
            kk=(k+1)%n
            fs.append((k,kk,kk+n,k+n)); ms.append('pine' if k%3 else 'pine_dark')
            fs.append((k+n,kk+n,2*n)); ms.append('pine_light' if k%3==1 else 'pine')
        mesh('layered pine boughs',vs,[tuple(reversed(f)) for f in fs],'pine',ms)
    finish('pine')
    ico('weathered rock',(0,.60,0),(1.08,.82,.95),'rock',2,['rock','rock_light','stone_dark'],.15)
    # Flatten base to place this naturally on terrain.
    for v in PARTS[0].data.vertices: v.co.z=max(-.56,v.co.z)
    finish('rock')

def make_props():
    n=10; rings=[(0,.39),(.10,.44),(.60,.51),(1.10,.44),(1.20,.40)]
    vs=[(math.cos(i*2*math.pi/n)*r,y,math.sin(i*2*math.pi/n)*r) for y,r in rings for i in range(n)]
    fs=[tuple(reversed(range(n))),tuple(range((len(rings)-1)*n,len(rings)*n))]; ms=['timber','endgrain']
    for j in range(len(rings)-1):
        for i in range(n):
            fs.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
            ms.append('timber_light' if i%3 else 'timber')
    mesh('coopered barrel',vs,[tuple(reversed(f)) for f in fs],'timber',ms)
    for y,r in [(.18,.46),(.95,.48)]: cylinder('barrel iron hoop',(0,y,0),r,.09,'iron',10)
    for i in [-1,0,1]: box('barrel lid board seam',(i*.20,1.204,0),(.015,.014,.70),'timber')
    finish('barrel')
    box('crate core',(0,.48,0),(.92,.96,.92),'timber')
    for side in [-1,1]:
        for i in range(4):
            box('crate plank',(-.345+i*.23,.48,side*.472),(.211,.92,.035),'timber_light')
            box('crate plank',(side*.472,.48,-.345+i*.23),(.035,.92,.211),'timber_light')
        for yy in [.12,.84]:
            box('crate cross rail',(0,yy,side*.50),(1.04,.12,.08),'endgrain')
            box('crate cross rail',(side*.50,yy,0),(.08,.12,1.04),'endgrain')
        beam('crate diagonal brace',(-.40,.21,side*.52),(.40,.75,side*.52),.105,'endgrain')
    for i in range(4): box('crate lid',(-.345+i*.23,.98,0),(.21,.045,.92),'timber_light')
    finish('crate')
    cylinder('lantern plinth',(0,.11,0),.31,.22,'stone_dark',6)
    cylinder('lantern post',(0,1.05,0),.085,1.90,'timber',6)
    beam('lantern crooked arm',(0,2.0,0),(.36,2.20,0),.09,'iron')
    beam('lantern hanger',(.36,2.20,0),(.36,1.93,0),.05,'iron')
    box('lantern warm glass',(.36,1.65,0),(.34,.46,.34),'window_glow')
    for x in [.17,.55]:
        for z in [-.19,.19]: beam('lantern frame',(x,1.39,z),(x,1.91,z),.035,'iron')
    cylinder('lantern tapered cap',(.36,1.98,0),.32,.20,'iron',4,top=.04)
    box('lantern base',(.36,1.39,0),(.43,.07,.43),'iron')
    finish('lantern')

def profile(name,rings,mat,palette=None,n=8):
    """Anatomical/armor silhouette from bevel-cornered rectangular cross sections."""
    # Ring order is clockwise viewed from above in Three coordinates.
    shape=[(-1,-.55),(-.55,-1),(.55,-1),(1,-.55),(1,.55),(.55,1),(-.55,1),(-1,.55)]
    vs=[(sx*w,y,sz*d) for y,w,d in rings for sx,sz in shape]
    fs=[tuple(range(n)),tuple(reversed(range((len(rings)-1)*n,len(rings)*n)))]
    ms=[mat,mat]
    for j in range(len(rings)-1):
        for k in range(n):
            fs.append((j*n+k,(j+1)*n+k,(j+1)*n+(k+1)%n,j*n+(k+1)%n))
            ms.append((palette or [mat])[(k+j)%len(palette or [mat])])
    # The rectangular ring is CCW around the logical Y-down view; correct outward.
    return mesh(name,vs,fs,mat,ms)

def face_quad(name,x,y,z,w,h,mat):
    return mesh(name,[(x-w/2,y-h/2,z),(x+w/2,y-h/2,z),(x+w/2,y+h/2,z),(x-w/2,y+h/2,z)],[(0,1,2,3)],mat)

def make_character():
    for name,color in {
        'cloth_gray':'D2D2D2','cloth_fold':'ADADAD','cloth_high':'E5E5E5',
        'armor_gray':'CBCBCB','armor_shadow':'999999','armor_edge':'EEEEEE',
        'boot_gray':'9B9B9B','boot_shadow':'777777','skin':'C79773',
        'skin_light':'D6AB84','skin_shadow':'AE795B','hair':'523C2F',
        'hair_light':'6F4D34','eye':'263237','eye_white':'DFE1CC',
    }.items(): material(name,color)
    profile('tailored adventurer tunic',[(-.41,.265,.19),(-.26,.27,.185),(.10,.37,.23),(.29,.34,.21),(.41,.13,.13)],'cloth_gray',['cloth_gray','cloth_gray','cloth_fold','cloth_high'])
    # Raised neckline and waist band retain neutral grayscale for class tinting.
    profile('tunic collar',[(.30,.14,.14),(.41,.14,.14)],'cloth_fold')
    profile('tunic waist seam',[(-.30,.274,.191),(-.245,.274,.191)],'cloth_fold')
    beam('tunic chest seam',(0,.30,.212),(0,-.23,.200),.014,'cloth_fold')
    finish('hero_torso',False)

    profile('shaped cuirass',[(-.46,.32,.235),(-.25,.30,.225),(.15,.43,.29),(.34,.355,.24),(.46,.15,.155)],'armor_gray',['armor_gray','armor_shadow','armor_gray','armor_edge'])
    # A centered raised keel and rolled lower edge define the breastplate in motion.
    mesh('breastplate raised center',[(-.15,-.22,.232),(.15,-.22,.232),(.17,.22,.280),(0,.30,.304),(-.17,.22,.280),(0,-.15,.280)],[(0,1,5),(1,2,3,5),(3,4,0,5)],'armor_edge')
    profile('cuirass rolled waist',[(-.44,.326,.24),(-.39,.326,.24)],'armor_shadow')
    finish('hero_cuirass',False)

    rings=[(-.265,.12,.14),(-.16,.218,.207),(.015,.245,.238),(.18,.248,.217),(.28,.175,.16),(.315,.035,.05)]
    o=profile('angular human head',rings,'skin',['skin','skin_light','skin','skin_shadow'])
    # Hair occupies crown/back/sides, with visible forehead and natural face planes.
    o.data.materials.append(MATS['hair']); hair_index=len(o.data.materials)-1
    o.data.materials.append(MATS['hair_light']); light_index=len(o.data.materials)-1
    for p in o.data.polygons:
        center=p.center
        if center.z>.225 or (center.z>.075 and center.y>.01): p.material_index=hair_index if p.index%3 else light_index
    for s in [-1,1]:
        ico('modeled ear',(s*.267,-.018,-.005),(.056,.102,.069),'skin',1,['skin','skin_light'],0)
        # Eyes sit on a slightly projecting face plane, not a visor band.
        face_quad('eye white',s*.098,.045,.242,.073,.034,'eye_white')
        face_quad('eye pupil',s*.092,.045,.246,.026,.033,'eye')
        beam('shaped brow',(s*.058,.105,.242),(s*.140,.094,.221),.025,'hair')
    mesh('modeled nose',[(-.041,.079,.243),(.041,.079,.243),(.047,-.057,.252),(0,-.035,.309),(-.047,-.057,.252)],[(0,3,1),(1,3,2),(2,3,4),(4,3,0)],'skin_light',['skin_light','skin_shadow','skin_shadow','skin'])
    face_quad('quiet mouth',0,-.138,.211,.102,.016,'skin_shadow')
    # A swept forelock gives the head a readable hair silhouette.
    mesh('swept hair fringe',[(-.20,.195,.147),(.19,.195,.147),(.145,.268,.12),(-.07,.306,.09),(-.22,.247,.101),(-.15,.143,.191),(-.01,.189,.224)],[(0,1,2,3,4),(0,5,6,1)],'hair',['hair_light','hair'])
    finish('hero_head',False)

    profile('boot shaft',[(-.56,.093,.087),(-.36,.092,.094),(-.075,.105,.112),(0,.12,.12)],'boot_gray',['boot_gray','boot_shadow','boot_gray','cloth_fold'])
    profile('rolled boot cuff',[(-.085,.122,.122),(-.012,.122,.122)],'cloth_fold')
    # Toe and sole are bevel-cut polygons, with the toe projecting toward +Z.
    foot=profile('boot toe',[(-.70,.12,.15),(-.655,.12,.15),(-.535,.105,.126)],'boot_gray',['boot_gray','boot_shadow','boot_gray','cloth_fold'])
    for v in foot.data.vertices: v.co.y-=.055
    sole=profile('boot sole',[(-.70,.122,.15),(-.66,.122,.15)],'boot_shadow')
    for v in sole.data.vertices: v.co.y-=.055
    finish('hero_boot',False)

    profile('forged shoulder shell',[(-.13,.17,.21),(-.045,.17,.26),(.09,.135,.225),(.13,.095,.16)],'armor_gray',['armor_gray','armor_shadow','armor_gray','armor_edge'])
    profile('shoulder rolled edge',[(-.125,.172,.215),(-.09,.172,.215)],'armor_shadow')
    finish('hero_shoulder',False)

def beveled_slab(name,x,y,z,w,h,d,mat,bevel=.055):
    a=w/2; c=d/2
    shape=[(-a,-c+bevel),(-a+bevel,-c),(a-bevel,-c),(a,-c+bevel),
           (a,c-bevel),(a-bevel,c),(-a+bevel,c),(-a,c-bevel)]
    vs=[(x+xx,y+yy,z+zz) for yy in [-h/2,h/2] for xx,zz in shape]
    faces=[tuple(range(8)),tuple(reversed(range(8,16)))]
    faces += [(i,8+i,8+(i+1)%8,(i+1)%8) for i in range(8)]
    return mesh(name,vs,faces,mat)

def little_book(x,y,z,w,h,mat):
    box('bound book',(x,y+h/2,z),(w,h,.31),mat)
    for dy in [h*.18,h*.78]: face_quad('book spine tooling',x,y+dy,z+.157,w*.78,.019,'bronze')
    mesh('book page edges',[(x-w*.375,y+h+.005,z-.135),(x-w*.375,y+h+.005,z+.105),(x+w*.375,y+h+.005,z+.105),(x+w*.375,y+h+.005,z-.135)],[(0,1,2,3)],'cream')

def pottery(x,y,z,height=.48,mat='terracotta'):
    n=7; rings=[(0,.095),(.07,.16),(.28,.17),(.39,.085),(.47,.085)]
    factor=height/.48
    vs=[(x+math.cos(k*2*math.pi/n)*r*factor,y+yy*factor,z+math.sin(k*2*math.pi/n)*r*factor) for yy,r in rings for k in range(n)]
    fs=[tuple(reversed(range(n)))]; ms=[mat]
    for j in range(len(rings)-1):
        for k in range(n):
            fs.append((j*n+k,j*n+(k+1)%n,(j+1)*n+(k+1)%n,(j+1)*n+k)); ms.append(mat)
    fs=[tuple(reversed(f)) for f in fs]
    mesh('wheel-thrown pottery',vs,fs,mat,ms)
    lip=[(x+math.cos(k*2*math.pi/n)*r*factor,y+.487*factor,z+math.sin(k*2*math.pi/n)*r*factor) for r in [.101,.067] for k in range(n)]
    mesh('pottery thick rim',lip,[(k,k+n,(k+1)%n+n,(k+1)%n) for k in range(n)],'terracotta_light' if mat=='terracotta' else 'stone_light')
    mesh('pottery dark mouth',[(xx,yy-.009,zz) for xx,yy,zz in lip[n:]], [tuple(reversed(range(n)))], 'recess')

def grain_sack(x,y,z):
    ico('cloth grain sack',(x,y+.24,z),(.22,.25,.18),'plaster_warm',1,['plaster_warm','plaster','plaster_light'],.05)
    cylinder('sack gathered neck',(x,y+.47,z),.075,.10,'plaster',6,top=.055)
    cylinder('sack rope tie',(x,y+.47,z),.079,.025,'timber',6)

def make_furniture():
    # A merchant's counter: coherent frame, recessed paneled facade and useful top.
    for x in [-1.29,1.29]:
        for z in [-.55,.55]:
            box('counter oak post',(x,.56,z),(.19,1.12,.18),'timber')
            box('counter brass foot',(x,.05,z),(.20,.10,.19),'bronze')
    for x in [-1.29,1.29]: box('counter side panel',(x,.61,0),(.09,.83,1.03),'timber_light')
    box('counter front recess',(0,.61,.568),(2.57,.89,.08),'timber')
    for x in [-.86,0,.86]:
        box('counter recessed field',(x,.62,.625),(.73,.67,.055),'timber_light')
        for yy in [.245,.995]: box('counter panel molding',(x,yy,.658),(.80,.065,.065),'endgrain')
        for dx in [-.405,.405]: box('counter panel stile',(x+dx,.62,.658),(.06,.78,.065),'endgrain')
        for s in [-1,1]:
            beam('counter carved diamond',(x,.41,.669),(x+s*.15,.62,.669),.035,'endgrain')
            beam('counter carved diamond',(x+s*.15,.62,.669),(x,.83,.669),.035,'endgrain')
        face_quad('counter brass lozenge',x,.62,.691,.045,.055,'bronze_light')
    beveled_slab('counter heavy top',0,1.155,0,3,.17,1.5,'timber',.08)
    for j in range(5): box('counter polished plank',(0,1.243,-.56+j*.28),(2.78,.014,.262),'timber_light' if j%3 else 'endgrain')
    # A small ledger and money tray stop the countertop reading as an empty block.
    box('merchant ledger',(-.68,1.264,.02),(.52,.026,.42),'fabric')
    box('ledger pages',(-.68,1.281,.015),(.47,.008,.36),'cream')
    box('ledger seam',(-.68,1.287,.015),(.012,.004,.35),'timber')
    beveled_slab('coin tray',.70,1.267,.04,.45,.038,.34,'bronze',.035)
    for x,z in [(.60,-.015),(.72,.075),(.82,-.01)]: cylinder('counter coin',(x,1.294,z),.045,.011,'bronze_light',6)
    finish('counter')

    # An open, cross-braced shelf: no opaque wall hides its depth or contents.
    for x in [-1.41,1.41]:
        for z in [-.19,.19]:
            box('shelf upright',(x,1.60,z),(.15,3.20,.12),'timber')
    for yy in [.10,.85,1.60,2.35,3.10]:
        if yy==3.10: beveled_slab('shelf cornice',0,yy,0,3,.12,.50,'timber_light',.035)
        else: box('shelf board',(0,yy,0),(3,.12,.50),'timber_light')
        box('shelf carved front rail',(0,yy-.025,.237),(2.94,.085,.026),'endgrain')
    for s in [-1,1]: beam('open shelf back brace',(-s*1.35,.15,-.217),(s*1.35,3.09,-.217),.065,'timber')
    # Distinct silhouettes and grouped stocks, kept below the 1,000-triangle budget.
    grain_sack(-.91,.16,.018); grain_sack(-.37,.16,.018)
    for j in range(3): little_book(.54+j*.21,.16,.018,.165,.52-j*.07,['fabric','terracotta','slate'][j])
    pottery(-.95,.91,0,.57,'terracotta'); pottery(-.38,.91,0,.43,'copper')
    for j in range(3):
        box('folded linen',(.62,.96+j*.075,.015),(.65,.07,.37),['cream','plaster','fabric_light'][j])
    for j in range(5): little_book(-1.02+j*.20,1.66,.018,.155,[.46,.54,.50,.43,.58][j],['fabric','slate','terracotta','timber_light','copper'][j])
    pottery(.86,1.66,0,.51,'stone')
    for x in [-.88,.87]:
        box('shelf provision box',(x,2.61,0),(.58,.38,.38),'timber_light')
        box('provision box lid',(x,2.81,0),(.62,.055,.40),'endgrain')
        for dx in [-.18,.18]: face_quad('provision iron strap',x+dx,2.61,.192,.045,.37,'iron')
    pottery(0,2.41,0,.55,'terracotta')
    finish('stocked_shelf')

    # Trestle construction leaves the table's underside open and legible.
    for x in [-.90,.90]:
        beveled_slab('table trestle foot',x,.06,0,.30,.12,1.21,'timber',.055)
        for s in [-1,1]:
            beam('table splayed leg',(x,.10,s*.43),(x,.99,s*.25),.16,'timber_light')
        box('table trestle cap',(x,.95,0),(.26,.13,1.21),'timber')
    beam('table low stretcher',(-1.02,.32,0),(1.02,.32,0),.14,'timber_light')
    for x in [-.9,.9]:
        beam('table diagonal knee',(x,.34,0),(x*.32,.96,0),.105,'timber')
        box('table through tenon',(x,.33,.088),(.10,.13,.035),'endgrain')
    beveled_slab('table carved top',0,1.04,0,2.6,.105,1.5,'timber',.09)
    for j in range(5): box('table plank',(0,1.096,-.54+j*.27),(2.40,.008,.25),'timber_light' if j%2 else 'endgrain')
    finish('table')

make_buildings()
make_nature()
make_props()
make_character()
make_furniture()

def export_asset(obj):
    data=obj.data; data.calc_loop_triangles()
    pos=[]; normals=[]; colors=[]; indices=[]; lookup={}
    for tri in data.loop_triangles:
        if tri.area < 1e-10: continue
        color=data.materials[tri.material_index].diffuse_color[:3]
        normal=tri.normal
        norm=(normal.x,normal.z,-normal.y)
        for vid in tri.vertices:
            v=data.vertices[vid].co
            p=(v.x,v.z,-v.y)
            key=tuple(round(f,5) for f in (*p,*norm,*color))
            if key not in lookup:
                lookup[key]=len(pos)//3
                pos.extend(key[:3]); normals.extend(key[3:6]); colors.extend(key[6:])
            indices.append(lookup[key])
    bounds={k:[round(min(pos[j::3]) if k=='min' else max(pos[j::3]),4) for j in range(3)] for k in ['min','max']}
    return {'position':pos,'normal':normals,'color':colors,'index':indices}, {'triangles':len(indices)//3,'vertices':len(pos)//3,'bounds':bounds}

kit={'version':1,'models':{},'metadata':{'generator':'Blender 5.2 / scripts/build-realm-art.py','license':'Original project artwork','coordinates':'+Y up, +Z front, ground Y=0','colors':'linear RGB','models':{}}}
for name,obj in ASSETS.items():
    geom,meta=export_asset(obj)
    kit['models'][name]=geom; kit['metadata']['models'][name]=meta
dest=OUT/'realm-kit.json'
temporary=dest.with_suffix('.tmp')
temporary.write_text(json.dumps(kit,separators=(',',':')),encoding='utf-8')
os.replace(temporary,dest)
(REVIEW/'asset-metrics.json').write_text(json.dumps({'bytes':dest.stat().st_size,**kit['metadata']},indent=2),encoding='utf-8')
print('REALM_ASSET_METRICS',json.dumps({'bytes':dest.stat().st_size,'models':kit['metadata']['models']}))

# Save an editable, arranged Blender source scene and a real rendered contact sheet.
scene=bpy.context.scene
layouts={
    'home':(-10,0,-7),'store':(0,0,-7),'bank':(10,0,-7),
    'workshop':(-10,0,4),'tavern':(0,0,4),'forge':(10,0,4),
    'oak':(-10,0,14),'pine':(-5,0,14),'rock':(0,0,14),
    'barrel':(4,0,14),'crate':(7,0,14),'lantern':(10,0,14),
}
for name,obj in ASSETS.items():
    if name not in layouts:
        obj.hide_render=True
        continue
    obj.location=cv(layouts[name])
    x,y,z=layouts[name]
    bpy.ops.object.text_add(location=cv((x,.055,z+3.0)))
    label=bpy.context.object; label.name='label '+name
    label.data.body=name.upper(); label.data.align_x='CENTER'; label.data.size=.40
    label.rotation_euler=(0,0,0)
    label.data.materials.append(MATS['cream'])

material('review_ground','283B38')
box('review ground',(0,-.16,4),(36,.25,33),'review_ground')
PARTS.clear()
world=bpy.data.worlds.new('Soft blue sky')
world.use_nodes=True; world.node_tree.nodes['Background'].inputs[0].default_value=(.20,.27,.31,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.55
scene.world=world
def area(name,position,energy,size,color):
    bpy.ops.object.light_add(type='AREA',location=cv(position))
    o=bpy.context.object; o.name=name; o.data.energy=energy; o.data.shape='DISK'; o.data.size=size; o.data.color=color
    direction=Vector(cv((0,1,3)))-o.location
    o.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
area('warm key',(-13,26,15),4800,18,(1,.83,.64))
area('cool fill',(16,15,0),2700,18,(.65,.83,1))
bpy.ops.object.camera_add(location=cv((21,28,42)))
cam=bpy.context.object; cam.rotation_euler=(Vector(cv((0,2,3)))-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.type='ORTHO'; cam.data.ortho_scale=42; scene.camera=cam
scene.render.engine='CYCLES'; scene.cycles.samples=24
scene.cycles.use_denoising=True
scene.render.resolution_x=1800; scene.render.resolution_y=1500; scene.render.resolution_percentage=100
scene.view_settings.view_transform='Standard'
scene.view_settings.look='Medium High Contrast'
scene.render.image_settings.file_format='PNG'
scene.render.filepath=str(REVIEW/'realm-kit-contact.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'source'/'realm-kit.blend'))
bpy.ops.render.render(write_still=True)

# Furniture study, separate from the source environment and adventurer sheets.
def instance(name,loc,tint=None):
    src=ASSETS[name]
    o=bpy.data.objects.new('asset study '+name,src.data.copy())
    scene.collection.objects.link(o); o.location=cv(loc)
    if tint:
        for j,m in enumerate(o.data.materials):
            copy=m.copy(); col=copy.diffuse_color
            copy.diffuse_color=(col[0]*tint[0],col[1]*tint[1],col[2]*tint[2],1)
            copy.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=copy.diffuse_color
            o.data.materials[j]=copy
    return o

for o in scene.objects:
    if o.type in {'MESH','FONT'}:
        o.hide_render=True
        o.hide_set(True)
for name,loc in [('counter',(-4,0,0)),('stocked_shelf',(0,0,0)),('table',(4,0,0))]:
    instance(name,loc)
    bpy.ops.object.text_add(location=cv((loc[0],.015,1.2)))
    label=bpy.context.object; label.data.body=name.upper().replace('_',' ')
    label.data.align_x='CENTER'; label.data.size=.22; label.data.materials.append(MATS['cream'])
box('furniture study ground',(0,-.09,0),(13,.16,5),'review_ground')
cam.location=cv((6.7,6.5,12.5)); cam.rotation_euler=(Vector(cv((0,1.30,0)))-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.ortho_scale=13.0
scene.render.resolution_x=1800; scene.render.resolution_y=900
scene.render.filepath=str(REVIEW/'realm-furniture-contact.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'source'/'realm-kit.blend'))
bpy.ops.render.render(write_still=True)

# Independent character study using precisely the exported part meshes.
for o in scene.objects:
    if o.type in {'MESH','FONT'}:
        o.hide_render=True
        o.hide_set(True)
instance('hero_torso',(0,1.11,0),(.22,.42,.48))
instance('hero_cuirass',(0,1.11,0),(.47,.56,.58))
instance('hero_head',(0,1.82,0))
for s in [-1,1]:
    instance('hero_boot',(s*.175,.70,0),(.35,.28,.21))
    instance('hero_shoulder',(s*.415,1.42,0),(.47,.56,.58))
    beam('study upper sleeve',(s*.43,1.34,0),(s*.52,1.02,.02),.19,'fabric')
    beam('study bracer',(s*.52,1.03,.02),(s*.54,.79,.045),.15,'timber_light')
    ico('study hand',(s*.55,.75,.05),(.105,.14,.09),'skin',1,None,0)
box('study leather belt',(0,.85,.01),(.65,.115,.50),'timber')
box('study brass buckle',(0,.85,.279),(.16,.13,.045),'bronze')
beam('study sword grip',(.55,.75,.07),(.60,.49,.11),.07,'timber')
beam('study crossguard',(.42,.49,.12),(.78,.53,.12),.06,'bronze')
mesh('study sword blade',[(.53,.49,.12),(.66,.51,.12),(.94,-.025,.19),(.59,.49,.15)],[(0,1,3),(1,2,3),(2,0,3)],'stone_light')
box('character study base',(0,-.045,0),(2.8,.075,2.6),'review_ground')
cam.location=cv((3.5,2.65,6.5)); cam.rotation_euler=(Vector(cv((0,1.12,0)))-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.ortho_scale=2.80
area('portrait softbox',(-3,5,4),280,5,(1,.88,.72))
scene.render.resolution_x=1100; scene.render.resolution_y=1300
scene.render.filepath=str(REVIEW/'realm-adventurer-contact.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'source'/'realm-kit.blend'))
bpy.ops.render.render(write_still=True)
