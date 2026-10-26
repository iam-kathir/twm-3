"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function CyberConstellation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Accessibility check: disable heavy 3D motion if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 700;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07090e, 0.0018);

    const camera = new THREE.PerspectiveCamera(55, width / height, 1, 2000);
    camera.position.z = 750;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x07090e, 0); // Transparent canvas over obsidian background
    container.appendChild(renderer.domElement);

    // Particle Constellation
    const particleCount = 220;
    const maxDistance = 110;
    const positions = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    const bounds = { x: 900, y: 600, z: 600 };

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * bounds.x;
      positions[i * 3 + 1] = (Math.random() - 0.5) * bounds.y;
      positions[i * 3 + 2] = (Math.random() - 0.5) * bounds.z;

      velocities.push({
        x: (Math.random() - 0.5) * 0.45,
        y: (Math.random() - 0.5) * 0.45,
        z: (Math.random() - 0.5) * 0.45,
      });
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Custom circle particle texture
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      gradient.addColorStop(0, "rgba(52, 211, 153, 1)");
      gradient.addColorStop(0.4, "rgba(16, 185, 129, 0.8)");
      gradient.addColorStop(1, "rgba(16, 185, 129, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(8, 8, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 5,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Dynamic Connection Lines (LineSegments)
    const maxLines = (particleCount * (particleCount - 1)) / 2;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
    lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Orbiting Telemetry Wireframe Rings (3 concentric rings for GitHub, LeetCode, HackerRank)
    const ringGroup = new THREE.Group();
    const ringConfigs = [
      { radius: 240, color: 0x10b981, tiltX: 0.4, tiltY: 0.2, speed: 0.002 },
      { radius: 320, color: 0x34d399, tiltX: -0.5, tiltY: 0.3, speed: -0.0015 },
      { radius: 400, color: 0x38bdf8, tiltX: 0.2, tiltY: -0.4, speed: 0.001 },
    ];

    const rings = ringConfigs.map((cfg) => {
      const ringGeo = new THREE.RingGeometry(cfg.radius - 0.8, cfg.radius + 0.8, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.16,
        wireframe: true,
      });
      const mesh = new THREE.Mesh(ringGeo, ringMat);
      mesh.rotation.x = cfg.tiltX;
      mesh.rotation.y = cfg.tiltY;
      ringGroup.add(mesh);
      return { mesh, speed: cfg.speed };
    });

    scene.add(ringGroup);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX = (x / (rect.width / 2)) * 80;
      mouseY = (y / (rect.height / 2)) * 60;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth camera parallax
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      camera.position.x = targetX;
      camera.position.y = -targetY;
      camera.lookAt(scene.position);

      // Rotate orbiting telemetry rings
      rings.forEach((r) => {
        r.mesh.rotation.z += r.speed;
      });

      // Update particle positions
      const pArr = particleGeometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        pArr[i3] += velocities[i].x;
        pArr[i3 + 1] += velocities[i].y;
        pArr[i3 + 2] += velocities[i].z;

        // Bounce back inside boundaries
        if (pArr[i3] < -bounds.x / 2 || pArr[i3] > bounds.x / 2) velocities[i].x = -velocities[i].x;
        if (pArr[i3 + 1] < -bounds.y / 2 || pArr[i3 + 1] > bounds.y / 2) velocities[i].y = -velocities[i].y;
        if (pArr[i3 + 2] < -bounds.z / 2 || pArr[i3 + 2] > bounds.z / 2) velocities[i].z = -velocities[i].z;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      // Update lines between nearby particles
      let lineIndex = 0;
      let colorIndex = 0;
      const lPos = lineGeometry.attributes.position.array as Float32Array;
      const lCol = lineGeometry.attributes.color.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = pArr[i * 3] - pArr[j * 3];
          const dy = pArr[i * 3 + 1] - pArr[j * 3 + 1];
          const dz = pArr[i * 3 + 2] - pArr[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxDistance) {
            const alpha = 1.0 - dist / maxDistance;

            lPos[lineIndex++] = pArr[i * 3];
            lPos[lineIndex++] = pArr[i * 3 + 1];
            lPos[lineIndex++] = pArr[i * 3 + 2];

            lPos[lineIndex++] = pArr[j * 3];
            lPos[lineIndex++] = pArr[j * 3 + 1];
            lPos[lineIndex++] = pArr[j * 3 + 2];

            // Hyper-Mint glow fading with distance
            const r = 0.06 * alpha;
            const g = 0.72 * alpha;
            const b = 0.52 * alpha;

            lCol[colorIndex++] = r;
            lCol[colorIndex++] = g;
            lCol[colorIndex++] = b;

            lCol[colorIndex++] = r;
            lCol[colorIndex++] = g;
            lCol[colorIndex++] = b;
          }
        }
      }

      lineGeometry.setDrawRange(0, lineIndex / 3);
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      particleGeometry.dispose();
      particleMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      rings.forEach((r) => {
        r.mesh.geometry.dispose();
        (r.mesh.material as THREE.Material).dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-80"
    />
  );
}
