"use client"
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeCanvas = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentRef = mountRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(width, height);
    currentRef.appendChild(renderer.domElement);

    // OrbitControls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.zoomSpeed = 0.1;

    // Ring (circle) setup
    const ringGeometry = new THREE.RingGeometry(2.5, 3, 64); // Radius adjusted to be slightly larger than the sphere radius
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 'black', side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2; // Rotate the ring to lie in the XY plane
    scene.add(ring);

    // Particle setup
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 5000;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3); // For particle colors
    const sphereRadius = 2; // Radius of the sphere
    const fileNames = []; // Array to store file names

    // Arrays to store velocity & direction for each particle
    const velocity = [];
    const direction = [];

    for (let i = 0; i < particlesCount; i++) {
      const r = Math.random() * sphereRadius;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.sqrt(particlesCount * Math.PI) * phi;

      posArray[i * 3] = r * Math.cos(theta) * Math.sin(phi);
      posArray[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      posArray[i * 3 + 2] = r * Math.cos(phi);
      fileNames.push(`file_${i}.js`);

      // Initialize velocity & direction
      velocity.push(0.0001 + Math.random() * 0.0001); // Lower velocity for smoother movement
      direction.push({
        x: Math.random() - 0.5,
        y: Math.random() - 0.5,
        z: Math.random() - 0.5
      });

      // Assign color
      let color;
      if (i < particlesCount / 4) {
        color = new THREE.Color('darkgray'); // First quarter: dark gray
      } else if (i < particlesCount / 2) {
        color = new THREE.Color('white'); // Second quarter: white
      } else {
        color = new THREE.Color('cyan'); // Rest: cyan
      }

      colorArray[i * 3] = color.r;
      colorArray[i * 3 + 1] = color.g;
      colorArray[i * 3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    // Create a circular particle texture
    const particleTexture = createCircleTexture();

    // Material of the particles
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.01,
      map: particleTexture,
      transparent: true,
      vertexColors: true // Use vertex colors
    });

    // Mesh of the particle system
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // Camera position
    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      // Update particle positions
      const positions = particleSystem.geometry.attributes.position.array;
      for (let i = 0; i < particlesCount; i++) {
        const ix = i * 3;
        positions[ix] += direction[i].x * velocity[i];
        positions[ix + 1] += direction[i].y * velocity[i];
        positions[ix + 2] += direction[i].z * velocity[i];

        // Check if the particle is outside the sphere and reset its position
        if (new THREE.Vector3(positions[ix], positions[ix + 1], positions[ix + 2]).length() > sphereRadius) {
          positions[ix] = (Math.random() - 0.5) * 2 * sphereRadius;
          positions[ix + 1] = (Math.random() - 0.5) * 2 * sphereRadius;
          positions[ix + 2] = (Math.random() - 0.5) * 2 * sphereRadius;
        }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Function to create a circular texture
    function createCircleTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64; 

      const context = canvas.getContext('2d');
      context.beginPath();
      context.arc(32, 32, 32, 0, 2 * Math.PI);
      context.fillStyle = '#484E61';
      context.fill();

      return new THREE.CanvasTexture(canvas);
    }

    // Cleanup function
    return () => {
      currentRef.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default ThreeCanvas;




