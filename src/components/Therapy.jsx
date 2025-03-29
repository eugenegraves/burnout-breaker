import { useEffect, useRef, useState, createRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import Header from './Header';

function Therapy({ setCurrentPage }) {
  // All hooks need to be at the top level and in the same order every render
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const cardRef = useRef(null);
  const fragmentsRef = useRef([]);
  const buttonRef = useRef(null);
  const [isShattered, setIsShattered] = useState(false);
  const [focusRevealed, setFocusRevealed] = useState([false, false, false]);
  
  const therapyFocuses = [
    'Burnout',
    'Imposter Syndrome',
    'Co-founder Conflict'
  ];
  
  // Initialize the array of refs for focus items
  const focusRefs = useRef([]);
  
  // Setup focus refs
  useEffect(() => {
    // This ensures we always have the right number of refs
    focusRefs.current = Array(therapyFocuses.length)
      .fill()
      .map((_, i) => focusRefs.current[i] || createRef());
  }, [therapyFocuses.length]);
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Scene setup
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 5;
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xff4d4d, 1.5, 10);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);
    
    // Create therapist profile card
    const createCard = () => {
      // Card geometry with red cracks
      const textureLoader = new THREE.TextureLoader();
      const cardGeometry = new THREE.BoxGeometry(3, 4, 0.2);
      const cardMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        emissive: 0xff4d4d,
        emissiveIntensity: 0.1,
        roughness: 0.7,
        metalness: 0.3
      });
      
      // Create card mesh
      const card = new THREE.Mesh(cardGeometry, cardMaterial);
      scene.add(card);
      cardRef.current = card;
      
      // Add cracks (red line geometry)
      const createCrack = (startPoint, endPoint, width = 0.01) => {
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
        crack.position.z = 0.11;
        scene.add(crack);
        return crack;
      };
      
      // Create several cracks
      const cracks = [];
      cracks.push(createCrack({ x: -1, y: 0.5, z: 0 }, { x: 0.8, y: 1.5, z: 0 }));
      cracks.push(createCrack({ x: 0.8, y: 1.5, z: 0 }, { x: 0.2, y: -0.5, z: 0 }));
      cracks.push(createCrack({ x: 0.2, y: -0.5, z: 0 }, { x: -0.5, y: -1.5, z: 0 }));
      cracks.push(createCrack({ x: -0.8, y: 0, z: 0 }, { x: 0, y: -1, z: 0 }));
      
      return { card, cracks };
    };
    
    const { card, cracks } = createCard();
    
    // Prepare card fragments for shattering effect
    const prepareFragments = () => {
      const fragments = [];
      const fragmentGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.2);
      const fragmentMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        emissive: 0xff4d4d,
        emissiveIntensity: 0.3,
        roughness: 0.7,
        metalness: 0.3,
        transparent: true
      });
      
      for (let i = 0; i < 40; i++) {
        const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial.clone());
        
        // Distribute fragments across the card area
        fragment.position.x = (Math.random() - 0.5) * 3;
        fragment.position.y = (Math.random() - 0.5) * 4;
        fragment.position.z = 0.1;
        
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
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      if (cardRef.current && !isShattered) {
        cardRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
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
      
      // Dispose of geometries and materials
      if (cardRef.current) {
        cardRef.current.geometry.dispose();
        cardRef.current.material.dispose();
        scene.remove(cardRef.current);
      }
      
      fragmentsRef.current.forEach(fragment => {
        if (fragment) {
          fragment.geometry.dispose();
          fragment.material.dispose();
          scene.remove(fragment);
        }
      });
      
      // Clean up cracks and other mesh resources
      while(scene.children.length > 0){ 
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
  }, [isShattered]);
  
  // Shatter effect function
  const shatterCard = () => {
    if (isShattered || !cardRef.current) return;
    
    setIsShattered(true);
    
    // Hide the card
    cardRef.current.visible = false;
    
    // Show and animate fragments
    fragmentsRef.current.forEach((fragment, i) => {
      fragment.visible = true;
      
      // Explode fragments outward
      gsap.to(fragment.position, {
        x: fragment.position.x + (Math.random() - 0.5) * 8,
        y: fragment.position.y + (Math.random() - 0.5) * 8,
        z: fragment.position.z + Math.random() * 5,
        duration: 1.5,
        ease: "power2.out",
        delay: i * 0.01
      });
      
      // Spin fragments
      gsap.to(fragment.rotation, {
        x: fragment.rotation.x + Math.random() * Math.PI * 4,
        y: fragment.rotation.y + Math.random() * Math.PI * 4,
        z: fragment.rotation.z + Math.random() * Math.PI * 4,
        duration: 1.5,
        ease: "power1.out",
        delay: i * 0.01
      });
      
      // Fade out fragments
      gsap.to(fragment.material, {
        opacity: 0,
        duration: 1,
        delay: 0.5 + i * 0.01
      });
    });
    
    // Reveal the therapy focuses
    setTimeout(() => {
      revealFocuses();
    }, 800);
  };
  
  // Reveal therapy focuses with animation
  const revealFocuses = () => {
    focusRefs.current.forEach((ref, index) => {
      setTimeout(() => {
        setFocusRevealed(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
        
        if (ref.current) {
          // Initial state
          gsap.set(ref.current, {
            opacity: 0,
            scale: 0.5,
            x: -50
          });
          
          // Animate in
          gsap.to(ref.current, {
            opacity: 1,
            scale: 1,
            x: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.5)"
          });
          
          // Add fiery glow effect
          gsap.to(ref.current, {
            textShadow: "0 0 15px rgba(255, 77, 77, 0.8)",
            color: "#ff4d4d",
            duration: 0.5,
            delay: 0.3
          });
        }
      }, index * 400);
    });
  };
  
  // Update button click handler to navigate to coaching
  const handleButtonClick = (e) => {
    // Create sparks effect
    for (let i = 0; i < 20; i++) {
      createSpark(e);
    }
    
    // Navigate to coaching page
    setTimeout(() => {
      setCurrentPage('coaching');
    }, 800);
  };
  
  return (
    <div className="therapy-page">
      <div className="therapy-container">
        <h1 className="therapy-title">Therapy Services</h1>
        
        <div className="therapist-profile">
          <div className="profile-card" onClick={shatterCard}>
            <canvas ref={canvasRef} className="profile-canvas" />
            {!isShattered && (
              <div className="profile-overlay">
                <img src="/placeholder-therapist.jpg" alt="Therapist" className="profile-image" />
                <div className="profile-info">
                  <h3>Dr. Sarah Johnson</h3>
                  <p>Specialized in Tech Founder Mental Health</p>
                  <p className="tap-instruction">Tap to reveal focus areas</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="therapy-focus">
            <h2>Our Therapy Focus Areas</h2>
            <ul className="focus-list">
              {therapyFocuses.map((focus, index) => (
                <li 
                  key={index} 
                  ref={focusRefs.current[index]} 
                  className={`focus-item ${focusRevealed[index] ? 'revealed' : ''}`}
                >
                  {focus}
                </li>
              ))}
            </ul>
            
            <button 
              ref={buttonRef} 
              className="book-button"
              onClick={handleButtonClick}
            >
              Book a Session
            </button>
          </div>
        </div>
        
        <div className="therapy-info">
          <div className="info-card">
            <h3>How it Works</h3>
            <p>Our specialized therapy sessions help founders and tech professionals navigate the unique stressors of the startup world. We combine cognitive behavioral therapy with mindfulness techniques specifically tailored for high-performers.</p>
          </div>
          
          <div className="info-card">
            <h3>Session Details</h3>
            <p>50-minute sessions available both virtually and in-person. We offer flexible scheduling to accommodate busy entrepreneurial lifestyles.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Therapy; 