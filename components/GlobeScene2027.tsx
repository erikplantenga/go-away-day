"use client";

import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";

const START = { lat: 52.3676, lng: 4.9041, name: "Amsterdam" };
const DESTINATION = { lat: 47.3769, lng: 8.5417, name: "???" }; // Zürich - midden in Zwitserland, 100% op land

let audioCtx: AudioContext | null = null;

function initAudio() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

async function playSpinSound() {
  const ctx = initAudio();
  if (!ctx) return;
  
  // Resume context for iOS
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  
  try {
    const duration = 3.0;
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainMain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(50, now);
    osc1.frequency.exponentialRampToValueAtTime(250, now + 1.5);
    osc1.frequency.exponentialRampToValueAtTime(120, now + duration);
    
    osc2.type = "sawtooth";
    osc2.frequency.setValueAtTime(25, now);
    osc2.frequency.exponentialRampToValueAtTime(120, now + 1.5);
    osc2.frequency.exponentialRampToValueAtTime(60, now + duration);
    
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(80, now);
    filter.frequency.exponentialRampToValueAtTime(2500, now + 1.2);
    filter.frequency.exponentialRampToValueAtTime(400, now + duration);
    filter.Q.value = 10;
    
    gainMain.gain.setValueAtTime(0, now);
    gainMain.gain.linearRampToValueAtTime(0.4, now + 0.2);
    gainMain.gain.linearRampToValueAtTime(0.5, now + 1.2);
    gainMain.gain.linearRampToValueAtTime(0.15, now + duration - 0.3);
    gainMain.gain.linearRampToValueAtTime(0, now + duration);
    
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainMain);
    gainMain.connect(ctx.destination);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  } catch (e) {
    console.error("Sound error:", e);
  }
}

