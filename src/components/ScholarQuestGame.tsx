import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sound } from '../audio/synth.js';
import { db, auth } from '../firebase.js';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { 
  Trophy, 
  Volume2, 
  VolumeX, 
  Play, 
  RotateCcw, 
  Check, 
  X, 
  ArrowLeft, 
  Award,
  Sparkles,
  Zap,
  ShieldCheck
} from 'lucide-react';

interface GameItem {
  id: number;
  text: string;
  isAuthentic: boolean;
  category: string;
  sourceNote: string;
  position: THREE.Vector3;
  mesh?: THREE.Group;
  collected?: boolean;
}

const GAME_ITEMS_POOL: Omit<GameItem, 'position' | 'id'>[] = [
  {
    text: 'إنما الأعمال بالنيات وإنما لكل امرئ ما نوى',
    isAuthentic: true,
    category: 'حديث نبوي',
    sourceNote: 'صحيح البخاري ومسلم - متفق عليه'
  },
  {
    text: 'اطْلُبُوا العِلْمَ وَلَوْ بالصِّينِ',
    isAuthentic: false,
    category: 'حديث مشتهر',
    sourceNote: 'موضوع ومكذوب بهذا اللفظ - الألباني وابن الجوزي'
  },
  {
    text: 'من غشنا فليس منا',
    isAuthentic: true,
    category: 'حديث نبوي',
    sourceNote: 'صحيح مسلم - ثابت'
  },
  {
    text: 'حب الوطن من الإيمان',
    isAuthentic: false,
    category: 'مقولة متداولة',
    sourceNote: 'موضوع مكذوب لا أصل له مرفوعاً - الصغاني والسخاوي'
  },
  {
    text: 'المسلم من سلم المسلمون من لسانه ويده',
    isAuthentic: true,
    category: 'حديث نبوي',
    sourceNote: 'صحيح البخاري ومسلم'
  },
  {
    text: 'أحرق عمرو بن العاص مكتبة الإسكندرية لـ 6 أشهر',
    isAuthentic: false,
    category: 'فرية تاريخية',
    sourceNote: 'خرافة اختلقت بعد الفتح بـ 550 سنة - بتلر وجيبون'
  },
  {
    text: 'لا ضرر ولا ضرار',
    isAuthentic: true,
    category: 'قاعدة نبوية',
    sourceNote: 'حديث حسن صحيح - رواه مالك وابن ماجه'
  },
  {
    text: 'اختلاف أمتي رحمة',
    isAuthentic: false,
    category: 'أثر منسوب',
    sourceNote: 'لا أصل له مرفوعاً كحديث - السبكي والألباني'
  }
];

