"use client";

import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";

const START = { lat: 52.3676, lng: 4.9041, name: "Amsterdam" };
// Lyon — inland France (avoids coast / water misalignment)
const DESTINATION = { lat: 45.7640, lng: 4.8357, name: "???" };

let audioCtx: AudioContext | null = null;
let spinNodes: { noise: AudioBufferSourceNode; gain: GainNode; filter: BiquadFilterNode; lfo: OscillatorNode } | null = null;

async function ensureAudio(): Promise<AudioContext | null> {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    try { await audioCtx.resume(); } catch {}
  }
  return audioCtx;
}

function initAudio() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

async function startSpinSound() {
  const ctx = await ensureAudio();
  if (!ctx || spinNodes) return;

  try {
    const now = ctx.currentTime;
    // Soft atmospheric rumble: filtered noise (no harsh saw/whoosh)
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      // Brown-ish noise — deep & soft
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.linearRampToValueAtTime(420, now + 1.5);
    filter.Q.value = 0.6;

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.18;
    lfoGain.gain.value = 60;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.6); // quiet

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    lfo.start(now);

    spinNodes = { noise, gain, filter, lfo };
  } catch (e) {
    console.error("Spin sound error:", e);
  }
}

function stopSpinSound() {
  if (!spinNodes || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const { noise, gain, lfo } = spinNodes;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.001), now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.7);
    noise.stop(now + 0.75);
    lfo.stop(now + 0.75);
  } catch {}
  spinNodes = null;
}

