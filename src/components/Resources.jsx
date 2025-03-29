import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import Header from './Header';

// ResourceCard Component
const ResourceCard = ({ title, description, index }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    
    // Initial position - fragments offscreen
    gsap.set(card, { 
      opacity: 0, 
      y: 100, 
      rotationX: 45,
      transformOrigin: "center center" 
    });
    
    // Animate card assembly with stagger
    gsap.to(card, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 1.2,
      delay: 0.25 * index + 2.5, // Start after bookshelf animation
      ease: "back.out(1.7)"
    });
    
    // 3D tilt effect on hover
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        rotateY: 10,
        rotateX: -5,
        scale: 1.05,
        boxShadow: '0 15px 30px rgba(255, 77, 77, 0.3)',
        duration: 0.4,
        ease: "power2.out"
      });
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        scale: 1,
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
        duration: 0.6,
        ease: "power2.out"
      });
    });
    
    return () => {
      card.removeEventListener('mouseenter', () => {});
      card.removeEventListener('mouseleave', () => {});
    };
  }, [index]);
  
  return (
    <div className="resource-card" ref={cardRef}>
      <div className="card-content">
        <h3>{title}</h3>
        <p>{description}</p>
        <button className="resource-button">View Resource</button>
      </div>
    </div>
  );
};

