// FitAI Coach hero scene — "Kinetic Core"
// The app's Today ring, rendered in 3D: a pandan calorie ring and a sunrise workout ring
// fill around a breathing AI core, with particles drifting like a training pulse.
// Modes: "full" (home), "lite" (sub-page heroes). Falls back to CSS when WebGL, motion
// or device capability says no.
import * as THREE from "./vendor/three.module.min.js";

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) { return false; }
}

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

function coreMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPulse: { value: 0 }, uA: { value: new THREE.Color("#3ddc97") }, uB: { value: new THREE.Color("#f2a33a") } },
    vertexShader: NOISE + /* glsl */ `
      uniform float uTime; uniform float uPulse;
      varying vec3 vN; varying vec3 vView; varying float vD;
      void main(){
        float n = snoise(normal * 1.6 + vec3(uTime * .25));
        float d = n * .09 + uPulse * .05;
        vD = n;
        vec3 p = position + normal * d;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        vN = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uA; uniform vec3 uB; uniform float uPulse;
      varying vec3 vN; varying vec3 vView; varying float vD;
      void main(){
        float fres = pow(1. - max(dot(vN, vView), 0.), 2.4);
        vec3 base = mix(vec3(.02,.09,.07), uA * .35, smoothstep(-.4, .8, vD));
        vec3 col = base + mix(uA, uB, smoothstep(.2, .9, vD * .5 + .5)) * fres * (1.25 + uPulse * .6);
        gl_FragColor = vec4(col, 1.);
      }`,
  });
}

function ringMaterial(color, glow) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uProgress: { value: 0 }, uColor: { value: new THREE.Color(color) }, uGlow: { value: glow }, uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: /* glsl */ `
      uniform float uProgress; uniform vec3 uColor; uniform float uGlow; uniform float uTime; varying vec2 vUv;
      void main(){
        float along = vUv.x;
        if (along > uProgress) discard;
        float edge = 1. - smoothstep(uProgress - .04, uProgress, along);
        float head = smoothstep(uProgress - .05, uProgress, along);
        float shimmer = .85 + .15 * sin(along * 60. - uTime * 3.);
        vec3 col = uColor * (uGlow * shimmer + head * 1.6);
        gl_FragColor = vec4(col, .95 * (.55 + .45 * edge));
      }`,
  });
}

function particleField(count, radius) {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = radius * (0.35 + Math.pow(Math.random(), 0.7));
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.cos(ph) * 0.55;
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    seed[i] = Math.random();
  }
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uSize: { value: 22 * Math.min(devicePixelRatio, 2) } },
    vertexShader: /* glsl */ `
      uniform float uTime; uniform float uSize; attribute float aSeed; varying float vA; varying float vS;
      void main(){
        vec3 p = position;
        float a = uTime * (.05 + aSeed * .08);
        p.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xz;
        p.y += sin(uTime * .6 + aSeed * 6.28) * .08;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_PointSize = uSize * (.3 + aSeed * .7) / -mv.z;
        vA = .35 + .65 * aSeed; vS = aSeed;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying float vA; varying float vS;
      void main(){
        float d = length(gl_PointCoord - .5);
        if (d > .5) discard;
        vec3 c = mix(vec3(.24,.86,.59), vec3(.95,.64,.23), step(.92, vS));
        gl_FragColor = vec4(c, (1. - d * 2.) * vA * .7);
      }`,
  });
  return new THREE.Points(g, m);
}

