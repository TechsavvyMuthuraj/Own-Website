"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export interface GridDistortionProps {
  imageSrc: string;
  grid?: number;
  mouse?: number;
  strength?: number;
  relaxation?: number;
  className?: string;
  style?: React.CSSProperties;
}

const vertexShader = `
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uDataTexture;
uniform sampler2D uTexture;
uniform vec4 resolution;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec4 offset = texture2D(uDataTexture, vUv);
  gl_FragColor = texture2D(uTexture, uv - 0.02 * offset.rg);
}
`;

export function GridDistortion({
  grid = 15,
  mouse = 0.1,
  strength = 0.15,
  relaxation = 0.9,
  imageSrc,
  className = "",
  style,
}: GridDistortionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const planeRef = useRef<THREE.Mesh | null>(null);
  const imageAspectRef = useRef(1);
  const animationIdRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [textureLoaded, setTextureLoaded] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check WebGL support
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const container = containerRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
    } catch {
      setWebglSupported(false);
      return;
    }

    // Clean existing canvas if any
    const existingCanvas = container.querySelector("canvas");
    if (existingCanvas) {
      container.removeChild(existingCanvas);
    }
    container.appendChild(renderer.domElement);

    const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000);
    camera.position.z = 2;
    cameraRef.current = camera;

    const uniforms: {
      time: { value: number };
      resolution: { value: THREE.Vector4 };
      uTexture: { value: THREE.Texture | null };
      uDataTexture: { value: THREE.DataTexture | null };
    } = {
      time: { value: 0 },
      resolution: { value: new THREE.Vector4() },
      uTexture: { value: null },
      uDataTexture: { value: null },
    };

    const handleResize = () => {
      if (!container || !renderer || !camera) return;

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (width === 0 || height === 0) return;

      const containerAspect = width / height;

      renderer.setSize(width, height);

      if (planeRef.current) {
        planeRef.current.scale.set(containerAspect, 1, 1);
      }

      const frustumHeight = 1;
      const frustumWidth = frustumHeight * containerAspect;
      camera.left = -frustumWidth / 2;
      camera.right = frustumWidth / 2;
      camera.top = frustumHeight / 2;
      camera.bottom = -frustumHeight / 2;
      camera.updateProjectionMatrix();

      uniforms.resolution.value.set(width, height, 1, 1);
    };

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      imageSrc,
      (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        if (texture.image) {
          imageAspectRef.current =
            texture.image.width / (texture.image.height || 1);
        }
        uniforms.uTexture.value = texture;
        setTextureLoaded(true);
        handleResize();
      },
      undefined,
      () => {
        // Fallback gracefully on texture error
        setTextureLoaded(false);
      }
    );

    const size = grid;
    const data = new Float32Array(4 * size * size);
    for (let i = 0; i < size * size; i++) {
      data[i * 4] = Math.random() * 255 - 125;
      data[i * 4 + 1] = Math.random() * 255 - 125;
      data[i * 4 + 2] = 0;
      data[i * 4 + 3] = 1;
    }

    const dataTexture = new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    dataTexture.needsUpdate = true;
    uniforms.uDataTexture.value = dataTexture;

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(1, 1, size - 1, size - 1);
    const plane = new THREE.Mesh(geometry, material);
    planeRef.current = plane;
    scene.add(plane);

    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(container);
      resizeObserverRef.current = resizeObserver;
    } else {
      window.addEventListener("resize", handleResize);
    }

    let cachedRect: DOMRect | null = null;
    const updateCachedRect = () => {
      if (container) {
        cachedRect = container.getBoundingClientRect();
      }
    };

    const mouseState = {
      x: 0,
      y: 0,
      prevX: 0,
      prevY: 0,
      vX: 0,
      vY: 0,
    };

    const handleMouseEnter = () => {
      updateCachedRect();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!cachedRect || cachedRect.width === 0) {
        updateCachedRect();
      }
      if (!cachedRect) return;
      const x = (e.clientX - cachedRect.left) / cachedRect.width;
      const y = 1 - (e.clientY - cachedRect.top) / cachedRect.height;
      mouseState.vX = x - mouseState.prevX;
      mouseState.vY = y - mouseState.prevY;
      Object.assign(mouseState, { x, y, prevX: x, prevY: y });
    };

    const handleMouseLeave = () => {
      if (dataTexture) {
        dataTexture.needsUpdate = true;
      }
      Object.assign(mouseState, {
        x: 0,
        y: 0,
        prevX: 0,
        prevY: 0,
        vX: 0,
        vY: 0,
      });
    };

    container.addEventListener("mouseenter", handleMouseEnter, { passive: true });
    container.addEventListener("mousemove", handleMouseMove, { passive: true });
    container.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    handleResize();
    updateCachedRect();

    let isVisibleOnScreen = true;

    const animate = () => {
      if (!isVisibleOnScreen) {
        animationIdRef.current = null;
        return;
      }
      animationIdRef.current = requestAnimationFrame(animate);

      if (!renderer || !scene || !camera) return;

      uniforms.time.value += 0.05;

      const dataArr = dataTexture.image.data;
      if (dataArr) {
        for (let i = 0; i < size * size; i++) {
          dataArr[i * 4] *= relaxation;
          dataArr[i * 4 + 1] *= relaxation;
        }

        const gridMouseX = size * mouseState.x;
        const gridMouseY = size * mouseState.y;
        const maxDist = size * mouse;

        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            const distSq =
              Math.pow(gridMouseX - i, 2) + Math.pow(gridMouseY - j, 2);
            if (distSq < maxDist * maxDist) {
              const index = 4 * (i + size * j);
              const power = Math.min(maxDist / Math.sqrt(distSq), 10);
              dataArr[index] += strength * 100 * mouseState.vX * power;
              dataArr[index + 1] -= strength * 100 * mouseState.vY * power;
            }
          }
        }

        dataTexture.needsUpdate = true;
      }
      renderer.render(scene, camera);
    };

    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          isVisibleOnScreen = entry.isIntersecting;
          if (isVisibleOnScreen && !animationIdRef.current) {
            animate();
          }
        },
        { threshold: 0.05 }
      );
      intersectionObserver.observe(container);
    } else {
      animate();
    }

    return () => {
      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      } else {
        window.removeEventListener("resize", handleResize);
      }

      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);

      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }

      geometry.dispose();
      material.dispose();
      dataTexture.dispose();
      if (uniforms.uTexture.value) {
        uniforms.uTexture.value.dispose();
      }

      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      planeRef.current = null;
    };
  }, [grid, mouse, strength, relaxation, imageSrc]);

  return (
    <div
      ref={containerRef}
      className={`distortion-container relative w-full h-full overflow-hidden select-none ${className}`}
      style={{
        width: "100%",
        height: "100%",
        minWidth: "0",
        minHeight: "0",
        ...style,
      }}
    >
      {/* Fallback image underneath while WebGL or texture loads */}
      {(!textureLoaded || !webglSupported) && (
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />
      )}
    </div>
  );
}

export default GridDistortion;
