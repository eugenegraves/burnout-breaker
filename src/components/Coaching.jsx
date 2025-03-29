import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import Header from './Header';

// CoachingCard component for benefits
const CoachingCard = ({ title, description, delay, index }) => {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  
  useEffect(() => {
    if (!cardRef.current) return;
    
    // Initial hidden state
    gsap.set(cardRef.current, {
      opacity: 0,
      y: 50,
      rotationY: -45,
      transformOrigin: "center center"
    });
    
    // Animation to assemble card
    gsap.to(cardRef.current, {
      opacity: 1,
      y: 0,
      rotationY: 0,
      duration: 1.2,
      delay: delay,
      ease: "power3.out"
    });
  }, [delay]);
  
  useEffect(() => {
    if (!cardRef.current) return;
    
    if (hovered) {
      gsap.to(cardRef.current, {
        scale: 1.05,
        rotationY: 5,
        boxShadow: "0 15px 30px rgba(255, 77, 77, 0.3)",
        duration: 0.3
      });
    } else {
      gsap.to(cardRef.current, {
        scale: 1,
        rotationY: 0,
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
        duration: 0.3
      });
    }
  }, [hovered]);
  
  return (
    <div 
      className={`coaching-card card-${index}`}
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="card-content">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="card-icon">
          {index === 0 && <span className="icon">🔄</span>}
          {index === 1 && <span className="icon">🎯</span>}
          {index === 2 && <span className="icon">🚀</span>}
        </div>
      </div>
    </div>
  );
};