async function playLockSound() {
  const ctx = initAudio();
  if (!ctx) return;
  
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  
  try {
    const now = ctx.currentTime;
    // 3 beeps
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 500 + i * 250;
      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.12 + 0.02);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.12 + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.12);
    }
    // Final lock tone
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
  const meshRef = useRef<THREE.Mesh>(null);
  const markerRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const startPos = useMemo(() => latLngToVector3(START.lat, START.lng, 5), []);
  const endPos = useMemo(() => latLngToVector3(DESTINATION.lat, DESTINATION.lng, 5), []);
  const { camera, size } = useThree();
  const animRef = useRef({ progress: 0, spinSpeed: 0.002, rotX: 0, rotY: 0 });
  const isPortrait = size.height > size.width;
  const baseCam = isPortrait ? 3.6 : 2.8;
  const endCam = isPortrait ? 1.6 : 1.3;

  const earthTex = useLoader(TextureLoader, "https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg");
  
  useEffect(() => { if (earthTex) earthTex.colorSpace = THREE.SRGBColorSpace; }, [earthTex]);
  useEffect(() => {
    camera.position.copy(startPos.clone().normalize().multiplyScalar(baseCam));
    camera.lookAt(0, 0, 0);
  }, [camera, startPos, baseCam]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    if (phase === "idle") {
      meshRef.current.rotation.y += 0.002;
    }
    
    if (phase === "spinning") {
      // Multi-axis rotation - speed up
      animRef.current.spinSpeed = Math.min(animRef.current.spinSpeed + delta * 0.025, 0.18);
      animRef.current.rotX = Math.sin(t * 2) * 0.3;
      meshRef.current.rotation.y += animRef.current.spinSpeed;
      meshRef.current.rotation.x = animRef.current.rotX;
      
      if (animRef.current.spinSpeed >= 0.18) {
        setTimeout(() => onPhaseChange("flying"), 150);
      }
    }
    
    if (phase === "flying") {
      animRef.current.progress = Math.min(animRef.current.progress + delta * 0.4, 1);
      const p = easeInOutCubic(animRef.current.progress);
      
      // Smoothly return X rotation to 0
      meshRef.current.rotation.x *= 0.95;
      
      // Slow down Y rotation
      meshRef.current.rotation.y += 0.05 * (1 - p);
      
      // Camera flies to destination
      const camPos = new THREE.Vector3().lerpVectors(startPos, endPos, p).normalize().multiplyScalar(baseCam - p * (baseCam - endCam));
      camera.position.lerp(camPos, 0.06);
      camera.lookAt(0, 0, 0);
      
      if (animRef.current.progress >= 1) {
        onPhaseChange("arrived");
      }
    }
    
    if (phase === "arrived") {
      // Globe staat stil - geen rotatie meer
      meshRef.current.rotation.x *= 0.98; // Smooth to 0
    }

    // Marker flicker effect
    if (markerRef.current && phase === "arrived") {
      const flicker = Math.sin(t * 15) * 0.3 + 0.7 + Math.sin(t * 23) * 0.2;
      markerRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
          if (i === 0) {
            child.material.opacity = Math.min(1, flicker + 0.3);
          } else {
            child.material.opacity = flicker * 0.5;
          }
        }
      });
      // Pulse scale
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
    <group>
      <mesh ref={meshRef} material={mat}><sphereGeometry args={[1, 64, 64]} /></mesh>
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[1.06, 64, 64]} />
        <shaderMaterial transparent side={THREE.BackSide} depthWrite={false}
          uniforms={{ col: { value: new THREE.Color(0x00ff41) } }}
          vertexShader="varying vec3 vN; void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}"
          fragmentShader="uniform vec3 col; varying vec3 vN; void main(){float i=pow(.6-dot(vN,vec3(0,0,1)),2.);gl_FragColor=vec4(col,i*.5);}" />
      </mesh>
      {phase === "arrived" && (
        <group ref={markerRef} position={endPos.clone().normalize().multiplyScalar(1.01)}>
          {/* Core dot */}
          <mesh><sphereGeometry args={[0.018, 16, 16]} /><meshBasicMaterial color="#ff0040" transparent /></mesh>
          {/* Glow ring 1 */}
          <mesh><sphereGeometry args={[0.03, 16, 16]} /><meshBasicMaterial color="#ff0040" transparent opacity={0.4} /></mesh>
          {/* Glow ring 2 */}
          <mesh><ringGeometry args={[0.035, 0.05, 32]} /><meshBasicMaterial color="#ff0040" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
          {/* Outer pulse ring */}
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

export default function GlobeScene() {
  const [phase, setPhase] = useState("loading");
  const [showReveal, setShowReveal] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);

  // Boot sequence met opsomming
  useEffect(() => {
    const lines = [
      "> INITIALIZING SYSTEM...",
      "> LOADING TRAVEL_MATRIX.exe",
      "> DECRYPTING COORDINATES...",
      "> DESTINATION: [CLASSIFIED]",
      "> SUBJECTS: ERIK, BENNO",
      "> STATUS: READY_",
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setBootLines(prev => [...prev, lines[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase("idle"), 600);
      }
    }, 180);
    return () => clearInterval(interval);
  }, []);

  const handleTap = useCallback(() => {
    if (phase !== "idle") return;
    initAudio();
    playSpinSound();
    setPhase("spinning");
  }, [phase]);

  const handlePhaseChange = useCallback((p: string) => {
    setPhase(p);
    if (p === "arrived") {
      setTimeout(() => playLockSound(), 100);
      setTimeout(() => setShowReveal(true), 400);
    }
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <MatrixRain />
      <div style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "none", opacity: 0.1, background: "repeating-linear-gradient(0deg,rgba(0,0,0,.15) 0px,rgba(0,0,0,.15) 1px,transparent 1px,transparent 2px)" }} />

      {/* Loading - boot sequence */}
      {phase === "loading" && (
        <div style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "#000", padding: "2rem" }}>
          <div style={{ fontFamily: "monospace", width: "100%", maxWidth: "320px" }}>
            {bootLines.map((line, i) => (
              <div key={i} style={{ 
                color: "#00ff41", 
                fontSize: "clamp(0.75rem, 3vw, 0.95rem)", 
                marginBottom: "0.4rem",
                textShadow: "0 0 10px #00ff41",
                animation: "fadeSlide 0.2s ease-out",
              }}>{line}</div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", paddingTop: "max(env(safe-area-inset-top),1rem)", flexShrink: 0, opacity: phase === "loading" ? 0 : 1, transition: "opacity .5s" }}>
        <h1 style={{ fontSize: "clamp(1.4rem,6vw,2.5rem)", fontWeight: 700, fontFamily: "monospace", color: "#00ff41", textShadow: "0 0 10px #00ff41,0 0 25px #00ff41", margin: 0, lineHeight: 1.1 }}>
          <GlitchText text="GO_AWAY_DAY" />
        </h1>
        <h2 style={{ fontSize: "clamp(1.1rem,5vw,2rem)", fontWeight: 700, fontFamily: "monospace", color: "#00ff41", textShadow: "0 0 10px #00ff41", margin: ".1rem 0 .2rem" }}>://2027</h2>
        <p style={{ fontSize: "clamp(.65rem,3vw,.85rem)", color: "#00ff41", opacity: .6, fontFamily: "monospace", margin: 0 }}>{">>"} ERIK & BENNO</p>
      </div>

      {/* Globe */}
      <div style={{ flex: 1, position: "relative", minHeight: 0 }} onClick={handleTap}>
        <Canvas camera={{ position: [0, 0, 4], fov: 50 }} style={{ position: "absolute", inset: 0, cursor: phase === "idle" ? "pointer" : "default" }} gl={{ antialias: true }}>
          <color attach="background" args={["#000"]} />
          <ambientLight intensity={0.15} />
          <Globe phase={phase} onPhaseChange={handlePhaseChange} />
          <Stars radius={50} depth={25} count={300} factor={1.5} fade speed={0.2} />
        </Canvas>
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
            {">>"} DESTINATION_LOCKED
          </div>
          <div style={{ fontSize: "clamp(2.5rem,15vw,5rem)", fontWeight: 900, fontFamily: "monospace", color: "#00ff41", textShadow: "0 0 15px #00ff41,0 0 30px #00ff41,0 0 45px #00ff41", lineHeight: 1, animation: "glow 2s infinite" }}>
            <GlitchText text="???" />
          </div>
          <div style={{ marginTop: ".4rem", fontSize: "clamp(.6rem,2.5vw,.8rem)", color: "#ff0040", fontFamily: "monospace", textShadow: "0 0 8px #ff0040", animation: "blink 1s infinite" }}>
            [CLASSIFIED]
          </div>
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
