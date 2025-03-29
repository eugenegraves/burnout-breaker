import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import Header from './Header';

// GroupCard component for community features
const GroupCard = ({ title, description, icon, index }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    
    // Initial position - fragments offscreen
    gsap.set(card, { 
      opacity: 0, 
      y: 50, 
      rotationY: -15, 
      rotationX: 10 
    });
    
    // Animate card assembly with stagger
    gsap.to(card, {
      opacity: 1,
      y: 0,
      rotationY: 0,
      rotationX: 0,
      duration: 1.2,
      delay: 0.3 * index,
      ease: "power3.out"
    });
    
    // Shatter effect on hover
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        rotationY: Math.random() * 5 - 2.5,
        rotationX: Math.random() * 5 - 2.5,
        y: -5,
        boxShadow: '0 15px 30px rgba(255, 77, 77, 0.3)',
        duration: 0.4
      });
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotationY: 0,
        rotationX: 0,
        y: 0,
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
        duration: 0.6
      });
    });
    
  }, [index]);
  
  return (
    <div className="group-card" ref={cardRef}>
      <div className="card-content">
        <div className="card-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

function Community({ setCurrentPage }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const avatarsRef = useRef([]);
  const carouselRef = useRef(null);
  const buttonRef = useRef(null);
  const headlineRef = useRef(null);
  const subheadRef = useRef(null);
  
  // State for animation controls
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Button ripple effect handler - moved outside useEffect to component scope
  const handleJoinButtonClick = (e) => {
    const button = buttonRef.current;
    if (!button) return;
    
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    button.appendChild(ripple);
    
    gsap.to(ripple, {
      width: '500px',
      height: '500px',
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      onComplete: () => {
        if (ripple.parentNode) {
          button.removeChild(ripple);
        }
        // Navigate to resources page
        setCurrentPage('resources');
      }
    });
  };
  
  // Group features data
  const groupFeatures = [
    {
      title: "Group Therapy Circles",
      description: "Weekly virtual sessions with fellow founders experiencing similar challenges. Share openly in a safe, confidential space facilitated by our burnout specialists.",
      icon: "🔄"
    },
    {
      title: "Local Meetups",
      description: "Connect with other founders in your area for in-person support and networking. Building real relationships with people who understand your unique struggles.",
      icon: "🌎"
    },
    {
      title: "Founder Forums",
      description: "Private online community where you can ask questions, share wins, and get tactical advice from peers who have overcome similar obstacles.",
      icon: "💬"
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
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xff4d4d, 1, 100);
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);
    
    // Create carousel group
    const carouselGroup = new THREE.Group();
    scene.add(carouselGroup);
    carouselRef.current = carouselGroup;
    
    // Creating founder avatars
    const avatarGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const avatarMaterial = new THREE.MeshStandardMaterial({
      color: 0xff4d4d,
      roughness: 0.7,
      metalness: 0.3,
      emissive: 0xff4d4d,
      emissiveIntensity: 0.2,
    });
    
    // Create 5 founder avatars
    const numAvatars = 5;
    const radius = 3; // Radius of the circle they will form
    
    for (let i = 0; i < numAvatars; i++) {
      const avatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
      
      // Set initial position at center
      avatar.position.set(0, 0, 0);
      
      // Store reference to avatar
      avatarsRef.current.push(avatar);
      
      // Add to carousel group
      carouselGroup.add(avatar);
    }
    
    // Animation loop
    const animate = () => {
      if (!rendererRef.current) return;
      
      requestAnimationFrame(animate);
      
      if (animationComplete) {
        // Rotate the carousel when animation is complete
        carouselRef.current.rotation.y += 0.005;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Animation timeline for initial explosion effect
    const tl = gsap.timeline({
      onComplete: () => setAnimationComplete(true)
    });
    
    // Explode avatars from center to form a circle
    avatarsRef.current.forEach((avatar, i) => {
      const angle = (i / numAvatars) * Math.PI * 2;
      const x = Math.sin(angle) * radius;
      const y = Math.cos(angle) * radius;
      
      tl.to(avatar.position, {
        x: x,
        y: y,
        duration: 2,
        ease: "elastic.out(1, 0.5)",
        delay: i * 0.1
      }, 0);
      
      // Add glow effect as they lock into place
      tl.to(avatar.material, {
        emissiveIntensity: 0.8,
        duration: 0.5,
        onComplete: () => {
          gsap.to(avatar.material, {
            emissiveIntensity: 0.3,
            duration: 1.5,
            yoyo: true,
            repeat: -1
          });
        }
      }, 1.5 + i * 0.1);
    });
    
    // Text animations
    const animateHeadline = () => {
      const headline = headlineRef.current;
      if (!headline) return;
      
      // Split text into spans for letter-by-letter animation
      const text = headline.textContent;
      headline.innerHTML = '';
      
      for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
        headline.appendChild(span);
      }
      
      const letters = headline.querySelectorAll('span');
      
      // Cracking animation
      gsap.fromTo(letters, 
        {
          opacity: 0,
          y: 50,
          rotationX: 90,
          scale: 0.8
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          scale: 1,
          duration: 0.08,
          stagger: 0.04,
          ease: "power2.out",
          onComplete: () => {
            // Crack effect
            letters.forEach((letter, i) => {
              gsap.to(letter, {
                rotationY: Math.random() * 15 - 7.5,
                rotationX: Math.random() * 10 - 5,
                duration: 0.3,
                delay: i * 0.02,
                yoyo: true,
                repeat: 1
              });
            });
          }
        }
      );
    };
    
    const animateSubhead = () => {
      const subhead = subheadRef.current;
      if (!subhead) return;
      
      // Fiery glow animation
      gsap.fromTo(subhead,
        {
          opacity: 0,
          y: 20,
          textShadow: "0 0 0px rgba(255, 77, 77, 0)"
        },
        {
          opacity: 1,
          y: 0,
          textShadow: "0 0 20px rgba(255, 77, 77, 0.8)",
          duration: 1.5,
          delay: 1.5,
          ease: "power2.out",
          onComplete: () => {
            // Pulsing glow effect
            gsap.to(subhead, {
              textShadow: "0 0 10px rgba(255, 77, 77, 0.4)",
              duration: 1.5,
              yoyo: true,
              repeat: -1
            });
          }
        }
      );
    };
    
    // Start animations after a delay
    setTimeout(() => {
      animateHeadline();
      animateSubhead();
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
      
      // Clean up geometries and materials
      avatarGeometry.dispose();
      avatarMaterial.dispose();
      
      // Clean up scene
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, [setCurrentPage]);
  
  return (
    <div className="community-page">
      <div className="hero-section">
        <canvas ref={canvasRef} className="community-canvas"></canvas>
        <div className="community-content">
          <h1 ref={headlineRef}>Your Breaker Tribe</h1>
          <h2 ref={subheadRef}>Connect, Vent, Rise Together</h2>
          <button 
            className="tribe-button" 
            ref={buttonRef} 
            onClick={handleJoinButtonClick}
          >
            Join the Tribe
          </button>
        </div>
      </div>
      
      <div className="community-container">
        <div className="groups-section">
          <h2>Founder Community Groups</h2>
          <div className="group-cards">
            {groupFeatures.map((feature, index) => (
              <GroupCard 
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                index={index}
              />
            ))}
          </div>
        </div>
        
        <div className="testimonials">
          <h2>What Founders Say</h2>
          <div className="testimonial-container">
            <blockquote>
              "The Breaker Tribe gave me a place to be vulnerable about my struggles when I couldn't show that face to my team or investors. It literally saved my company—and probably my marriage too."
              <cite>— Alex K., SaaS Founder</cite>
            </blockquote>
            <blockquote>
              "I was working 100-hour weeks and spiraling. The group therapy circles helped me realize I wasn't alone and gave me practical tools to build healthier boundaries."
              <cite>— Mira S., E-commerce Founder</cite>
            </blockquote>
            <blockquote>
              "What surprised me most was how much stronger my business became when I started prioritizing my mental health. This community showed me it's not selfish—it's strategic."
              <cite>— Jordan T., Agency Owner</cite>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Community; 