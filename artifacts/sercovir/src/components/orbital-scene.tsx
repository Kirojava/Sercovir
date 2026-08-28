import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function makeArc(radius: number, start: number, end: number, lift: number) {
  const points: THREE.Vector3[] = [];
  for (let index = 0; index <= 60; index += 1) {
    const progress = index / 60;
    const angle = start + (end - start) * progress;
    const height = Math.sin(progress * Math.PI) * lift;
    points.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      height + Math.sin(angle * 1.7) * 0.06,
      Math.sin(angle) * radius,
    ));
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}

export function OrbitalScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const targetRef = useRef({ x: 0.12, y: 0.18, z: 0 });
  const rotationRef = useRef({ x: 0.12, y: 0.18, z: 0 });
  const [webglAvailable, setWebglAvailable] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      if (!context) {
        setWebglAvailable(false);
        return;
      }
      renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      setWebglAvailable(false);
      return;
    }

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.1, 6.2);
    camera.lookAt(0, 0, 0);

    const world = new THREE.Group();
    scene.add(world);

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.45, 3),
      new THREE.MeshBasicMaterial({ color: 0x68bda5, wireframe: true, transparent: true, opacity: 0.13 }),
    );
    world.add(shell);

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1.37, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0x102d29, transparent: true, opacity: 0.28 }),
    );
    world.add(globe);

    const latitudeMaterial = new THREE.LineBasicMaterial({ color: 0x68bda5, transparent: true, opacity: 0.11 });
    for (let index = -3; index <= 3; index += 1) {
      const radius = Math.cos((index / 4) * Math.PI / 2) * 1.39;
      const y = Math.sin((index / 4) * Math.PI / 2) * 1.39;
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 65 }, (_, pointIndex) => {
          const angle = (pointIndex / 64) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        }),
      ), latitudeMaterial);
      world.add(line);
    }

    const longitudeMaterial = new THREE.LineBasicMaterial({ color: 0xd2ae57, transparent: true, opacity: 0.09 });
    for (let index = 0; index < 8; index += 1) {
      const angle = (index / 8) * Math.PI;
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 33 }, (_, pointIndex) => {
          const latitude = (pointIndex / 32) * Math.PI - Math.PI / 2;
          return new THREE.Vector3(
            Math.cos(latitude) * Math.cos(angle) * 1.4,
            Math.sin(latitude) * 1.4,
            Math.cos(latitude) * Math.sin(angle) * 1.4,
          );
        }),
      ), longitudeMaterial);
      world.add(line);
    }

    const arcMaterial = new THREE.LineBasicMaterial({ color: 0xd2ae57, transparent: true, opacity: 0.42 });
    [
      makeArc(1.55, -2.7, -0.55, 0.62),
      makeArc(1.58, 0.25, 2.4, 0.42),
      makeArc(1.63, -0.4, 0.65, 0.82),
    ].forEach((geometry) => world.add(new THREE.Line(geometry, arcMaterial)));

    const starCount = 440;
    const starPositions = new Float32Array(starCount * 3);
    for (let index = 0; index < starCount; index += 1) {
      const radius = 2.7 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      starPositions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[index * 3 + 1] = radius * Math.cos(phi);
      starPositions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0xa2d8c5, size: 0.018, transparent: true, opacity: 0.55, sizeAttenuation: true }),
    );
    scene.add(stars);

    const fireflyCount = 42;
    const fireflyPositions = new Float32Array(fireflyCount * 3);
    for (let index = 0; index < fireflyCount; index += 1) {
      fireflyPositions[index * 3] = (Math.random() - 0.5) * 4.6;
      fireflyPositions[index * 3 + 1] = (Math.random() - 0.5) * 3.2;
      fireflyPositions[index * 3 + 2] = (Math.random() - 0.5) * 2.2;
    }
    const fireflies = new THREE.Points(
      new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(fireflyPositions, 3)),
      new THREE.PointsMaterial({ color: 0xd2ae57, size: 0.035, transparent: true, opacity: 0.62, sizeAttenuation: true }),
    );
    scene.add(fireflies);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    const onScroll = () => {
      const progress = Math.min(window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1), 1);
      targetRef.current = { x: 0.12 + progress * 0.72, y: 0.18 + progress * 1.5, z: progress * 0.28 };
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    let frame = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      rotationRef.current.x += (targetRef.current.x - rotationRef.current.x) * 0.025;
      rotationRef.current.y += (targetRef.current.y - rotationRef.current.y) * 0.025;
      rotationRef.current.z += (targetRef.current.z - rotationRef.current.z) * 0.025;
      world.rotation.x = rotationRef.current.x;
      world.rotation.y = rotationRef.current.y + elapsed * 0.035;
      world.rotation.z = rotationRef.current.z;
      shell.rotation.z = elapsed * 0.018;
      stars.rotation.y = elapsed * 0.004;
      fireflies.rotation.y = -elapsed * 0.012;
      fireflies.position.y = Math.sin(elapsed * 0.32) * 0.06;
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
          else object.material.dispose();
        }
      });
      renderer.dispose();
      sceneRef.current = null;
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {webglAvailable ? (
        <canvas ref={canvasRef} className="orbital-canvas" />
      ) : (
        <div className="orbital-fallback" aria-hidden="true">
          <span className="orbital-fallback-ring orbital-fallback-ring-one" />
          <span className="orbital-fallback-ring orbital-fallback-ring-two" />
          <span className="orbital-fallback-ring orbital-fallback-ring-three" />
          <span className="orbital-fallback-node orbital-fallback-node-one" />
          <span className="orbital-fallback-node orbital-fallback-node-two" />
          <span className="orbital-fallback-node orbital-fallback-node-three" />
        </div>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_28%,hsl(162_42%_3%_/_0.85)_88%)]" />
    </div>
  );
}