import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.z = 80;

    // ── PARTICLE NODES ──
    const nodeCount = 180;
    const nodeGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(nodeCount * 3);
    const nodeData = [];

    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 160;
      const z = (Math.random() - 0.5) * 80;
      positions[i * 3]     = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      nodeData.push({
        x, y, z,
        vx: (Math.random() - 0.5) * 0.04,
        vy: (Math.random() - 0.5) * 0.04,
        vz: (Math.random() - 0.5) * 0.02,
      });
    }

    nodeGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const nodeMat = new THREE.PointsMaterial({
      color: 0xa855f7,
      size: 0.8,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });

    const nodes = new THREE.Points(nodeGeo, nodeMat);
    scene.add(nodes);

    // ── CONNECTION LINES ──
    const maxConnections = 300;
    const linePositions = new Float32Array(maxConnections * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

    const lineMat = new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({
        color: 0x7c3aed,
        transparent: true,
        opacity: 0.25,
      })
    );
    scene.add(lineMat);

    // ── ROTATING WIREFRAME SPHERE ──
    const sphereGeo = new THREE.IcosahedronGeometry(30, 2);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x6d28d9,
      wireframe: true,
      transparent: true,
      opacity: 0.06,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // ── INNER GLOW SPHERE ──
    const innerSphereGeo = new THREE.IcosahedronGeometry(18, 2);
    const innerSphereMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.04,
    });
    const innerSphere = new THREE.Mesh(innerSphereGeo, innerSphereMat);
    scene.add(innerSphere);

    // ── FLOATING DATA RINGS ──
    const rings = [];
    const ringRadii = [12, 22, 35];
    const ringColors = [0xa855f7, 0x7c3aed, 0x06b6d4];
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.TorusGeometry(ringRadii[i], 0.15, 8, 80);
      const mat = new THREE.MeshBasicMaterial({
        color: ringColors[i],
        transparent: true,
        opacity: 0.12 - i * 0.02,
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = (Math.random() - 0.5) * Math.PI;
      ring.rotation.y = (Math.random() - 0.5) * Math.PI;
      scene.add(ring);
      rings.push(ring);
    }

    // ── SMALL ORBITING CUBES ──
    const cubes = [];
    const cubeMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    for (let i = 0; i < 8; i++) {
      const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const cube = new THREE.Mesh(geo, cubeMat.clone());
      const angle = (i / 8) * Math.PI * 2;
      const r = 45 + Math.random() * 15;
      cube.position.set(
        Math.cos(angle) * r,
        (Math.random() - 0.5) * 40,
        Math.sin(angle) * r * 0.5
      );
      cube.userData = { angle, r, speed: 0.003 + Math.random() * 0.002, rotSpeed: 0.01 + Math.random() * 0.01 };
      scene.add(cube);
      cubes.push(cube);
    }

    // Mouse parallax
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 0.3;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 0.3;
    };
    window.addEventListener("mousemove", onMouseMove);

    let raf;
    let t = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      t += 0.005;

      // Update node positions
      const pos = nodes.geometry.attributes.position.array;
      for (let i = 0; i < nodeCount; i++) {
        const d = nodeData[i];
        d.x += d.vx; d.y += d.vy; d.z += d.vz;
        if (Math.abs(d.x) > 100) d.vx *= -1;
        if (Math.abs(d.y) > 80)  d.vy *= -1;
        if (Math.abs(d.z) > 40)  d.vz *= -1;
        pos[i * 3]     = d.x;
        pos[i * 3 + 1] = d.y;
        pos[i * 3 + 2] = d.z;
      }
      nodes.geometry.attributes.position.needsUpdate = true;

      // Update connections
      let connIdx = 0;
      const lp = lineGeo.attributes.position.array;
      for (let i = 0; i < nodeCount && connIdx < maxConnections; i++) {
        for (let j = i + 1; j < nodeCount && connIdx < maxConnections; j++) {
          const dx = nodeData[i].x - nodeData[j].x;
          const dy = nodeData[i].y - nodeData[j].y;
          const dz = nodeData[i].z - nodeData[j].z;
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (dist < 28) {
            lp[connIdx * 6]     = nodeData[i].x;
            lp[connIdx * 6 + 1] = nodeData[i].y;
            lp[connIdx * 6 + 2] = nodeData[i].z;
            lp[connIdx * 6 + 3] = nodeData[j].x;
            lp[connIdx * 6 + 4] = nodeData[j].y;
            lp[connIdx * 6 + 5] = nodeData[j].z;
            connIdx++;
          }
        }
      }
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.setDrawRange(0, connIdx * 2);

      // Rotate spheres
      sphere.rotation.y = t * 0.12;
      sphere.rotation.x = t * 0.07;
      innerSphere.rotation.y = -t * 0.18;
      innerSphere.rotation.z = t * 0.1;

      // Rotate rings
      rings.forEach((ring, i) => {
        ring.rotation.y += 0.003 + i * 0.001;
        ring.rotation.x += 0.002 - i * 0.0005;
      });

      // Orbit cubes
      cubes.forEach((cube) => {
        cube.userData.angle += cube.userData.speed;
        cube.position.x = Math.cos(cube.userData.angle) * cube.userData.r;
        cube.position.z = Math.sin(cube.userData.angle) * cube.userData.r * 0.5;
        cube.rotation.x += cube.userData.rotSpeed;
        cube.rotation.y += cube.userData.rotSpeed * 0.7;
      });

      // Camera parallax
      camera.position.x += (mouse.x * 20 - camera.position.x) * 0.03;
      camera.position.y += (-mouse.y * 15 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