function Coaching({ setCurrentPage }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const wheelRef = useRef(null);
  const segmentsRef = useRef([]);
  const buttonRef = useRef(null);
  const headlineRef = useRef(null);
  const subheadRef = useRef(null);
  
  // Coaching benefits data
  const benefits = [
    {
      title: "Burnout Reset",
      description: "Recalibrate your energy and rediscover your passion through targeted executive coaching."
    },
    {
      title: "Focus Hacks",
      description: "Learn practical techniques to eliminate distractions and maximize your productive flow state."
    },
    {
      title: "Pivot Power",
      description: "Build resilience and agility to navigate change and transform challenges into opportunities."
    }
  ];
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Scene setup
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 8;
    cameraRef.current = camera;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xff4d4d, 2, 20);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);
    
    // Create progress wheel
    const createWheel = () => {
      const wheelGeometry = new THREE.TorusGeometry(3, 0.5, 16, 50);
      
      // Create cracked texture material
      const wheelMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        emissive: 0xff4d4d,
        emissiveIntensity: 0.2,
        roughness: 0.7,
        metalness: 0.3
      });
      
      // Add cracks to wheel
      const addCracks = (material) => {
        const cracks = new THREE.Group();
        
        // Create several crack lines across the torus
        for (let i = 0; i < 15; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 3 + (Math.random() * 0.5 - 0.25);
          
          const crackGeometry = new THREE.BoxGeometry(0.05, 0.4, 0.05);
          const crackMaterial = new THREE.MeshBasicMaterial({ color: 0xff4d4d });
          const crack = new THREE.Mesh(crackGeometry, crackMaterial);
          
          crack.position.x = radius * Math.cos(angle);
          crack.position.y = radius * Math.sin(angle);
          crack.rotation.z = angle + Math.PI/2;
          
          cracks.add(crack);
        }
        
        return cracks;
      };
      
      // Create wheel and add cracks
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.x = Math.PI / 2;
      scene.add(wheel);
      
      const cracks = addCracks(wheelMaterial);
      wheel.add(cracks);
      
      wheelRef.current = wheel;
      
      return wheel;
    };
    
    const wheel = createWheel();
    
    // Create wheel segments (for splitting animation)
    const createSegments = () => {
      const segments = [];
      const segmentNames = ['Assess', 'Strategize', 'Execute'];
      
      // Create three equal segments
      for (let i = 0; i < 3; i++) {
        const segmentGeometry = new THREE.TorusGeometry(3, 0.5, 8, 16, Math.PI * 2 / 3);
        
        const segmentMaterial = new THREE.MeshStandardMaterial({
          color: 0x1a1a2e,
          emissive: 0xff4d4d,
          emissiveIntensity: 0.3,
          roughness: 0.7,
          metalness: 0.3
        });
        
        const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
        segment.rotation.x = Math.PI / 2;
        segment.rotation.z = (i * Math.PI * 2 / 3);
        
        // Position segment off-screen initially
        segment.position.set(0, 0, -20);
        segment.visible = false;
        
        scene.add(segment);
        segments.push(segment);
      }
      
      segmentsRef.current = segments;
      return segments;
    };
    
    // Let's create the segments but handle the font issue differently
    // Instead of using text geometry, we'll manually create text labels later
    const createSimpleSegments = () => {
      const segments = [];
      const colors = [0xff3333, 0xff5555, 0xff7777];
      
      // Create three equal segments
      for (let i = 0; i < 3; i++) {
        const segmentGeometry = new THREE.TorusGeometry(3, 0.5, 8, 16, Math.PI * 2 / 3);
        
        const segmentMaterial = new THREE.MeshStandardMaterial({
          color: 0x1a1a2e,
          emissive: colors[i],
          emissiveIntensity: 0.4,
          roughness: 0.7,
          metalness: 0.5
        });
        
        const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
        segment.rotation.x = Math.PI / 2;
        segment.rotation.z = (i * Math.PI * 2 / 3);
        
        // Position segment off-screen initially
        segment.position.set(0, 0, -20);
        segment.visible = false;
        
        scene.add(segment);
        segments.push(segment);
      }
      
      segmentsRef.current = segments;
      return segments;
    };
    
    const segments = createSimpleSegments();
    
    // Create central glowing core
    const createCore = () => {
      const coreGeometry = new THREE.SphereGeometry(1, 32, 32);
      const coreMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4d4d,
        emissive: 0xff4d4d,
        emissiveIntensity: 1,
        roughness: 0.3,
        metalness: 0.7
      });
      
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      core.position.set(0, 0, 0);
      core.scale.set(0, 0, 0); // Start with zero scale
      
      scene.add(core);
      
      // Add glow effect
      const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4d4d,
        transparent: true,
        opacity: 0.3
      });
      
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      core.add(glow);
      
      return core;
    };
    
    const core = createCore();
    
    // Animation timeline
    const timeline = gsap.timeline({
      delay: 0.5,
      onStart: () => {
        // Initial wheel animation
        gsap.to(wheel.rotation, {
          z: Math.PI * 2,
          duration: 3,
          ease: "power1.inOut",
          repeat: -1
        });
      }
    });
    
    // Animate wheel splitting into segments
    timeline.to(wheel.scale, {
      x: 1.2,
      y: 1.2,
      z: 1.2,
      duration: 0.5,
      ease: "power2.out"
    });
    
    timeline.to(wheel, {
      visible: false,
      duration: 0.1,
      onComplete: () => {
        // Make segments visible
        segments.forEach(segment => {
          segment.visible = true;
          segment.position.set(0, 0, 0);
        });
      }
    });
    
    // Explode segments outward
    timeline.to(segments.map(s => s.position), {
      x: (i) => Math.cos(i * Math.PI * 2 / 3) * 4,
      y: (i) => Math.sin(i * Math.PI * 2 / 3) * 4,
      duration: 1,
      ease: "power2.out",
      stagger: 0.1
    });
    
    // Show core
    timeline.to(core.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.8,
      ease: "elastic.out(1, 0.5)"
    }, "-=0.5");
    
    // Set segments into orbit
    timeline.to(segments.map(s => s.position), {
      x: (i) => Math.cos(i * Math.PI * 2 / 3) * 5,
      y: (i) => Math.sin(i * Math.PI * 2 / 3) * 5,
      duration: 1,
      ease: "power2.inOut"
    });
    
    // Add orbital rotation to segments
    const orbitSpeed = 5; // seconds per rotation
    
    // Animation loop
    const clock = new THREE.Clock();
    let animationId;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Get elapsed time
      const elapsedTime = clock.getElapsedTime();
      
      // Rotate segments in orbit
      segments.forEach((segment, i) => {
        if (segment.visible) {
          const angle = elapsedTime * (Math.PI * 2 / orbitSpeed) + (i * Math.PI * 2 / 3);
          segment.position.x = Math.cos(angle) * 5;
          segment.position.y = Math.sin(angle) * 5;
          segment.rotation.z = angle + Math.PI/2;
        }
      });
      
      // Pulsate core
      if (core) {
        const pulse = Math.sin(elapsedTime * 2) * 0.1 + 1;
        core.scale.set(pulse, pulse, pulse);
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resizing
    const handleResize = () => {
      if (!canvasRef.current) return;
      
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      // Dispose of all geometries and materials
      if (wheelRef.current) {
        wheelRef.current.geometry.dispose();
        wheelRef.current.material.dispose();
        scene.remove(wheelRef.current);
      }
      
      segmentsRef.current.forEach(segment => {
        if (segment) {
          segment.geometry.dispose();
          segment.material.dispose();
          scene.remove(segment);
        }
      });
      
      // Clean up all resources
      while(scene.children.length > 0) { 
        const object = scene.children[0];
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
        scene.remove(object); 
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);
  
  // GSAP animations for text elements
  useEffect(() => {
    if (headlineRef.current && subheadRef.current) {
      // Animate headline
      gsap.fromTo(
        headlineRef.current,
        { 
          scale: 0, 
          opacity: 0 
        },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 1.5, 
          delay: 1.2, 
          ease: "elastic.out(1, 0.3)" 
        }
      );
      
      // Animate subheadline
      gsap.fromTo(
        subheadRef.current,
        { 
          y: 50, 
          opacity: 0 
        },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1, 
          delay: 2,
          ease: "power3.out"
        }
      );
      
      // Add fiery trail effect to subhead
      gsap.to(subheadRef.current, {
        textShadow: "0 0 20px rgba(255, 77, 77, 0.8)",
        color: "#ff4d4d",
        delay: 2.3,
        duration: 0.7
      });
    }
  }, []);
  
  // Button spark effect
  const createSparkBurst = () => {
    if (!buttonRef.current) return;
    
    // Create spark element
    const createSpark = () => {
      const spark = document.createElement('div');
      spark.className = 'spark';
      spark.style.left = `${Math.random() * 100}%`;
      spark.style.top = `${Math.random() * 100}%`;
      const size = 3 + Math.random() * 6;
      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      buttonRef.current.appendChild(spark);
      
      // Animate spark
      gsap.to(spark, {
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
        opacity: 0,
        scale: 0,
        duration: 0.8,
        ease: "power1.out",
        onComplete: () => {
          if (spark.parentNode) {
            spark.parentNode.removeChild(spark);
          }
        }
      });
    };
    
    // Create multiple sparks
    for (let i = 0; i < 25; i++) {
      setTimeout(createSpark, i * 15);
    }
    
    // Add button animation
    gsap.to(buttonRef.current, {
      scale: 1.1,
      boxShadow: "0 0 20px rgba(255, 77, 77, 0.8)",
      duration: 0.3,
      yoyo: true,
      repeat: 1
    });
  };
  
  // Add navigation to Community page on button click
  const handleStartButtonClick = (e) => {
    // Create spark/glow effect if any
    
    // Navigate to community page
    setTimeout(() => {
      setCurrentPage('community');
    }, 600);
  };
  
  return (
    <div className="coaching-page">
      <div className="coaching-container">
        <section className="hero-section">
          <canvas ref={canvasRef} className="wheel-canvas" />
          
          <div className="coaching-content">
            <h1 ref={headlineRef}>Crush Your Chaos</h1>
            <h2 ref={subheadRef}>Coaching to Ignite Your Edge</h2>
            
            <button 
              ref={buttonRef} 
              className="start-button"
              onClick={handleStartButtonClick}
            >
              Start Coaching
            </button>
          </div>
        </section>
        
        <section className="benefits-section">
          <h2>Transform Your Performance</h2>
          
          <div className="coaching-cards">
            {benefits.map((benefit, index) => (
              <CoachingCard 
                key={index}
                title={benefit.title}
                description={benefit.description}
                delay={3.5 + index * 1} // Stagger delay
                index={index}
              />
            ))}
          </div>
        </section>
        
        <section className="method-section">
          <h2>Our Coaching Approach</h2>
          <div className="method-steps">
            <div className="step">
              <span className="step-number">01</span>
              <h3>Assess</h3>
              <p>Deep dive into your current state, challenges, and untapped potential.</p>
            </div>
            <div className="step">
              <span className="step-number">02</span>
              <h3>Strategize</h3>
              <p>Develop personalized frameworks to optimize your performance and leadership.</p>
            </div>
            <div className="step">
              <span className="step-number">03</span>
              <h3>Execute</h3>
              <p>Implement proven techniques with accountability and iterative improvements.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Coaching; 