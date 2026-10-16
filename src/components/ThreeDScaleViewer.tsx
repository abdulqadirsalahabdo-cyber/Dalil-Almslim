import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sound } from '../audio/synth.js';
import { RotateCw, Sparkles, Scale, Maximize2, Volume2, VolumeX, Eye } from 'lucide-react';

export const ThreeDScaleViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [balanceTilt, setBalanceTilt] = useState<number>(0); // -1 left, +1 right
  const [leftWeight, setLeftWeight] = useState<number>(2);
  const [rightWeight, setRightWeight] = useState<number>(2);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  // Three.js object references for animation loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const beamGroupRef = useRef<THREE.Group | null>(null);
  const leftPanGroupRef = useRef<THREE.Group | null>(null);
  const rightPanGroupRef = useRef<THREE.Group | null>(null);
  const targetTiltRef = useRef<number>(0);
  const currentTiltRef = useRef<number>(0);
  const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: 0.8,
    phi: 0.35,
    radius: 7.5,
  });
  const isDraggingRef = useRef<boolean>(false);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 550;

    // 1. Scene & Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x061510);
    scene.fog = new THREE.FogExp2(0x061510, 0.04);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 7.5);
    cameraRef.current = camera;

    // 3. Renderer with ACESFilmicToneMapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Procedural Textures (Bump & Roughness)
    const createProceduralMetalCanvas = () => {
      const cvs = document.createElement('canvas');
      cvs.width = 256;
      cvs.height = 256;
      const ctx = cvs.getContext('2d')!;
      ctx.fillStyle = '#b8923a';
      ctx.fillRect(0, 0, 256, 256);
      // subtle noise
      for (let i = 0; i < 4000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const c = Math.floor(Math.random() * 30);
        ctx.fillStyle = `rgba(${180 + c}, ${140 + c}, ${50 + c}, 0.15)`;
        ctx.fillRect(x, y, 2, 2);
      }
      return new THREE.CanvasTexture(cvs);
    };
    const metalTexture = createProceduralMetalCanvas();
    metalTexture.wrapS = THREE.RepeatWrapping;
    metalTexture.wrapT = THREE.RepeatWrapping;

    // 5. Shared PBR Materials
    const goldPBR = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.88,
      roughness: 0.22,
      bumpMap: metalTexture,
      bumpScale: 0.02,
    });

    const polishedBrass = new THREE.MeshStandardMaterial({
      color: 0xdfb75c,
      metalness: 0.92,
      roughness: 0.16,
    });

    const walnutWood = new THREE.MeshStandardMaterial({
      color: 0x22130c,
      metalness: 0.1,
      roughness: 0.65,
    });

    const darkEmeraldMarble = new THREE.MeshStandardMaterial({
      color: 0x07281c,
      metalness: 0.25,
      roughness: 0.18,
    });

    const glowingTruthGem = new THREE.MeshStandardMaterial({
      color: 0x38ef7d,
      emissive: 0x11998e,
      emissiveIntensity: 0.6,
      metalness: 0.2,
      roughness: 0.1,
    });

    // 6. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xdcf8e8, 0.4);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xfff4db, 0x061f15, 0.6);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff0cc, 1.8);
    keyLight.position.set(5, 10, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x38ef7d, 2.5, 10);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // 7. Ground & Contact Shadow Platter
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x05130d,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    // 8. Composite 3D Scale Construction (THREE.Group with 12 distinct parts)
    const scaleRoot = new THREE.Group();
    scene.add(scaleRoot);

    // Part 1: Stepped Octagonal Marble Pedestal Base
    const baseGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.25, 8);
    const base = new THREE.Mesh(baseGeo, darkEmeraldMarble);
    base.position.y = 0.125;
    base.castShadow = true;
    base.receiveShadow = true;
    scaleRoot.add(base);

    // Part 2: Ornate Walnut Ring Collar
    const collarGeo = new THREE.CylinderGeometry(1.3, 1.5, 0.15, 32);
    const collar = new THREE.Mesh(collarGeo, walnutWood);
    collar.position.y = 0.325;
    collar.castShadow = true;
    scaleRoot.add(collar);

    // Part 3: Polished Brass Lower Footing
    const brassFootGeo = new THREE.CylinderGeometry(0.5, 0.9, 0.4, 32);
    const brassFoot = new THREE.Mesh(brassFootGeo, goldPBR);
    brassFoot.position.y = 0.6;
    brassFoot.castShadow = true;
    scaleRoot.add(brassFoot);

    // Part 4: Main Fluted Center Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.18, 0.24, 3.2, 24);
    const pillar = new THREE.Mesh(pillarGeo, polishedBrass);
    pillar.position.y = 2.4;
    pillar.castShadow = true;
    scaleRoot.add(pillar);

    // Part 5: Decorative Rings on Pillar
    for (let r = 0; r < 3; r++) {
      const ringGeo = new THREE.TorusGeometry(0.24, 0.05, 12, 32);
      const ring = new THREE.Mesh(ringGeo, goldPBR);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 1.3 + r * 0.9;
      ring.castShadow = true;
      scaleRoot.add(ring);
    }

    // Part 6: Top Fulcrum Mount & Islamic Star Crescent Finial
    const fulcrumMountGeo = new THREE.SphereGeometry(0.35, 24, 24);
    const fulcrumMount = new THREE.Mesh(fulcrumMountGeo, goldPBR);
    fulcrumMount.position.y = 4.0;
    fulcrumMount.castShadow = true;
    scaleRoot.add(fulcrumMount);

    const finialTipGeo = new THREE.ConeGeometry(0.12, 0.6, 16);
    const finialTip = new THREE.Mesh(finialTipGeo, goldPBR);
    finialTip.position.y = 4.5;
    scaleRoot.add(finialTip);

    // Part 7: Balancing Beam Group (tilts around Z axis at y=4.0)
    const beamGroup = new THREE.Group();
    beamGroup.position.set(0, 4.0, 0);
    scaleRoot.add(beamGroup);
    beamGroupRef.current = beamGroup;

    // Horizontal Beam Bar (Length 4.6)
    const beamBarGeo = new THREE.BoxGeometry(4.8, 0.12, 0.16);
    const beamBar = new THREE.Mesh(beamBarGeo, goldPBR);
    beamBar.castShadow = true;
    beamGroup.add(beamBar);

    // Center Pointer Needle (points downwards toward angle graduation)
    const pointerGeo = new THREE.ConeGeometry(0.06, 0.8, 12);
    const pointer = new THREE.Mesh(pointerGeo, goldPBR);
    pointer.rotation.z = Math.PI;
    pointer.position.y = -0.4;
    beamGroup.add(pointer);

    // Beam End Hooks & Ornate Finials
    const leftHook = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 12, 16), polishedBrass);
    leftHook.position.set(-2.3, 0, 0);
    beamGroup.add(leftHook);

    const rightHook = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 12, 16), polishedBrass);
    rightHook.position.set(2.3, 0, 0);
    beamGroup.add(rightHook);

    // Part 8 & 9: Left & Right Pans Groups
    const createPanAssembly = (isLeft: boolean) => {
      const panGroup = new THREE.Group();
      panGroup.position.set(isLeft ? -2.3 : 2.3, -1.8, 0);

      // 3 Suspension Chains
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const rad = 0.85;
        const bottomX = Math.cos(angle) * rad;
        const bottomZ = Math.sin(angle) * rad;

        const curve = new THREE.LineCurve3(
          new THREE.Vector3(0, 1.8, 0),
          new THREE.Vector3(bottomX, 0, bottomZ)
        );
        const chainGeo = new THREE.TubeGeometry(curve, 10, 0.02, 6, false);
        const chain = new THREE.Mesh(chainGeo, goldPBR);
        panGroup.add(chain);
      }

      // Shallow Bowl Pan
      const panBowlGeo = new THREE.SphereGeometry(0.95, 32, 16, 0, Math.PI * 2, Math.PI * 0.65, Math.PI * 0.35);
      const panBowl = new THREE.Mesh(panBowlGeo, polishedBrass);
      panBowl.rotation.x = Math.PI;
      panBowl.castShadow = true;
      panBowl.receiveShadow = true;
      panGroup.add(panBowl);

      // Pan weight indicator gem/scroll
      const gem = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3), glowingTruthGem);
      gem.position.y = 0.15;
      gem.castShadow = true;
      panGroup.add(gem);

      return panGroup;
    };

    const leftPanGroup = createPanAssembly(true);
    beamGroup.add(leftPanGroup);
    leftPanGroupRef.current = leftPanGroup;

    const rightPanGroup = createPanAssembly(false);
    beamGroup.add(rightPanGroup);
    rightPanGroupRef.current = rightPanGroup;

    // Golden Floating Dust Particles (Surrounding the Mizan)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount; p++) {
      particlePositions[p * 3] = (Math.random() - 0.5) * 8;
      particlePositions[p * 3 + 1] = Math.random() * 6;
      particlePositions[p * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 9. Input & Damped Orbit Controls
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - mousePosRef.current.x;
      const dy = e.clientY - mousePosRef.current.y;
      mousePosRef.current = { x: e.clientX, y: e.clientY };

      cameraAngleRef.current.theta -= dx * 0.008;
      cameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.3, cameraAngleRef.current.phi + dy * 0.008));
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 10. Animation Loop (60fps with exponential damping)
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      // Auto-rotation when not dragging
      if (isAutoRotate && !isDraggingRef.current) {
        cameraAngleRef.current.theta += 0.25 * dt;
      }

      // Smooth camera position from spherical coordinates
      const targetX = cameraAngleRef.current.radius * Math.sin(cameraAngleRef.current.phi) * Math.sin(cameraAngleRef.current.theta);
      const targetY = cameraAngleRef.current.radius * Math.cos(cameraAngleRef.current.phi) + 1.2;
      const targetZ = cameraAngleRef.current.radius * Math.sin(cameraAngleRef.current.phi) * Math.cos(cameraAngleRef.current.theta);

      camera.position.x += (targetX - camera.position.x) * (1 - Math.exp(-6 * dt));
      camera.position.y += (targetY - camera.position.y) * (1 - Math.exp(-6 * dt));
      camera.position.z += (targetZ - camera.position.z) * (1 - Math.exp(-6 * dt));
      camera.lookAt(0, 2.5, 0);

      // Scale Beam Tilt Physics
      currentTiltRef.current += (targetTiltRef.current - currentTiltRef.current) * (1 - Math.exp(-5 * dt));
      if (beamGroupRef.current) {
        beamGroupRef.current.rotation.z = currentTiltRef.current;
        // Keep pans vertically oriented (counter-rotate pans against beam)
        if (leftPanGroupRef.current) {
          leftPanGroupRef.current.rotation.z = -currentTiltRef.current;
        }
        if (rightPanGroupRef.current) {
          rightPanGroupRef.current.rotation.z = -currentTiltRef.current;
        }
      }

      // Subtle particle float
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += 0.15 * dt;
        if (positions[i] > 6) positions[i] = 0;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight || 550;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, []);

  // Update target tilt based on weights
  useEffect(() => {
    const diff = rightWeight - leftWeight; // positive tilts right
    const maxTilt = 0.28; // ~16 degrees
    const calculatedTilt = Math.max(-maxTilt, Math.min(maxTilt, diff * 0.08));
    targetTiltRef.current = calculatedTilt;
    setBalanceTilt(calculatedTilt);
  }, [leftWeight, rightWeight]);

  const addLeftWeight = () => {
    setLeftWeight((w) => Math.min(w + 1, 6));
    sound.playAuthenticChime();
  };

  const addRightWeight = () => {
    setRightWeight((w) => Math.min(w + 1, 6));
    sound.playRejectGong();
  };

  const resetBalance = () => {
    setLeftWeight(2);
    setRightWeight(2);
    sound.playVictoryFanfare();
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-amber-500/40 shadow-2xl bg-[#061510]">
      {/* 3D Canvas Mount */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Low-Occlusion Control Dock */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className="bg-[#081c14]/90 border border-amber-500/30 rounded-xl p-3 shadow-xl text-xs space-y-2 max-w-xs text-right">
          <div className="flex items-center justify-between pb-1.5 border-b border-amber-900/40">
            <span className="font-bold text-amber-300 font-cairo flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-400" />
              ميزان الحقيقة والعدل (3D)
            </span>
            <button
              onClick={toggleSound}
              className="p-1 rounded text-stone-400 hover:text-stone-200 transition-colors"
              title={isMuted ? 'تشغيل المؤثرات الصوتية' : 'كتم الصوت'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

          <p className="text-stone-300 text-[11px] leading-relaxed">
            مجسم ثلاثي الأبعاد مركب من النحاس والرخام الزمردي وخشب الجوز لميزان المعرفة والتدقيق.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
            <div className="p-2 rounded bg-stone-900/80 border border-emerald-900/50 text-center">
              <span className="text-emerald-400 font-bold block">كفة الحق والأدلة</span>
              <span className="text-stone-200 font-mono text-sm">{leftWeight}</span>
              <button
                onClick={addLeftWeight}
                className="mt-1 w-full py-0.5 bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 rounded font-semibold text-[10px]"
              >
                + إضافة دليل
              </button>
            </div>

            <div className="p-2 rounded bg-stone-900/80 border border-rose-900/50 text-center">
              <span className="text-rose-400 font-bold block">كفة الشبهات والضعاف</span>
              <span className="text-stone-200 font-mono text-sm">{rightWeight}</span>
              <button
                onClick={addRightWeight}
                className="mt-1 w-full py-0.5 bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 rounded font-semibold text-[10px]"
              >
                + إضافة شبهة
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={resetBalance}
              className="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600/40 border border-amber-500/40 text-amber-300 rounded text-[11px] font-semibold"
            >
              ⚖️ موازنة الكفتين
            </button>
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              className={`p-1.5 rounded border text-[11px] ${isAutoRotate ? 'border-amber-500 text-amber-300 bg-amber-950/40' : 'border-stone-700 text-stone-400'}`}
              title="دوران تلقائي"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Viewport Control Hint Line */}
      <div className="absolute bottom-4 inset-x-0 pointer-events-none flex justify-center">
        <span className="bg-[#05140e]/80 border border-stone-800 text-stone-400 text-[11px] px-3.5 py-1 rounded-full font-cairo shadow-lg">
          اسحب بالماوس للتدوير حول الميزان من جميع الزوايا · إضاءة PBR ورخام زمردي ونحاس مصقول
        </span>
      </div>
    </div>
  );
};