const Resources = ({ setCurrentPage }) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const bookshelfRef = useRef(null);
  const bookPanelsRef = useRef([]);
  const headlineRef = useRef(null);
  const subheadRef = useRef(null);
  const buttonRef = useRef(null);
  
  // Resources data
  const resources = [
    {
      title: "Burnout Recovery 101",
      description: "Essential strategies to recognize burnout signs and implement immediate recovery tactics that restore balance and focus."
    },
    {
      title: "Fundraising Mindset",
      description: "Mental frameworks for maintaining confidence and resilience through the emotional rollercoaster of raising capital."
    },
    {
      title: "Co-founder Harmony",
      description: "Communication techniques and conflict resolution strategies for maintaining strong partnerships during high-stress periods."
    },
    {
      title: "Sleep Hacks",
      description: "Science-backed methods to optimize sleep quality and duration, even during the most demanding startup phases."
    },
    {
      title: "Anxiety Toolkit",
      description: "Practical exercises and cognitive techniques to manage entrepreneurial anxiety and transform it into productive energy."
    }
  ];
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Scene setup
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 2, 3);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xff4d4d, 1, 10);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);
    
    // Create bookshelf
    const createBookshelf = () => {
      // Bookshelf geometry
      const shelfGeometry = new THREE.BoxGeometry(4, 3, 0.4);
      
      // Create a scorched wood texture
      const textureLoader = new THREE.TextureLoader();
      const woodTexture = textureLoader.load('https://cdn.pixabay.com/photo/2015/11/08/05/58/wood-1033063_1280.jpg', (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
      });
      
      // Create a custom shader material for the scorched effect
      const shelfMaterial = new THREE.MeshStandardMaterial({
        map: woodTexture,
        roughness: 0.7,
        metalness: 0.2,
        color: 0x663300,
        emissive: 0xff4d4d,
        emissiveIntensity: 0.2
      });
      
      // Create mesh
      const bookshelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
      bookshelf.castShadow = true;
      bookshelf.receiveShadow = true;
      scene.add(bookshelf);
      bookshelfRef.current = bookshelf;
      
      // Add crack effects to bookshelf
      const addCracks = () => {
        const crackCount = 8;
        
        for (let i = 0; i < crackCount; i++) {
          const crackGeometry = new THREE.BoxGeometry(0.05, Math.random() * 1.5 + 0.5, 0.1);
          const crackMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff4d4d,
            transparent: true,
            opacity: 0.8
          });
          
          const crack = new THREE.Mesh(crackGeometry, crackMaterial);
          
          // Position cracks randomly on the bookshelf
          crack.position.x = Math.random() * 3 - 1.5;
          crack.position.y = Math.random() * 2 - 1;
          crack.position.z = 0.21;
          
          // Rotate cracks randomly
          crack.rotation.z = Math.random() * Math.PI / 4 - Math.PI / 8;
          
          bookshelf.add(crack);
        }
      };
      
      addCracks();
      
      return bookshelf;
    };
    
    // Create resource panels (books)
    const createResourcePanels = () => {
      const panels = [];
      
      resources.forEach((resource, index) => {
        // Panel geometry
        const panelGeometry = new THREE.BoxGeometry(1.5, 0.8, 0.1);
        
        // Panel material with gradient and edge glow
        const panelMaterial = new THREE.MeshStandardMaterial({
          color: 0x1e1e1e,
          roughness: 0.3,
          metalness: 0.7,
          emissive: 0xff4d4d,
          emissiveIntensity: 0.1
        });
        
        // Create panel mesh
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        
        // Set initial position inside bookshelf
        panel.position.set(0, 0, 0.1);
        panel.visible = false; // Hide initially
        
        // Add to scene
        bookshelfRef.current.add(panel);
        panels.push(panel);
        
        // Create text for panel
        const createTextPlane = (text) => {
          // Create canvas for text
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = 512;
          canvas.height = 256;
          
          // Background
          context.fillStyle = '#1e1e1e';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          // Text
          context.font = 'bold 36px Arial';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillStyle = '#ffffff';
          
          // Add text with word wrapping
          const words = text.split(' ');
          let line = '';
          let y = 128;
          const lineHeight = 40;
          let lines = 0;
          
          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = context.measureText(testLine);
            
            if (metrics.width > 460 && i > 0) {
              context.fillText(line, canvas.width / 2, y - lineHeight * (lines - 1));
              line = words[i] + ' ';
              lines++;
            } else {
              line = testLine;
            }
          }
          
          context.fillText(line, canvas.width / 2, y + lineHeight * lines);
          
          // Add red border
          context.strokeStyle = '#ff4d4d';
          context.lineWidth = 8;
          context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
          
          // Create texture from canvas
          const texture = new THREE.CanvasTexture(canvas);
          
          // Create material with the texture
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.FrontSide
          });
          
          // Create plane geometry
          const geometry = new THREE.PlaneGeometry(1.4, 0.7);
          
          // Create mesh with geometry and material
          const plane = new THREE.Mesh(geometry, material);
          
          // Position slightly in front of panel
          plane.position.z = 0.06;
          
          return plane;
        };
        
        // Add text to panel
        const textPlane = createTextPlane(resource.title);
        panel.add(textPlane);
      });
      
      bookPanelsRef.current = panels;
      return panels;
    };
    
    createBookshelf();
    createResourcePanels();
    
    // Animation loop
    const animate = () => {
      if (!rendererRef.current) return;
      
      requestAnimationFrame(animate);
      
      // Subtle animation for bookshelf
      if (bookshelfRef.current) {
        bookshelfRef.current.rotation.y = Math.sin(Date.now() * 0.0005) * 0.03;
      }
      
      // Animate resource panels
      bookPanelsRef.current.forEach((panel) => {
        if (panel.visible) {
          panel.rotation.y = Math.sin(Date.now() * 0.001 + panel.position.x) * 0.1;
        }
      });
      
      // Render
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Animation timeline
    const tl = gsap.timeline();
    
    // Bookshelf cracking animation
    tl.to(bookshelfRef.current.scale, {
      x: 1.05,
      y: 1.05,
      z: 1.05,
      duration: 0.5,
      ease: "power2.inOut"
    })
    .to(bookshelfRef.current.rotation, {
      x: 0.05,
      y: 0.1,
      z: -0.05,
      duration: 0.5,
      ease: "power2.inOut"
    }, "<")
    .to(bookshelfRef.current.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.5,
      ease: "elastic.out(1, 0.5)"
    })
    .to(bookshelfRef.current.children, {
      scaleX: 2,
      scaleY: 1.5,
      duration: 0.3,
      stagger: 0.05,
      ease: "power2.out"
    })
    .to(bookshelfRef.current.material, {
      emissiveIntensity: 0.6,
      duration: 0.5,
      onComplete: () => {
        // Make panels visible and animate them out
        bookPanelsRef.current.forEach((panel, index) => {
          panel.visible = true;
          
          // Calculate position in a circular pattern
          const angle = (index / bookPanelsRef.current.length) * Math.PI * 2;
          const radius = 3;
          const targetX = Math.cos(angle) * radius;
          const targetY = Math.sin(angle) * radius;
          
          gsap.to(panel.position, {
            x: targetX,
            y: targetY,
            z: 1,
            duration: 1.5,
            delay: index * 0.1,
            ease: "back.out(1.7)"
          });
          
          gsap.to(panel.rotation, {
            y: Math.PI * 2,
            duration: 1.5,
            delay: index * 0.1,
            ease: "power2.inOut"
          });
        });
      }
    }, "<");
    
    // Text animations
    const animateHeadline = () => {
      const headline = headlineRef.current;
      if (!headline) return;
      
      gsap.fromTo(headline, 
        {
          opacity: 0,
          scale: 0,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 1.5,
          delay: 0.5,
          ease: "elastic.out(1, 0.5)"
        }
      );
    };
    
    const animateSubhead = () => {
      const subhead = subheadRef.current;
      if (!subhead) return;
      
      // Container for spark particles
      const sparkContainer = document.createElement('div');
      sparkContainer.className = 'spark-container';
      subhead.parentElement.appendChild(sparkContainer);
      
      // Create sparks
      for (let i = 0; i < 15; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark';
        spark.style.left = `${Math.random() * 100}%`;
        spark.style.animationDelay = `${Math.random() * 2}s`;
        sparkContainer.appendChild(spark);
      }
      
      // Animate subhead
      gsap.fromTo(subhead,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 1.2,
          ease: "power3.out"
        }
      );
    };
    
    // Button animation
    const setupButtonEffect = () => {
      const button = buttonRef.current;
      if (!button) return;
      
      button.addEventListener('click', (e) => {
        // Prevent default button behavior
        e.preventDefault();
        
        // Clone the button for shattering effect
        const buttonRect = button.getBoundingClientRect();
        const fragmentCount = 8;
        const fragmentContainer = document.createElement('div');
        fragmentContainer.className = 'shatter-container';
        fragmentContainer.style.position = 'absolute';
        fragmentContainer.style.left = `${buttonRect.left}px`;
        fragmentContainer.style.top = `${buttonRect.top}px`;
        fragmentContainer.style.width = `${buttonRect.width}px`;
        fragmentContainer.style.height = `${buttonRect.height}px`;
        fragmentContainer.style.pointerEvents = 'none';
        document.body.appendChild(fragmentContainer);
        
        // Create fragments
        for (let i = 0; i < fragmentCount; i++) {
          const fragment = document.createElement('div');
          fragment.className = 'button-fragment';
          fragment.textContent = i === 0 ? 'Dive' : i === 1 ? 'In' : '';
          fragment.style.backgroundColor = '#ff4d4d';
          fragment.style.color = 'white';
          fragment.style.position = 'absolute';
          
          // Size each fragment
          const width = buttonRect.width / 2;
          const height = buttonRect.height / 2;
          fragment.style.width = `${width}px`;
          fragment.style.height = `${height}px`;
          
          // Position fragments to form the button shape
          const row = Math.floor(i / 2);
          const col = i % 2;
          fragment.style.left = `${col * width}px`;
          fragment.style.top = `${row * height}px`;
          
          // Add overflow hidden and text positioning
          fragment.style.overflow = 'hidden';
          fragment.style.display = 'flex';
          fragment.style.justifyContent = col === 0 ? 'flex-end' : 'flex-start';
          fragment.style.alignItems = row === 0 ? 'flex-end' : 'flex-start';
          fragment.style.paddingLeft = col === 0 ? '0' : '10px';
          fragment.style.paddingRight = col === 0 ? '10px' : '0';
          
          fragmentContainer.appendChild(fragment);
          
          // Animate fragment explosion
          gsap.to(fragment, {
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 200,
            rotation: Math.random() * 360,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            onComplete: () => {
              if (i === fragmentCount - 1) {
                // Remove fragment container when all animations complete
                document.body.removeChild(fragmentContainer);
                
                // Navigate to home page
                setCurrentPage('home');
              }
            }
          });
        }
        
        // Hide original button during effect
        gsap.to(button, {
          opacity: 0,
          scale: 0.8,
          duration: 0.2
        });
      });
    };
    
    // Start animations after a delay
    setTimeout(() => {
      animateHeadline();
      animateSubhead();
      setupButtonEffect();
    }, 500);
    
    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      // Clean up all geometries and materials
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) {
              object.geometry.dispose();
            }
            
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
              } else {
                object.material.dispose();
              }
            }
          }
        });
        
        sceneRef.current.clear();
      }
    };
  }, [resources, setCurrentPage]);
  
  return (
    <div className="resources-page">
      <div className="hero-section">
        <canvas ref={canvasRef} className="resources-canvas"></canvas>
        <div className="resources-content">
          <h1 ref={headlineRef}>Fuel Your Fight</h1>
          <h2 ref={subheadRef}>Tools to Break the Grind</h2>
          <button className="dive-button" ref={buttonRef}>Dive In</button>
        </div>
      </div>
      
      <div className="resources-container">
        <div className="resources-section">
          <h2>Knowledge Arsenal</h2>
          <div className="resource-cards">
            {resources.map((resource, index) => (
              <ResourceCard 
                key={index}
                title={resource.title}
                description={resource.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources; 