export function mountHero(host, mode = "full") {
  if (!host) return;
  const small = matchMedia("(max-width: 760px)").matches;
  const weak = (navigator.hardwareConcurrency || 8) <= 4;
  if (!webglOK() || reduceMotion || (mode === "lite" && small)) return;
  document.documentElement.classList.add("has-webgl");

  const renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small || weak ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, mode === "full" ? 9.2 : 9.6);

  const rig = new THREE.Group();
  scene.add(rig);

  let core = null;
  if (mode === "full") {
    core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.92, small ? 24 : 48), coreMaterial());
    rig.add(core);
  }

  const R1 = mode === "full" ? 1.95 : 1.7, R2 = R1 - 0.42;
  const trackMat = new THREE.MeshBasicMaterial({ color: 0x3ddc97, transparent: true, opacity: 0.07, depthWrite: false });
  const ringGroup = new THREE.Group();
  const t1 = new THREE.Mesh(new THREE.TorusGeometry(R1, 0.11, 24, 220), trackMat);
  const t2 = new THREE.Mesh(new THREE.TorusGeometry(R2, 0.09, 24, 220), trackMat);
  const calRing = new THREE.Mesh(new THREE.TorusGeometry(R1, 0.11, 24, 220), ringMaterial("#3ddc97", 1.15));
  const moveRing = new THREE.Mesh(new THREE.TorusGeometry(R2, 0.09, 24, 220), ringMaterial("#f2a33a", 1.1));
  [t1, t2, calRing, moveRing].forEach((m) => { m.rotation.z = Math.PI / 2; ringGroup.add(m); });
  rig.add(ringGroup);

  const dots = particleField(small ? 700 : weak ? 1100 : 1800, mode === "full" ? 5.2 : 6);
  scene.add(dots);

  // Place the scene to the right on wide screens so it never sits under the headline.
  function layout() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const wide = w / h > 1.15;
    rig.position.x = wide ? (mode === "full" ? 2.75 : 3.1) : 0;
    rig.position.y = wide ? 0.1 : (mode === "full" ? -2.9 : -2.4);
    rig.scale.setScalar(wide ? 1 : 0.72);
  }
  layout();
  const ro = new ResizeObserver(layout);
  ro.observe(host);

  // Interaction
  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  addEventListener("pointermove", (e) => {
    target.x = (e.clientX / innerWidth - 0.5);
    target.y = (e.clientY / innerHeight - 0.5);
  }, { passive: true });

  const goal = { cal: mode === "full" ? 0.74 : 0.62, move: mode === "full" ? 0.58 : 0.45 };
  const prog = { cal: 0, move: 0 };

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(host);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) loop(); });

  const clock = new THREE.Clock();
  let running = false;
  function loop() {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }
  function frame() {
    if (!visible || document.hidden) { running = false; return; }
    const t = clock.getElapsedTime();
    const scroll = Math.min(scrollY / innerHeight, 1.2);

    prog.cal += (goal.cal - prog.cal) * 0.025;
    prog.move += (goal.move - prog.move) * 0.02;
    calRing.material.uniforms.uProgress.value = prog.cal;
    moveRing.material.uniforms.uProgress.value = prog.move;
    calRing.material.uniforms.uTime.value = moveRing.material.uniforms.uTime.value = t;

    cur.x += (target.x - cur.x) * 0.05;
    cur.y += (target.y - cur.y) * 0.05;
    ringGroup.rotation.x = -0.35 + cur.y * 0.4 + scroll * 0.9;
    ringGroup.rotation.y = cur.x * 0.6 + scroll * 0.4;
    ringGroup.rotation.z = Math.sin(t * 0.25) * 0.05;

    if (core) {
      // Heartbeat: two quick beats then rest, about 66 bpm.
      const beat = t % 0.9;
      const pulse = Math.exp(-Math.pow((beat - 0.08) * 22, 2)) + 0.6 * Math.exp(-Math.pow((beat - 0.28) * 22, 2));
      core.material.uniforms.uTime.value = t;
      core.material.uniforms.uPulse.value = pulse;
      core.rotation.y = t * 0.15 + cur.x * 0.5;
      core.rotation.x = cur.y * 0.3;
      core.scale.setScalar(1 + pulse * 0.025);
    }

    dots.material.uniforms.uTime.value = t;
    dots.rotation.y = cur.x * 0.2;
    camera.position.y = -scroll * 0.8;
    camera.lookAt(0, -scroll * 0.4, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  loop();

  addEventListener("pagehide", () => {
    ro.disconnect();
    renderer.dispose();
    scene.traverse((o) => { o.geometry && o.geometry.dispose(); o.material && o.material.dispose(); });
  });
}

const host = document.querySelector("[data-hero-scene]");
if (host) mountHero(host, host.getAttribute("data-hero-scene") || "full");
