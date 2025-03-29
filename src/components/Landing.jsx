import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

// Card component for the features section
const Card = ({ title, delay, setCurrentPage }) => {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: delay, ease: "power3.out" }
      );
    }
  }, [delay]);
  
  useEffect(() => {
    if (cardRef.current && hovered) {
      gsap.to(cardRef.current, {
        scale: 1.05,
        boxShadow: '0 10px 20px rgba(255, 77, 77, 0.3)',
        duration: 0.3
      });
    } else if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 1,
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
        duration: 0.3
      });
    }
  }, [hovered]);

  // Map feature cards to the correct pages
  const handleNavigation = () => {
    if (title === "Expert Therapy") {
      setCurrentPage('therapy');
    } else if (title === "Focused Coaching") {
      setCurrentPage('coaching');
    } else if (title === "Founder Community") {
      setCurrentPage('community');
    }
  };

  return (
    <div 
      className="feature-card" 
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <h3>{title}</h3>
      <p>Transform your relationship with stress and reclaim your passion.</p>
      <button onClick={handleNavigation}>Learn More</button>
    </div>
  );
};

function Landing({ setCurrentPage }) {
  const canvasRef = useRef(null);
  const headlineRef = useRef(null);
  const subheadRef = useRef(null);
  const buttonRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const wallRef = useRef(null);
  const fragmentsRef = useRef([]);
  
  // Initialize Three.js scene
  useEffect(() => {
    // Scene setup
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      canvas,
      alpha: true,
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xff4d4d, 2, 10);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);
    
    // Create cracked wall
    const createWall = () => {
      // Wall texture with cracks
      const textureLoader = new THREE.TextureLoader();
      const wallGeometry = new THREE.BoxGeometry(10, 5, 0.5, 20, 20, 1);
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        emissive: 0xff4d4d,
        emissiveIntensity: 0.2,
        roughness: 0.8,
        metalness: 0.2
      });
      
      // Create wall mesh
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      scene.add(wall);
      wallRef.current = wall;
      
      // Add cracks (red line geometry)
      const createCrack = (startPoint, endPoint, width = 0.02) => {
        const crackMaterial = new THREE.MeshBasicMaterial({ color: 0xff4d4d });
        const points = [];
        points.push(new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z));
        points.push(new THREE.Vector3(endPoint.x, endPoint.y, endPoint.z));
        
        const crackGeometry = new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(points),
          20,
          width,
          8,
          false
        );
        
        const crack = new THREE.Mesh(crackGeometry, crackMaterial);
        crack.position.z = 0.26;
        scene.add(crack);
        return crack;
      };
      
      // Create several cracks
      const cracks = [];
      cracks.push(createCrack({ x: -3, y: 0, z: 0 }, { x: 1, y: 2, z: 0 }));
      cracks.push(createCrack({ x: 1, y: 2, z: 0 }, { x: 3, y: -1, z: 0 }));
      cracks.push(createCrack({ x: 0, y: -2, z: 0 }, { x: 2, y: 0, z: 0 }));
      cracks.push(createCrack({ x: -2, y: 1, z: 0 }, { x: -1, y: -1, z: 0 }));
      
      return { wall, cracks };
    };
    
    const { wall, cracks } = createWall();
    
    // Prepare wall fragments for shattering effect
    const prepareFragments = () => {
      const fragments = [];
      const wallGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        emissive: 0xff4d4d,
        emissiveIntensity: 0.5,
        roughness: 0.7,
        metalness: 0.3
      });
      
      for (let i = 0; i < 50; i++) {
        const fragment = new THREE.Mesh(wallGeometry, wallMaterial);
        
        // Distribute fragments across the wall area
        fragment.position.x = (Math.random() - 0.5) * 10;
        fragment.position.y = (Math.random() - 0.5) * 5;
        fragment.position.z = 0.25;
        
        // Randomize rotation
        fragment.rotation.x = Math.random() * Math.PI;
        fragment.rotation.y = Math.random() * Math.PI;
        fragment.rotation.z = Math.random() * Math.PI;
        
        // Initially hide fragments
        fragment.visible = false;
        scene.add(fragment);
        fragments.push(fragment);
      }
      
      fragmentsRef.current = fragments;
      return fragments;
    };
    
    const fragments = prepareFragments();
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (wallRef.current) {
        wallRef.current.rotation.y = Math.sin(Date.now() * 0.0005) * 0.1;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Animate wall shattering after 1 second
    setTimeout(() => {
      // Hide the wall
      wall.visible = false;
      
      // Show and animate fragments
      fragments.forEach((fragment, i) => {
        fragment.visible = true;
        
        gsap.to(fragment.position, {
          x: fragment.position.x + (Math.random() - 0.5) * 15,
          y: fragment.position.y + (Math.random() - 0.5) * 15,
          z: fragment.position.z + Math.random() * 10,
          duration: 2.5,
          ease: "power2.out",
          delay: i * 0.01
        });
        
        gsap.to(fragment.rotation, {
          x: fragment.rotation.x + Math.random() * Math.PI * 2,
          y: fragment.rotation.y + Math.random() * Math.PI * 2,
          z: fragment.rotation.z + Math.random() * Math.PI * 2,
          duration: 2,
          ease: "power1.out",
          delay: i * 0.01
        });
        
        gsap.to(fragment.material, {
          opacity: 0,
          duration: 1.5,
          delay: 1 + i * 0.01,
          onComplete: () => {
            scene.remove(fragment);
          }
        });
      });
      
      // Reveal calm horizon after wall shatters
      const horizonGeometry = new THREE.PlaneGeometry(20, 10);
      const horizonMaterial = new THREE.MeshBasicMaterial({
        color: 0x16213e,
        transparent: true,
        opacity: 0
      });
      
      const horizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
      horizon.position.z = -5;
      scene.add(horizon);
      
      gsap.to(horizonMaterial, {
        opacity: 1,
        duration: 2,
        delay: 1
      });
      
      // Add stars to the horizon
      const starGeometry = new THREE.BufferGeometry();
      const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0
      });
      
      const starPositions = [];
      for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 30;
        const y = (Math.random() - 0.5) * 20;
        const z = -Math.random() * 10 - 5;
        starPositions.push(x, y, z);
      }
      
      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);
      
      gsap.to(starMaterial, {
        opacity: 0.8,
        duration: 2,
        delay: 2
      });
    }, 1000);
    
    // Handle window resizing
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Dispose of geometries and materials
      if (wallRef.current) {
        wallRef.current.geometry.dispose();
        wallRef.current.material.dispose();
      }
      
      renderer.dispose();
      
      // Remove all animation frames
      cancelAnimationFrame(animate);
    };
  }, []);
  
  // GSAP animations for text elements
  useEffect(() => {
    if (headlineRef.current && subheadRef.current && buttonRef.current) {
      // Headline animation
      gsap.fromTo(
        headlineRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.5, delay: 1.5, ease: "elastic.out(1, 0.3)" }
      );
      
      // Subheadline animation
      gsap.fromTo(
        subheadRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 2, ease: "power3.out" }
      );
      
      // Button animation - pulsing effect
      gsap.to(buttonRef.current, {
        scale: 1.05,
        boxShadow: '0 0 20px rgba(255, 77, 77, 0.7)',
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    }
  }, []);
  
  return (
    <div className="landing">
      <section className="hero">
        <canvas ref={canvasRef} className="hero-canvas"></canvas>
        <div className="hero-content">
          <h1 ref={headlineRef}>Break Your Burnout</h1>
          <h2 ref={subheadRef}>Tools for Founders on the Edge</h2>
          <button ref={buttonRef} className="cta-button" onClick={() => setCurrentPage('therapy')}>
            Start Recovery
          </button>
        </div>
      </section>
      
      <section className="features">
        <Card title="Expert Therapy" delay={2.2} setCurrentPage={setCurrentPage} />
        <Card title="Focused Coaching" delay={2.4} setCurrentPage={setCurrentPage} />
        <Card title="Founder Community" delay={2.6} setCurrentPage={setCurrentPage} />
      </section>
    </div>
  );
}

export default Landing; 