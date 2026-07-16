"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

type ObjModelViewerProps = {
  src: string;
  label: string;
};

const subscribeReducedMotion = (callback: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};

const getReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type RobustModelBounds = {
  min: THREE.Vector3;
  max: THREE.Vector3;
  maxDimension: number;
};

const quantile = (values: number[], amount: number) => {
  const index = Math.min(values.length - 1, Math.max(0, Math.floor((values.length - 1) * amount)));
  return values[index] ?? 0;
};

const getRobustModelBounds = (object: THREE.Object3D): RobustModelBounds => {
  const axes: [number[], number[], number[]] = [[], [], []];

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const position = child.geometry.getAttribute("position");
    for (let index = 0; index < position.count; index += 1) {
      axes[0].push(position.getX(index));
      axes[1].push(position.getY(index));
      axes[2].push(position.getZ(index));
    }
  });

  axes.forEach((axis) => axis.sort((a, b) => a - b));
  const min = new THREE.Vector3(...axes.map((axis) => quantile(axis, 0.05)) as [number, number, number]);
  const max = new THREE.Vector3(...axes.map((axis) => quantile(axis, 0.95)) as [number, number, number]);
  const size = max.clone().sub(min);

  return { min, max, maxDimension: Math.max(size.x, size.y, size.z) || 1 };
};

const removeReferencePlanes = (object: THREE.Object3D, maximumEdge: number) => {
  const maximumEdgeSquared = maximumEdge * maximumEdge;

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const source = child.geometry.index ? child.geometry.toNonIndexed() : child.geometry.clone();
    const position = source.getAttribute("position");
    const kept: number[] = [];
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();

    for (let index = 0; index + 2 < position.count; index += 3) {
      a.fromBufferAttribute(position, index);
      b.fromBufferAttribute(position, index + 1);
      c.fromBufferAttribute(position, index + 2);
      const longestEdge = Math.max(a.distanceToSquared(b), b.distanceToSquared(c), c.distanceToSquared(a));
      if (longestEdge > maximumEdgeSquared) continue;
      kept.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    }

    const filtered = new THREE.BufferGeometry();
    filtered.setAttribute("position", new THREE.Float32BufferAttribute(kept, 3));
    filtered.computeVertexNormals();
    child.geometry.dispose();
    source.dispose();
    child.geometry = filtered;
  });
};