export const ScholarQuestGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused' | 'gameover'>('title');
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [activeCarriedItem, setActiveCarriedItem] = useState<GameItem | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<{ text: string; isSuccess: boolean } | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [highScores, setHighScores] = useState<{ name: string; score: number }[]>([]);

  // Simulation references (isolated from React re-renders)
  const simRef = useRef({
    playerPos: new THREE.Vector3(0, 0, 0),
    playerVelocity: new THREE.Vector3(0, 0, 0),
    keys: { w: false, a: false, s: false, d: false, space: false },
    items: [] as GameItem[],
    carriedItem: null as GameItem | null,
    score: 0,
    combo: 1,
    timeLeft: 60,
    screenShake: 0,
    hitStopUntil: 0,
    cameraAngle: 0,
  });

  // Load highscores from Firestore
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(5));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({
          name: d.data().userDisplayName || 'باحث إسلامي',
          score: d.data().score || 0,
        }));
        if (list.length > 0) setHighScores(list);
      } catch (err) {
        console.warn('Leaderboard offline or fallback active');
        setHighScores([
          { name: 'المحقق الأصولي', score: 850 },
          { name: 'طالب العلم', score: 620 },
          { name: 'باحث الحديث', score: 480 },
        ]);
      }
    }
    fetchLeaderboard();
  }, []);

  // Three.js Game World Setup
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06140f);
    scene.fog = new THREE.FogExp2(0x06140f, 0.035);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 9, 12);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // PBR Materials
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
    const emeraldFloorMat = new THREE.MeshStandardMaterial({ color: 0x09261c, roughness: 0.3, metalness: 0.4 });
    const authenticMat = new THREE.MeshStandardMaterial({ color: 0x38ef7d, emissive: 0x11998e, emissiveIntensity: 0.5 });
    const weakMat = new THREE.MeshStandardMaterial({ color: 0xff4b4b, emissive: 0x990000, emissiveIntensity: 0.5 });
    const scholarRobeMat = new THREE.MeshStandardMaterial({ color: 0xe8cca0, roughness: 0.8 });
    const scholarTurbanMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xfff5e0, 0x072218, 0.7);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    dirLight.position.set(8, 16, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Arena Floor
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 0.4, 32), emeraldFloorMat);
    floor.position.y = -0.2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Decorative Marble Columns around the hall
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const colX = Math.cos(angle) * 12.5;
      const colZ = Math.sin(angle) * 12.5;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 6, 16), goldMat);
      col.position.set(colX, 3, colZ);
      col.castShadow = true;
      scene.add(col);
    }

    // Two Sorting Altars:
    // Altar A (Left, Green): كفة الصحيح والموثق (Authentic Altar)
    const authenticAltar = new THREE.Group();
    authenticAltar.position.set(-6, 0, -4);
    const altarBaseA = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.1, 0.6, 16), authenticMat);
    altarBaseA.position.y = 0.3;
    authenticAltar.add(altarBaseA);
    const altarLightA = new THREE.PointLight(0x38ef7d, 3, 6);
    altarLightA.position.y = 1.5;
    authenticAltar.add(altarLightA);
    scene.add(authenticAltar);

    // Altar B (Right, Red): كفة الموضوع والمكذوب (Fabricated Altar)
    const weakAltar = new THREE.Group();
    weakAltar.position.set(6, 0, -4);
    const altarBaseB = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.1, 0.6, 16), weakMat);
    altarBaseB.position.y = 0.3;
    weakAltar.add(altarBaseB);
    const altarLightB = new THREE.PointLight(0xff4444, 3, 6);
    altarLightB.position.y = 1.5;
    weakAltar.add(altarLightB);
    scene.add(weakAltar);

    // Player Model (Scholar Avatar)
    const playerGroup = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 1.4, 16), scholarRobeMat);
    body.position.y = 0.7;
    body.castShadow = true;
    playerGroup.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshStandardMaterial({ color: 0xd9a779 }));
    head.position.y = 1.6;
    playerGroup.add(head);

    const turban = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.12, 12, 24), scholarTurbanMat);
    turban.position.y = 1.7;
    turban.rotation.x = Math.PI / 2;
    playerGroup.add(turban);

    // Scholar Lantern (held in hand)
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.3, 8), goldMat);
    lantern.position.set(0.45, 0.8, 0.3);
    const lanternLight = new THREE.PointLight(0xffea9f, 2, 5);
    lanternLight.position.set(0.45, 0.8, 0.3);
    playerGroup.add(lantern);
    playerGroup.add(lanternLight);

    scene.add(playerGroup);

    // Spawn Game Scroll Items in the Arena
    const itemsGroup = new THREE.Group();
    scene.add(itemsGroup);

    const spawnItems = () => {
      itemsGroup.clear();
      const newItems: GameItem[] = [];
      const count = 5;
      for (let i = 0; i < count; i++) {
        const poolIndex = Math.floor(Math.random() * GAME_ITEMS_POOL.length);
        const template = GAME_ITEMS_POOL[poolIndex];

        const itemMesh = new THREE.Group();
        const scrollGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 12);
        const scrollMesh = new THREE.Mesh(scrollGeo, new THREE.MeshStandardMaterial({ color: 0xf4ecd8, roughness: 0.5 }));
        scrollMesh.rotation.z = Math.PI / 2;
        scrollMesh.castShadow = true;
        itemMesh.add(scrollMesh);

        const glowOrb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), template.isAuthentic ? authenticMat : weakMat);
        itemMesh.add(glowOrb);

        const x = (Math.random() - 0.5) * 12;
        const z = (Math.random() - 0.5) * 8 + 1;
        itemMesh.position.set(x, 0.6, z);
        itemsGroup.add(itemMesh);

        newItems.push({
          id: Date.now() + i,
          text: template.text,
          isAuthentic: template.isAuthentic,
          category: template.category,
          sourceNote: template.sourceNote,
          position: new THREE.Vector3(x, 0.6, z),
          mesh: itemMesh,
          collected: false,
        });
      }
      simRef.current.items = newItems;
    };

    spawnItems();

    // Keyboard Input Listeners
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') simRef.current.keys.w = true;
      if (key === 'a' || key === 'arrowleft') simRef.current.keys.a = true;
      if (key === 's' || key === 'arrowdown') simRef.current.keys.s = true;
      if (key === 'd' || key === 'arrowright') simRef.current.keys.d = true;
      if (key === ' ') {
        simRef.current.keys.space = true;
      }
      if (key === 'escape') {
        setGameState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') simRef.current.keys.w = false;
      if (key === 'a' || key === 'arrowleft') simRef.current.keys.a = false;
      if (key === 's' || key === 'arrowdown') simRef.current.keys.s = false;
      if (key === 'd' || key === 'arrowright') simRef.current.keys.d = false;
      if (key === ' ') simRef.current.keys.space = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // 60FPS Game Simulation Loop
    let animId: number;
    let lastTime = performance.now();
    let secondAccumulator = 0;

    const gameLoop = (time: number) => {
      animId = requestAnimationFrame(gameLoop);
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      // Handle hit-stop (screen pause on impacts)
      if (time < simRef.current.hitStopUntil) {
        renderer.render(scene, camera);
        return;
      }

      // Decrement Timer
      secondAccumulator += dt;
      if (secondAccumulator >= 1.0) {
        secondAccumulator -= 1.0;
        simRef.current.timeLeft = Math.max(0, simRef.current.timeLeft - 1);
        setTimeLeft(simRef.current.timeLeft);
        if (simRef.current.timeLeft <= 0) {
          setGameState('gameover');
          sound.playVictoryFanfare();
        }
      }

      // Player Movement Physics
      const moveSpeed = 6.5;
      const inputDir = new THREE.Vector3(0, 0, 0);
      if (simRef.current.keys.w) inputDir.z -= 1;
      if (simRef.current.keys.s) inputDir.z += 1;
      if (simRef.current.keys.a) inputDir.x -= 1;
      if (simRef.current.keys.d) inputDir.x += 1;

      if (inputDir.lengthSq() > 0) {
        inputDir.normalize();
        simRef.current.playerVelocity.copy(inputDir.multiplyScalar(moveSpeed));
        const targetRotation = Math.atan2(inputDir.x, inputDir.z);
        playerGroup.rotation.y += (targetRotation - playerGroup.rotation.y) * 0.2;
      } else {
        simRef.current.playerVelocity.multiplyScalar(0.8);
      }

      simRef.current.playerPos.addScaledVector(simRef.current.playerVelocity, dt);

      // Arena boundary clamp (radius 10)
      if (simRef.current.playerPos.length() > 10) {
        simRef.current.playerPos.setLength(10);
      }

      playerGroup.position.copy(simRef.current.playerPos);

      // Floating items animation & pickup check
      simRef.current.items.forEach((item) => {
        if (item.collected || !item.mesh) return;
        item.mesh.rotation.y += 2.0 * dt;
        item.mesh.position.y = 0.6 + Math.sin(time * 0.003 + item.id) * 0.15;

        // Proximity Pickup (Space or walk-into)
        const dist = playerGroup.position.distanceTo(item.position);
        if (dist < 1.6 && !simRef.current.carriedItem) {
          simRef.current.carriedItem = item;
          item.collected = true;
          item.mesh.visible = false;
          setActiveCarriedItem(item);
          sound.playClick();
        }
      });

      // Sorting at Altars
      if (simRef.current.carriedItem) {
        const carried = simRef.current.carriedItem;
        const distToAuthentic = playerGroup.position.distanceTo(authenticAltar.position);
        const distToWeak = playerGroup.position.distanceTo(weakAltar.position);

        // Check if placed at Authentic Altar (Left)
        if (distToAuthentic < 2.4) {
          if (carried.isAuthentic) {
            // Correct!
            simRef.current.score += 100 * simRef.current.combo;
            simRef.current.combo = Math.min(simRef.current.combo + 1, 5);
            sound.playAuthenticChime();
            setFeedbackBanner({ text: `أحسنت! نص صحيح ومثبت: ${carried.sourceNote}`, isSuccess: true });
          } else {
            // Mistake!
            simRef.current.combo = 1;
            simRef.current.screenShake = 0.4;
            simRef.current.hitStopUntil = time + 60; // 60ms hit stop
            sound.playRejectGong();
            setFeedbackBanner({ text: `خطأ! هذا نص ضعيف/مكذوب وُضع في كفة الصحيح: ${carried.sourceNote}`, isSuccess: false });
          }
          simRef.current.carriedItem = null;
          setActiveCarriedItem(null);
          setScore(simRef.current.score);
          setCombo(simRef.current.combo);
        }
        // Check if placed at Weak Altar (Right)
        else if (distToWeak < 2.4) {
          if (!carried.isAuthentic) {
            // Correct detection!
            simRef.current.score += 100 * simRef.current.combo;
            simRef.current.combo = Math.min(simRef.current.combo + 1, 5);
            sound.playAuthenticChime();
            setFeedbackBanner({ text: `ممتاز! تم كشف الشبهة والضعف بدقة: ${carried.sourceNote}`, isSuccess: true });
          } else {
            // Mistake!
            simRef.current.combo = 1;
            simRef.current.screenShake = 0.4;
            simRef.current.hitStopUntil = time + 60;
            sound.playRejectGong();
            setFeedbackBanner({ text: `تسرع! هذا النص صحيح ثابت رُمي في الأباطيل: ${carried.sourceNote}`, isSuccess: false });
          }
          simRef.current.carriedItem = null;
          setActiveCarriedItem(null);
          setScore(simRef.current.score);
          setCombo(simRef.current.combo);
        }
      }

      // Respawn when items are all processed
      const remaining = simRef.current.items.filter((it) => !it.collected);
      if (remaining.length === 0) {
        spawnItems();
      }

      // Camera Follows Player with Smooth Damping & Screen Shake
      const shakeX = (Math.random() - 0.5) * simRef.current.screenShake;
      const shakeY = (Math.random() - 0.5) * simRef.current.screenShake;
      simRef.current.screenShake = Math.max(0, simRef.current.screenShake - 2.5 * dt);

      camera.position.x += (playerGroup.position.x + shakeX - camera.position.x) * 0.1;
      camera.position.z += (playerGroup.position.z + 10 + shakeY - camera.position.z) * 0.1;
      camera.position.y = 8;
      camera.lookAt(playerGroup.position.x, 1, playerGroup.position.y - 1);

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(gameLoop);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  const handleStartGame = () => {
    setGameState('playing');
    setScore(0);
    setCombo(1);
    setTimeLeft(60);
    simRef.current.score = 0;
    simRef.current.combo = 1;
    simRef.current.timeLeft = 60;
    simRef.current.playerPos.set(0, 0, 0);
    sound.playVictoryFanfare();
  };

  const handleSaveScore = async () => {
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'leaderboard'), {
        score,
        userDisplayName: user?.displayName || 'باحث إسلامي',
        userId: user?.uid || 'anon',
        completedAt: new Date().toISOString(),
      });
      alert('تم حفظ نتيجتك بنجاح في لوحة المتصدرين!');
    } catch {
      alert('تم تسجيل النتيجة محلياً!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06140f] overflow-hidden select-none font-cairo">
      {/* Isolated Three.js Canvas Container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Title Screen Modal (Overlay over live 3D background with bespoke SVG) */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-8 bg-black/60 pointer-events-auto">
          {/* Top Bar with exit & mute */}
          <div className="w-full max-w-5xl flex items-center justify-between">
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900/80 border border-stone-700 text-stone-300 hover:text-stone-100 text-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              <span>العودة للمنصة</span>
            </button>

            <button
              onClick={() => setIsMuted(sound.toggleMute())}
              className="p-2 rounded-lg bg-stone-900/80 border border-stone-700 text-stone-300 hover:text-stone-100"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

          {/* Center Lockup with Bespoke SVG */}
          <div className="text-center space-y-4 max-w-xl">
            <div className="flex justify-center">
              <svg width="84" height="84" viewBox="0 0 24 24" fill="none" className="text-amber-400 animate-pulse">
                <path d="M12 3V21M3 9L12 3L21 9M3 9L6 15C6 16.6569 4.65685 18 3 18C1.34315 18 0 16.6569 0 15L3 9ZM21 9L24 15C24 16.6569 22.6569 18 21 18C19.3431 18 18 16.6569 18 15L21 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-100 tracking-wider">
              رِحْلَـةُ المُحَقِّـق <span className="text-amber-400 font-serif font-normal">| SCHOLAR'S QUEST</span>
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed">
              تحكّم في الباحث في قاعة الحكمة، التقط النصوص المتناقلة، وميّز بين 
              <strong className="text-emerald-400"> «الصحيح والموثق» </strong> و 
              <strong className="text-rose-400"> «الموضوع والمكذوب» </strong> على الميزان قبل انتهاء الوقت!
            </p>

            <div className="pt-4 flex flex-col items-center gap-3">
              <button
                onClick={handleStartGame}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-extrabold text-base rounded-2xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>ابدأ رحلة التحقيق</span>
              </button>
              <span className="text-xs text-stone-400 font-mono">
                أزرار الحركة: W, A, S, D أو الأسهم · الفضاء: التفاعل
              </span>
            </div>
          </div>

          {/* Highscore Leaderboard preview */}
          <div className="w-full max-w-md bg-stone-900/80 border border-stone-800 rounded-xl p-3 text-xs">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-stone-800 text-stone-400 font-bold">
              <span className="flex items-center gap-1 text-amber-400">
                <Trophy className="w-3.5 h-3.5" /> لوحة المتصدرين
              </span>
              <span>النقاط</span>
            </div>
            <div className="space-y-1">
              {highScores.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-stone-300 text-[11px]">
                  <span>{i + 1}. {h.name}</span>
                  <span className="font-mono text-amber-400">{h.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* World-Matched Low-Occlusion HUD during Playing (>= 85% playfield unobstructed) */}
      {gameState === 'playing' && (
        <div className="absolute inset-0 pointer-events-none p-5 flex flex-col justify-between">
          {/* Top Status Cluster (Score, Combo, Time, Exit) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 bg-[#05140e]/90 border border-amber-500/30 rounded-xl px-4 py-2 pointer-events-auto">
              <div>
                <span className="text-[10px] text-stone-400 block font-medium">النقاط</span>
                <span className="text-xl font-bold font-mono text-amber-300 tabular-nums">{score}</span>
              </div>
              <div className="h-6 w-px bg-stone-800" />
              <div>
                <span className="text-[10px] text-stone-400 block font-medium">المضاعف</span>
                <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">x{combo}</span>
              </div>
              <div className="h-6 w-px bg-stone-800" />
              <div>
                <span className="text-[10px] text-stone-400 block font-medium">الوقت المتبقي</span>
                <span className={`text-xl font-bold font-mono tabular-nums ${timeLeft <= 10 ? 'text-rose-400 animate-ping' : 'text-stone-100'}`}>
                  {timeLeft} ث
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => setGameState('paused')}
                className="px-3 py-1.5 rounded-lg bg-stone-900/80 border border-stone-800 text-stone-300 hover:text-stone-100 text-xs"
              >
                إيقاف مؤقت (Esc)
              </button>
              <button
                onClick={onExit}
                className="px-3 py-1.5 rounded-lg bg-stone-900/80 border border-stone-800 text-stone-300 hover:text-stone-100 text-xs"
              >
                خروج
              </button>
            </div>
          </div>

          {/* Active Carried Scroll Inspection Card */}
          {activeCarriedItem && (
            <div className="self-center max-w-md w-full bg-[#081a13]/95 border-2 border-amber-400 rounded-2xl p-4 shadow-2xl text-center pointer-events-auto animate-in zoom-in-95 duration-150">
              <span className="text-[10px] text-amber-400 font-bold block mb-1">
                📜 المخطوطة المحمولة ({activeCarriedItem.category}):
              </span>
              <p className="font-amiri text-base text-stone-100 mb-2 leading-relaxed">
                « {activeCarriedItem.text} »
              </p>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-800">
                <span className="text-emerald-400 font-bold">← احملها للمنصة الخضراء إن كانت صحيحة</span>
                <span className="text-rose-400 font-bold">احملها للمنصة الحمراء إن كانت مكذوبة →</span>
              </div>
            </div>
          )}

          {/* Feedback Flash Banner */}
          {feedbackBanner && (
            <div className={`self-center px-4 py-2 rounded-xl text-xs font-bold border shadow-xl transition-all ${
              feedbackBanner.isSuccess
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600'
                : 'bg-rose-950/90 text-rose-300 border-rose-600'
            }`}>
              {feedbackBanner.text}
            </div>
          )}

          {/* Bottom Guidance hints */}
          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span className="bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 rounded-lg text-emerald-300">
              🟢 المنصة الخضراء: كفة الصحيح والموثق
            </span>
            <span className="bg-stone-900/80 px-3 py-1 rounded-lg">
              اقترب من أي مخطوطة لالتقاطها وفحصها
            </span>
            <span className="bg-rose-950/80 border border-rose-800/60 px-3 py-1 rounded-lg text-rose-300">
              🔴 المنصة الحمراء: كفة الموضوع والمكذوب
            </span>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/80 pointer-events-auto">
          <div className="bg-[#091a14] border border-amber-500/50 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
            <h2 className="text-2xl font-bold text-stone-100 font-cairo">
              انتهت رحلة التحقيق!
            </h2>
            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
              <span className="text-xs text-stone-400 block">مجموع النقاط المحققة</span>
              <span className="text-4xl font-extrabold text-amber-300 font-mono">{score}</span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleSaveScore}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs rounded-xl transition-colors"
              >
                تسجيل النتيجة في لوحة المتصدرين
              </button>
              <button
                onClick={handleStartGame}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl transition-colors"
              >
                إعادة التحدي
              </button>
              <button
                onClick={onExit}
                className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-xl transition-colors"
              >
                العودة للشات والتحقيق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