async function playLockSound() {
  const ctx = await ensureAudio();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 500 + i * 250;
      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.32, now + i * 0.12 + 0.02);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.12 + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.12);
    }
    const oscF = ctx.createOscillator();
    const gainF = ctx.createGain();
    oscF.type = "sine";
    oscF.frequency.setValueAtTime(1200, now + 0.4);
    oscF.frequency.exponentialRampToValueAtTime(600, now + 1.0);
    gainF.gain.setValueAtTime(0, now + 0.4);
    gainF.gain.linearRampToValueAtTime(0.35, now + 0.45);
    gainF.gain.linearRampToValueAtTime(0, now + 1.1);
    oscF.connect(gainF);
    gainF.connect(ctx.destination);
    oscF.start(now + 0.4);
    oscF.stop(now + 1.1);
  } catch (e) {
    console.error("Lock sound error:", e);
  }
}

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function Globe({ phase, onPhaseChange }: { phase: string; onPhaseChange: (p: string) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const markerRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const startPos = useMemo(() => latLngToVector3(START.lat, START.lng, 5), []);
  const endPos = useMemo(() => latLngToVector3(DESTINATION.lat, DESTINATION.lng, 5), []);
  const markerPos = useMemo(() => latLngToVector3(DESTINATION.lat, DESTINATION.lng, 1.02), []);
  const { camera, size } = useThree();
  const animRef = useRef({
    progress: 0,
    spinSpeed: 0.002,
    flyStarted: false,
    phaseLocked: false,
    startRotX: 0,
    startRotY: 0,
  });
  const isPortrait = size.height > size.width;
  const baseCam = isPortrait ? 3.6 : 2.8;
  const endCam = isPortrait ? 1.55 : 1.25;

  const earthTex = useLoader(TextureLoader, "https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg");
  
  useEffect(() => { if (earthTex) earthTex.colorSpace = THREE.SRGBColorSpace; }, [earthTex]);
  useEffect(() => {
    camera.position.copy(startPos.clone().normalize().multiplyScalar(baseCam));
    camera.lookAt(0, 0, 0);
  }, [camera, startPos, baseCam]);

  useEffect(() => {
    animRef.current.phaseLocked = false;
    if (phase === "spinning") {
      animRef.current.spinSpeed = 0.02;
      animRef.current.progress = 0;
      animRef.current.flyStarted = false;
    }
  }, [phase]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    if (phase === "idle") {
      groupRef.current.rotation.y += 0.002;
    }
    
    if (phase === "spinning") {
      animRef.current.spinSpeed = Math.min(animRef.current.spinSpeed + delta * 0.04, 0.2);
      groupRef.current.rotation.y += animRef.current.spinSpeed;
      groupRef.current.rotation.x = Math.sin(t * 2.2) * 0.35;
      
      if (animRef.current.spinSpeed >= 0.2 && !animRef.current.phaseLocked) {
        animRef.current.phaseLocked = true;
        onPhaseChange("flying");
      }
    }
    
    if (phase === "flying") {
      // Unwind globe to rotation 0 so lat/lng matches the texture → marker on land
      if (!animRef.current.flyStarted) {
        animRef.current.flyStarted = true;
        animRef.current.phaseLocked = false;
        animRef.current.startRotX = groupRef.current.rotation.x;
        let y = groupRef.current.rotation.y % (Math.PI * 2);
        if (y > Math.PI) y -= Math.PI * 2;
        if (y < -Math.PI) y += Math.PI * 2;
        animRef.current.startRotY = y;
        groupRef.current.rotation.y = y;
        animRef.current.progress = 0;
      }

      // Longer slowdown / zoom-in (~4.5s)
      animRef.current.progress = Math.min(animRef.current.progress + delta * 0.22, 1);
      const p = easeInOutCubic(animRef.current.progress);

      groupRef.current.rotation.x = animRef.current.startRotX * (1 - p);
      groupRef.current.rotation.y = animRef.current.startRotY * (1 - p);

      const dist = baseCam - p * (baseCam - endCam);
      const camPos = new THREE.Vector3().lerpVectors(startPos, endPos, p).normalize().multiplyScalar(dist);
      camera.position.copy(camPos);
      camera.lookAt(0, 0, 0);
      
      if (animRef.current.progress >= 1 && !animRef.current.phaseLocked) {
        animRef.current.phaseLocked = true;
        groupRef.current.rotation.set(0, 0, 0);
        onPhaseChange("arrived");
      }
    }
    
    if (phase === "arrived") {
      groupRef.current.rotation.set(0, 0, 0);
      const camPos = endPos.clone().normalize().multiplyScalar(endCam);
      camera.position.lerp(camPos, 0.12);
      camera.lookAt(0, 0, 0);
    }

    if (markerRef.current && phase === "arrived") {
      const flicker = Math.sin(t * 15) * 0.3 + 0.7 + Math.sin(t * 23) * 0.2;
      markerRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
          child.material.opacity = i === 0 ? Math.min(1, flicker + 0.3) : flicker * 0.5;
        }
      });
      const pulse = Math.sin(t * 8) * 0.15 + 1;
      markerRef.current.scale.setScalar(pulse);
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.scale.setScalar(Math.sin(t * 2) * 0.01 + 1.02);
    }
  });

  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { tex: { value: earthTex } },
    vertexShader: `varying vec2 vUv; varying vec3 vN, vP;
      void main() { vUv=uv; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); vP=-mv.xyz; gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform sampler2D tex; varying vec2 vUv; varying vec3 vN, vP;
      void main() {
        vec4 c=texture2D(tex,vUv); float g=dot(c.rgb,vec3(.3,.6,.1)); float land=smoothstep(.1,.4,g);
        vec3 grn=vec3(0,1,.25), dk=vec3(.02,.05,.08);
        vec3 base=mix(dk,vec3(g*.7)+grn*g*.4,land);
        float fr=pow(1.-abs(dot(vN,normalize(vP))),2.);
        float gx=smoothstep(.97,1.,fract(vUv.x*36.)), gy=smoothstep(.97,1.,fract(vUv.y*18.));
        gl_FragColor=vec4((base+grn*fr*.6+grn*max(gx,gy)*.15)*1.3,1.);
      }`,
  }), [earthTex]);

  return (
    <group ref={groupRef}>
      <mesh material={mat}><sphereGeometry args={[1, 64, 64]} /></mesh>
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[1.06, 64, 64]} />
        <shaderMaterial transparent side={THREE.BackSide} depthWrite={false}
          uniforms={{ col: { value: new THREE.Color(0x00ff41) } }}
          vertexShader="varying vec3 vN; void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}"
          fragmentShader="uniform vec3 col; varying vec3 vN; void main(){float i=pow(.6-dot(vN,vec3(0,0,1)),2.);gl_FragColor=vec4(col,i*.5);}" />
      </mesh>
      {phase === "arrived" && (
        <group ref={markerRef} position={markerPos}>
          <mesh><sphereGeometry args={[0.018, 16, 16]} /><meshBasicMaterial color="#ff0040" transparent /></mesh>
          <mesh><sphereGeometry args={[0.03, 16, 16]} /><meshBasicMaterial color="#ff0040" transparent opacity={0.4} /></mesh>
          <mesh><ringGeometry args={[0.035, 0.05, 32]} /><meshBasicMaterial color="#ff0040" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
          <mesh><ringGeometry args={[0.06, 0.075, 32]} /><meshBasicMaterial color="#ff0040" transparent opacity={0.3} side={THREE.DoubleSide} /></mesh>
        </group>
      )}
    </group>
  );
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    c.width = window.innerWidth; c.height = window.innerHeight;
    const chars = "アイウエオカキク01", fs = 11;
    let cols = Math.floor(c.width / fs), drops = Array(cols).fill(0).map(() => Math.random() * -60);
    let id: number;
    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,.04)"; ctx.fillRect(0, 0, c.width, c.height);
      ctx.font = `${fs}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        if (drops[i] < 0) { drops[i]++; continue; }
        ctx.fillStyle = Math.random() > .96 ? "#fff" : "#00ff4125";
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fs, drops[i] * fs);
        if (drops[i] * fs > c.height && Math.random() > .98) drops[i] = Math.random() * -30;
        drops[i]++;
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; cols = Math.floor(c.width / fs); drops = Array(cols).fill(0).map(() => Math.random() * -60); };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, opacity: 0.2 }} />;
}

function playTypeSound() {
  const ctx = initAudio();
  if (!ctx || ctx.state === "suspended") return;
  try {
    const now = ctx.currentTime;
    const sr = ctx.sampleRate;

    // Soft plastic/keyboard "tik" — short filtered noise, low & dull
    const nDur = 0.028;
    const nBuf = ctx.createBuffer(1, Math.floor(sr * nDur), sr);
    const nData = nBuf.getChannelData(0);
    for (let i = 0; i < nData.length; i++) {
      nData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nData.length, 4);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = nBuf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 400;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1200 + Math.random() * 400;
    lp.Q.value = 0.7;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.55, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + nDur);
    noise.connect(hp);
    hp.connect(lp);
    lp.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + nDur);

    // Key bottom-out thud (low, short)
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = "sine";
    thud.frequency.setValueAtTime(90 + Math.random() * 25, now);
    thud.frequency.exponentialRampToValueAtTime(45, now + 0.04);
    thudGain.gain.setValueAtTime(0.22, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    thud.connect(thudGain);
    thudGain.connect(ctx.destination);
    thud.start(now);
    thud.stop(now + 0.055);
  } catch {}
}

function GlitchText({ text }: { text: string }) {
  const [d, setD] = useState(text);
  useEffect(() => {
    const g = "!@#アイウ";
    const iv = setInterval(() => {
      if (Math.random() > .7) {
        let c = 0;
        const fl = setInterval(() => {
          setD(text.split("").map(ch => " :/".includes(ch) ? ch : c < 4 && Math.random() > .5 ? g[Math.floor(Math.random() * g.length)] : ch).join(""));
          if (++c >= 4) { clearInterval(fl); setD(text); }
        }, 50);
      }
    }, 2500);
    return () => clearInterval(iv);
  }, [text]);
  return <span>{d}</span>;
}

function FlickeringQuestionMarks() {
  const [opacities, setOpacities] = useState<number[]>(Array(10).fill(0.3));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOpacities(prev => prev.map(() => 0.25 + Math.random() * 0.75));
    }, 100);
    return () => clearInterval(interval);
  }, []);
  
  // Around the marker, a bit more spread out
  const positions = [
    { top: '32%', left: '36%' }, { top: '34%', left: '62%' },
    { top: '42%', left: '30%' }, { top: '44%', left: '68%' },
    { top: '52%', left: '34%' }, { top: '54%', left: '64%' },
    { top: '28%', left: '50%' }, { top: '60%', left: '48%' },
    { top: '38%', left: '44%' }, { top: '50%', left: '54%' },
  ];
  
  return (
    <>
      {positions.map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: pos.top,
            left: pos.left,
            transform: 'translate(-50%, -50%)',
            color: '#ff0040',
            fontFamily: 'monospace',
            fontSize: `clamp(1.1rem, ${2.5 + (i % 3)}vw, 2rem)`,
            fontWeight: 900,
            textShadow: '0 0 8px #ff0040, 0 0 16px #ff0040',
            opacity: opacities[i],
            zIndex: 5,
            transition: 'opacity 0.1s',
            pointerEvents: 'none',
          }}
        >
          ?
        </div>
      ))}
    </>
  );
}

const BOOT_LINES = [
  "> BOOT SEQUENCE INITIATED...",
  "> LOADING EARTH_TEXTURE.dat",
  "> DESTINATION: UNKNOWN",
  "> STATUS: READY_",
];

export default function GlobeScene() {
  const [phase, setPhase] = useState("waiting");
  const [showReveal, setShowReveal] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [bootCurrent, setBootCurrent] = useState("");
  const [bootTyping, setBootTyping] = useState(false);

  // 4 lines × ~3s — then crossfade into globe
  useEffect(() => {
    if (phase !== "loading") return;

    let cancelled = false;
    let lineIndex = 0;
    let charIndex = 0;
    let timer: ReturnType<typeof setTimeout>;
    const done: string[] = [];
    const LINE_MS = 2500;

    const typeLine = () => {
      if (cancelled) return;
      const line = BOOT_LINES[lineIndex];
      const chars = [...line];
      const charDelay = Math.max(60, Math.floor((LINE_MS - 250) / chars.length));
      charIndex = 0;

      const typeChar = () => {
        if (cancelled) return;
        if (charIndex < chars.length) {
          setBootCurrent(line.slice(0, charIndex + 1));
          setBootTyping(true);
          if (chars[charIndex] !== " ") playTypeSound();
          charIndex++;
          timer = setTimeout(typeChar, charDelay);
        } else {
          done.push(line);
          setBootLines([...done]);
          setBootCurrent("");
          setBootTyping(false);
          lineIndex++;
          if (lineIndex < BOOT_LINES.length) {
            timer = setTimeout(typeLine, 250);
          } else {
            // Crossfade: earth rises from black while boot text fades out
            timer = setTimeout(() => {
              if (!cancelled) setPhase("fading");
            }, 200);
          }
        }
      };

      typeChar();
    };

    timer = setTimeout(typeLine, 150);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [phase]);

  useEffect(() => {
    if (phase !== "fading") return;
    const t = setTimeout(() => setPhase("idle"), 2000);
    return () => clearTimeout(t);
  }, [phase]);

  const handleStartBoot = useCallback(async () => {
    if (phase !== "waiting") return;
    await ensureAudio();
    playTypeSound(); // unlock + confirm audio works
    setBootLines([]);
    setBootCurrent("");
    setPhase("loading");
  }, [phase]);

  const handleTap = useCallback(async () => {
    if (phase !== "idle") return;
    await startSpinSound();
    setPhase("spinning");
  }, [phase]);

  const handlePhaseChange = useCallback((p: string) => {
    setPhase(p);
    // Stop whoosh as soon as the globe starts slowing down
    if (p === "flying") {
      stopSpinSound();
    }
    if (p === "arrived") {
      setTimeout(() => playLockSound(), 80);
      setTimeout(() => setShowReveal(true), 400);
    }
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <MatrixRain />
      <div style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "none", opacity: 0.1, background: "repeating-linear-gradient(0deg,rgba(0,0,0,.15) 0px,rgba(0,0,0,.15) 1px,transparent 1px,transparent 2px)" }} />

      {/* Waiting for tap to start */}
      {phase === "waiting" && (
        <div 
          onClick={handleStartBoot}
          style={{ 
            position: "absolute", inset: 0, zIndex: 50, 
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", 
            background: "#000", cursor: "pointer",
          }}
        >
          <div style={{ 
            color: "#00ff41", 
            fontFamily: "monospace", 
            fontSize: "clamp(1.2rem, 5vw, 2rem)",
            textShadow: "0 0 10px #00ff41, 0 0 20px #00ff41",
            animation: "pulse 1.5s ease-in-out infinite",
          }}>
            {"> TAP TO BEGIN_"}
          </div>
        </div>
      )}

      {/* Boot overlay — fades out while globe becomes visible underneath */}
      {(phase === "loading" || phase === "fading") && (
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: phase === "fading" ? "rgba(0,0,0,0)" : "#000",
          transition: "background 2s ease",
          pointerEvents: phase === "fading" ? "none" : "auto",
        }}>
          <div style={{
            fontFamily: "monospace",
            width: "100%",
            maxWidth: "340px",
            color: "#00ff41",
            fontSize: "clamp(0.75rem, 3vw, 0.95rem)",
            textShadow: "0 0 10px #00ff41",
            lineHeight: 1.6,
            opacity: phase === "fading" ? 0 : 1,
            transition: "opacity 1.8s ease",
          }}>
            {bootLines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
            {(bootTyping || bootCurrent) && (
              <div>
                {bootCurrent}
                {bootTyping && <span style={{ animation: "blink 0.5s infinite" }}>▋</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", paddingTop: "max(env(safe-area-inset-top),1rem)", flexShrink: 0, opacity: phase === "loading" || phase === "waiting" ? 0 : 1, transition: "opacity 2s ease" }}>
        <h1 style={{ fontSize: "clamp(1.4rem,6vw,2.5rem)", fontWeight: 700, fontFamily: "monospace", color: "#00ff41", textShadow: "0 0 10px #00ff41,0 0 25px #00ff41", margin: 0, lineHeight: 1.1 }}>
          <GlitchText text="GO_AWAY_DAY" />
        </h1>
        <h2 style={{ fontSize: "clamp(1.1rem,5vw,2rem)", fontWeight: 700, fontFamily: "monospace", color: "#00ff41", textShadow: "0 0 10px #00ff41", margin: ".1rem 0 .2rem" }}>://2027</h2>
        <p style={{ fontSize: "clamp(.65rem,3vw,.85rem)", color: "#00ff41", opacity: .6, fontFamily: "monospace", margin: 0 }}>{">>"} ERIK & BENNO</p>
      </div>

      {/* Globe — fades in from black as boot text fades out */}
      <div
        style={{
          flex: 1,
          position: "relative",
          minHeight: 0,
          opacity: phase === "waiting" || phase === "loading" ? 0 : 1,
          transition: "opacity 2s ease",
        }}
        onClick={handleTap}
      >
        <Canvas camera={{ position: [0, 0, 4], fov: 50 }} style={{ position: "absolute", inset: 0, cursor: phase === "idle" ? "pointer" : "default" }} gl={{ antialias: true }}>
          <color attach="background" args={["#000"]} />
          <ambientLight intensity={0.15} />
          <Globe phase={phase} onPhaseChange={handlePhaseChange} />
          <Stars radius={50} depth={25} count={300} factor={1.5} fade speed={0.2} />
        </Canvas>
        {phase === "arrived" && showReveal && <FlickeringQuestionMarks />}
      </div>

      {/* TAP TO START - onder de globe */}
      {phase === "idle" && (
        <div 
          onClick={handleTap}
          style={{ 
            position: "relative", zIndex: 10, textAlign: "center", 
            paddingBottom: "max(env(safe-area-inset-bottom),2rem)", paddingTop: "0.5rem",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          <div style={{
            color: "#00ff41", fontSize: "clamp(1rem,4vw,1.3rem)", fontFamily: "monospace",
            textShadow: "0 0 10px #00ff41,0 0 20px #00ff41",
            animation: "pulse 1.5s ease-in-out infinite",
          }}>
            {"> TAP TO START_"}
          </div>
        </div>
      )}

      {/* Reveal */}
      {phase === "arrived" && (
        <div style={{
          position: "relative", zIndex: 10, textAlign: "center",
          paddingBottom: "max(env(safe-area-inset-bottom),1.5rem)", paddingTop: "0.5rem",
          opacity: showReveal ? 1 : 0, transition: "opacity .6s", flexShrink: 0,
        }}>
          <div style={{ fontSize: "clamp(.6rem,2.5vw,.8rem)", color: "#00ff41", letterSpacing: ".3em", fontFamily: "monospace", marginBottom: ".3rem", textShadow: "0 0 8px #00ff41" }}>
            {">>"} COORDINATES_LOCKED
          </div>
          <div style={{ fontSize: "clamp(1.4rem,7vw,2.5rem)", fontWeight: 900, fontFamily: "monospace", color: "#ff0040", textShadow: "0 0 15px #ff0040,0 0 30px #ff0040,0 0 45px #ff0040", lineHeight: 1.1, animation: "glow 2s infinite" }}>
            <GlitchText text="DESTINATION UNKNOWN" />
          </div>
          
          {/* Back to 2026 button */}
          <a 
            href="/"
            style={{
              display: "inline-block",
              marginTop: "1.5rem",
              padding: "0.6rem 1.2rem",
              background: "rgba(0, 255, 65, 0.1)",
              border: "1px solid #00ff41",
              borderRadius: "4px",
              color: "#00ff41",
              fontFamily: "monospace",
              fontSize: "clamp(0.7rem, 2.5vw, 0.9rem)",
              textDecoration: "none",
              textShadow: "0 0 8px #00ff41",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {"<"} BACK TO 2026
          </a>
        </div>
      )}

      {/* Corners */}
      <div style={{ position: "fixed", top: "max(env(safe-area-inset-top),.4rem)", left: ".5rem", color: "#00ff41", fontFamily: "monospace", fontSize: "clamp(.5rem,2vw,.6rem)", opacity: .3, zIndex: 10 }}>v2.027</div>
      <div style={{ position: "fixed", top: "max(env(safe-area-inset-top),.4rem)", right: ".5rem", color: "#00ff41", fontFamily: "monospace", fontSize: "clamp(.5rem,2vw,.6rem)", opacity: .3, zIndex: 10 }}>{new Date().toLocaleDateString("nl-NL")}</div>

      <style jsx global>{`
        @keyframes pulse { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.02)} }
        @keyframes glow { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.2)} }
        @keyframes blink { 0%,50%{opacity:1} 51%,100%{opacity:0} }
        @keyframes fadeSlide { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        *{-webkit-tap-highlight-color:transparent}
        html,body{overflow:hidden;margin:0;padding:0}
      `}</style>
    </div>
  );
}