export function ObjModelViewer({ src, label }: ObjModelViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rotationStateRef = useRef({ enabled: true, reducedMotion: false });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);

  useEffect(() => {
    rotationStateRef.current = { enabled: rotationEnabled, reducedMotion };
  }, [reducedMotion, rotationEnabled]);

  const resetView = useCallback(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.reset();
    controls.update();
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let animationFrame = 0;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7f7f5);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);
    camera.position.set(6, 3.5, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.82;
    renderer.setClearColor(0xf7f7f5, 1);
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 18;
    controls.autoRotateSpeed = 0.65;
    controls.saveState();

    scene.add(new THREE.HemisphereLight(0xffffff, 0xbfc4c8, 0.72));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.05);
    keyLight.position.set(5, 8, 7);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xbfd6e6, 0.42);
    fillLight.position.set(-6, 2, -5);
    scene.add(fillLight);

    const ground = new THREE.GridHelper(12, 24, 0xc8cbcd, 0xe4e5e5);
    ground.position.y = -2.2;
    const gridMaterials = Array.isArray(ground.material) ? ground.material : [ground.material];
    gridMaterials.forEach((material) => {
      material.transparent = true;
      material.opacity = 0.22;
    });
    scene.add(ground);

    const modelMaterial = new THREE.MeshStandardMaterial({
      color: 0x6f7478,
      side: THREE.DoubleSide,
      metalness: 0.18,
      roughness: 0.62,
    });

    const loader = new OBJLoader();
    loader.load(
      src,
      (object) => {
        if (disposed) return;
        const robustBounds = getRobustModelBounds(object);
        removeReferencePlanes(object, robustBounds.maxDimension * 2);
        object.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.geometry.computeVertexNormals();
          child.material = modelMaterial;
          child.frustumCulled = false;
        });

        const initialCenter = robustBounds.min.clone().add(robustBounds.max).multiplyScalar(0.5);
        const modelScale = 4.3 / robustBounds.maxDimension;
        object.scale.setScalar(modelScale);
        object.position.copy(initialCenter).multiplyScalar(-modelScale);
        const modelPivot = new THREE.Group();
        modelPivot.rotation.set(0, -0.42, 0);
        modelPivot.position.set(-3.5, 0, 0);
        modelPivot.add(object);
        scene.add(modelPivot);

        modelPivot.updateMatrixWorld(true);
        const centeredBox = new THREE.Box3(robustBounds.min.clone(), robustBounds.max.clone()).applyMatrix4(object.matrixWorld);
        const centeredSize = centeredBox.getSize(new THREE.Vector3());
        const verticalFov = THREE.MathUtils.degToRad(camera.fov);
        const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * Math.max(camera.aspect, 1));
        const verticalDistance = centeredSize.y / (2 * Math.tan(verticalFov / 2));
        const horizontalDistance = centeredSize.x / (2 * Math.tan(horizontalFov / 2));
        const distance = Math.max(verticalDistance, horizontalDistance, centeredSize.z) * 2.75;
        camera.near = Math.max(distance / 100, 0.01);
        camera.far = distance * 100;
        camera.position.copy(new THREE.Vector3(1.15, 0.72, 1.5).normalize().multiplyScalar(distance));
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        controls.target.set(0, 0, 0);
        controls.minDistance = distance * 0.35;
        controls.maxDistance = distance * 4;
        controls.update();
        controls.saveState();
        setIsLoading(false);
      },
      undefined,
      () => {
        if (disposed) return;
        setIsLoading(false);
        setHasError(true);
      },
    );

    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const render = () => {
      controls.autoRotate =
        rotationStateRef.current.enabled &&
        !rotationStateRef.current.reducedMotion &&
        !document.hidden;
      controls.update();
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
      controls.dispose();
      controlsRef.current = null;
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
      });
      modelMaterial.dispose();
      gridMaterials.forEach((material) => material.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [src]);

  return (
    <div className="relative h-full min-h-[320px] overflow-hidden border border-black/12 bg-[#f7f7f5]" aria-label={label}>
      <div ref={hostRef} className="absolute inset-0 [&_canvas]:block" />

      <div className="absolute left-4 top-4 z-10 border border-black/12 bg-white/92 px-3 py-2 backdrop-blur-sm">
        <p className="font-mono text-[8px] uppercase text-black/42">Curtain wall detail</p>
        <p className="mt-1 text-xs font-semibold text-black">{label}</p>
      </div>

      <div className="absolute right-4 top-4 z-10 flex border border-black/12 bg-white/92 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setRotationEnabled((value) => !value)}
          className="grid size-9 place-items-center border-r border-black/12 text-black transition hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          aria-label={rotationEnabled && !reducedMotion ? "Pause model rotation" : "Play model rotation"}
          title={rotationEnabled && !reducedMotion ? "Pause rotation" : "Play rotation"}
        >
          {rotationEnabled && !reducedMotion ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          type="button"
          onClick={resetView}
          className="grid size-9 place-items-center text-black transition hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          aria-label="Reset model view"
          title="Reset view"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {isLoading ? (
        <div className="absolute inset-0 grid place-items-center bg-[#f7f7f5] text-center">
          <div>
            <span className="mx-auto block size-5 animate-spin rounded-full border-2 border-black/16 border-t-black" />
            <p className="mt-3 font-mono text-[9px] uppercase text-black/42">Loading assembly</p>
          </div>
        </div>
      ) : null}

      {hasError ? (
        <div className="absolute inset-0 grid place-items-center bg-[#f7f7f5] px-6 text-center">
          <p className="max-w-xs text-sm font-medium text-black/62">The GW-7000 assembly could not be loaded.</p>
        </div>
      ) : null}
    </div>
  );
}
