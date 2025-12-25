import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Line, Trail } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import * as THREE from 'three';
import Tilt from 'react-parallax-tilt';
import Typewriter from 'typewriter-effect';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Linkedin, Mail, ExternalLink, X, Cpu, Image as ImageIcon, ZoomIn, FileText, Code, ChevronLeft, ChevronRight } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

/* --- 0. ZUMO CODE --- */
const ZUMO_CODE = String.raw`#include <ZumoMotors.h>
#include <ZumoReflectanceSensorArray.h>
#include <ZumoBuzzer.h>

#define PIN_IR 6
#define PIN_LED 13
#define SENSORS_COUNT 6
#define THRESHOLD_WHITE 550 
#define NUM_TRIALS 10

ZumoMotors motors;
ZumoReflectanceSensorArray sensors;
ZumoBuzzer buzzer;

unsigned int sensorReadings[SENSORS_COUNT];
int dataValues[NUM_TRIALS];
int trialsCompleted = 0;
int objectCount = 0;
bool detectionPeriod = false;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_IR, INPUT);
  
  // Calibration Sequence
  digitalWrite(PIN_LED, HIGH); delay(3000);
  digitalWrite(PIN_LED, LOW);  delay(3000);
  sensors.init();
  for (int i = 0; i < 400; i++) {
    sensors.calibrate();
  }
  buzzer.play("!L16 V10 cdegreg4");
  delay(2000); 
}

void loop() {
  if (trialsCompleted < NUM_TRIALS) {
    moveUntilWhiteDetected();
    evaluateWhiteDetection();
  } else {
    int result = getMaxCount();
    delay(2000);
    blinkAndBuzz(result);
    motors.setSpeeds(0, 0); 
    while(true);
  }
}
`;

/* --- 1. DATA --- */
const PROJECTS_DATA = [
  {
    id: 'motor',
    title: "Axial Flux Motor",
    category: "Hardware Engineering",
    align: 'left',
    shortDesc: "Designed and built a custom axial flux permanent magnet motor from scratch. Features hand-wired coils, 3D-printed stator/rotor, and a custom PCB driver controlled wirelessly via NRF24 protocol.",
    tags: ['SolidWorks', 'PCB Design', 'Arduino', 'Electromagnetics'],
    mainImage: "/projects/motor/motor_3d.jpg",
    fullDesc: (
      <>
        <p>
          This project involved the complete lifecycle of creating a custom electric <strong>Axial Flux Permanent Magnet (AFPM)</strong> motor. 
          The primary goal was to design a motor from scratch, fabricate its components including hand-wiring the coils, and integrate a remote control system.
        </p>
        <h3 className="mono" style={{ color: '#66fcf1', marginTop: '20px', fontSize: '18px' }}>Key Technologies:</h3>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
          <li><strong>Custom Motor Design:</strong> Designed stator/rotor geometry and magnet placement for high torque density.</li>
          <li><strong>Fabrication:</strong> 3D printed housing (PLA/PETG) and hand-wound copper coils.</li>
          <li><strong>Electronics:</strong> Designed a compact PCB using KiCad for the L298N driver and NRF24L01+ wireless module.</li>
          <li><strong>Control:</strong> Implemented PID speed control on an Arduino Nano.</li>
        </ul>
      </>
    ),
    codeSnippet: null,
    slidesEmbed: "https://docs.google.com/presentation/d/e/2PACX-1vQUBwMfczfqOUSYRqaiwsZp53p_EiTMHzFyXLCIYR8RwIXHhLEea2tcqHZBJlwc2g/embed?start=false&loop=false&delayms=15000",
    reports: [],
    gallery: [
      "/projects/motor/motor_3d.jpg",
      "/projects/motor/motoric.jfif",
      "/projects/motor/motor-inside-wiring.jpeg",
      "/projects/motor/overall-motor.jpeg",
      "/projects/motor/refkumandaalici.jpeg",
      "/projects/motor/refkumandaverici.jpeg"
    ]
  },
  {
    id: 'zumo',
    title: "Zumo Robot Vision",
    category: "Robotics & AI",
    align: 'right',
    shortDesc: "An autonomous rover algorithm developed to count objects within a confined circular arena. Utilizes IR sensors for detection and a Reflectance Array for boundary confinement, running 10 statistical trials for accuracy.",
    tags: ['C++', 'Embedded Systems', 'IR Sensors', 'Automation'],
    mainImage: "/projects/zumo/zumo-on-mission.png", 
    fullDesc: (
      <>
        <p>
           This system utilizes a Zumo robot chassis to perform autonomous object counting tasks within a white-tape bounded arena. 
           The core challenge was to overcome sensor noise and blind spots to accurately tally obstacles.
        </p>
        <h3 className="mono" style={{ color: '#66fcf1', marginTop: '20px', fontSize: '18px' }}>Operational Logic:</h3>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
          <li><strong>Boundary Confinement:</strong> The robot uses a 6-sensor Reflectance Array to detect the arena edge (White Threshold > 550). When the edge is detected, it executes an evasive turn.</li>
          <li><strong>Object Detection:</strong> A digital IR sensor (Pin 6) scans for obstacles while the robot traverses the arena.</li>
          <li><strong>Statistical Accuracy:</strong> The system runs 10 separate trials. The final count is determined by calculating the maximum recurring value, filtering out partial detections.</li>
          <li><strong>User Feedback:</strong> The final result is communicated via a "BlinkAndBuzz" protocol, where the LED and Buzzer pulse N times corresponding to the object count.</li>
        </ul>
      </>
    ),
    codeSnippet: ZUMO_CODE,
    slidesEmbed: null,
    reports: [
        { title: "Final Project Report", src: "/projects/zumo/zumo-report.pdf" }
    ],
    gallery: [
      "/projects/zumo/zumo-on-mission.png",
      "/projects/zumo/zumo-on-black-surface.png"
    ]
  },
  {
    id: 'bms',
    title: "Li-ion Battery Management System",
    category: "Power Systems",
    align: 'left',
    shortDesc: "A comprehensive senior thesis project designing a BMS for Li-ion packs. Features active cell balancing, precise SoC estimation via Coulomb Counting, and STM32-based real-time safety monitoring.",
    tags: ['STM32', 'PCB Design', 'MATLAB/Simulink', 'Power Electronics'],
    mainImage: "/projects/bms/schematic.png",
    fullDesc: (
      <>
        <p>
          This Bachelor's Thesis explores the design and implementation of a <strong>Battery Management System (BMS)</strong> for Lithium-ion batteries. 
          As these batteries are critical for electric vehicles and renewable storage, ensuring their safety and longevity is paramount. 
          This project involved developing a custom hardware solution to monitor critical parameters like voltage, current, and temperature in real-time.
        </p>
        <h3 className="mono" style={{ color: '#66fcf1', marginTop: '20px', fontSize: '18px' }}>Key Engineering Achievements:</h3>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
          <li><strong>State Estimation Algorithms:</strong> Implemented <em>Coulomb Counting</em> and <em>Voltage Monitoring</em> techniques to accurately estimate State of Charge (SoC) and State of Health (SoH).</li>
          <li><strong>Active Cell Balancing:</strong> Designed circuitry to equalize charge across cells, preventing overcharging and maximizing pack capacity.</li>
          <li><strong>STM32 Integration:</strong> Utilized an STM32 microcontroller for high-speed data acquisition and logic control, ensuring rapid response to safety faults (over-voltage, over-current).</li>
          <li><strong>Simulation & Validation:</strong> Validated control logic using MATLAB/Simulink models before physical deployment on the custom-designed PCB.</li>
        </ul>
      </>
    ),
    codeSnippet: null,
    slidesEmbed: null,
    reports: [
        { title: "Phase 1: Research & Methodology", src: "/projects/bms/SeniorYearProject1.pdf" },
        { title: "Phase 2: Manufacturing & Results", src: "/projects/bms/SeniorYearProject2.pdf" }
    ],
    gallery: [
      "/projects/bms/schematic.png",
      "/projects/bms/pcb.png",
      "/projects/bms/front.png",
      "/projects/bms/back.png",
      "/projects/bms/balancing.png",
      "/projects/bms/simulink.png"
    ]
  }
];

/* --- 2. COMPONENTS --- */

// Multi-Document PDF Viewer Component (TALLER VERSION)
const MultiDocViewer = ({ reports }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!reports || reports.length === 0) return null;

  return (
    <div style={{ marginBottom: '80px' }}>
      <h2 className="mono" style={{ fontSize: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
        <FileText /> Technical Documentation
      </h2>
      
      {/* Increased height to 850px */}
      <div style={{ display: 'flex', gap: '20px', flexDirection: 'row', height: '850px', alignItems: 'stretch' }}>
        
        {/* LEFT: MAIN VIEWER */}
        <div style={{ flex: 3, background: '#222', borderRadius: '8px', border: '1px solid #333', overflow: 'hidden', position: 'relative' }}>
            <iframe 
                src={reports[activeIndex].src} 
                width="100%" 
                height="100%" 
                style={{ border: 'none' }} 
                title={reports[activeIndex].title}
            />
        </div>

        {/* RIGHT: SIDEBAR PREVIEWS */}
        {reports.length > 1 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
                {reports.map((report, index) => (
                    <div 
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        style={{ 
                            background: activeIndex === index ? 'rgba(102, 252, 241, 0.15)' : '#1f2833',
                            border: activeIndex === index ? '1px solid #66fcf1' : '1px solid #333',
                            borderRadius: '8px',
                            padding: '15px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            opacity: activeIndex === index ? 1 : 0.7
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <FileText size={20} color={activeIndex === index ? '#66fcf1' : '#c5c6c7'} />
                            {activeIndex === index && <span style={{ fontSize: '10px', color: '#66fcf1', border: '1px solid #66fcf1', padding: '2px 6px', borderRadius: '4px' }}>VIEWING</span>}
                        </div>
                        <h4 className="mono" style={{ fontSize: '12px', color: '#fff', margin: 0 }}>{report.title}</h4>
                        <div style={{ fontSize: '10px', color: '#888', marginTop: '5px' }}>Click to view</div>
                    </div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
};

// Syntax Highlighter
const SyntaxHighlighterComponent = ({ code }) => (
    <div className="code-block" style={{ padding: 0 }}>
        <SyntaxHighlighter 
            language="cpp" 
            style={vscDarkPlus} 
            customStyle={{ background: '#0d1117', margin: 0, padding: '20px', maxHeight: '600px', overflowY: 'auto', fontSize: '13px' }}
        >
            {code}
        </SyntaxHighlighter>
    </div>
);

const ShootingStar = () => {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
        ref.current.position.x = (t * 2) % 10 - 5;
        ref.current.position.y = (t * 2) % 10 - 5;
        ref.current.position.z = -Math.sin(t) * 2;
    }
  });
  return (
    <mesh ref={ref} position={[-5, -5, 0]}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshBasicMaterial color="#ffffff" />
      <Trail width={2} length={8} color={new THREE.Color(2, 2, 10)} attenuation={(t) => t * t}>
        <meshBasicMaterial color="#66fcf1" />
      </Trail>
    </mesh>
  );
};

const SpaceBackground = (props) => {
  const groupRef = useRef();
  const count = 300;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) { pos[i] = (Math.random() - 0.5) * 4; }
    return pos;
  }, []);

  const linesGeometry = useMemo(() => {
    const points = [];
    for (let i = 0; i < count - 1; i+=2) { 
        const x1 = positions[i * 3]; const y1 = positions[i * 3 + 1]; const z1 = positions[i * 3 + 2];
        const x2 = positions[(i + 1) * 3]; const y2 = positions[(i + 1) * 3 + 1]; const z2 = positions[(i + 1) * 3 + 2];
        const dist = Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2) + Math.pow(z2-z1,2));
        if (dist < 1.5) { points.push(new THREE.Vector3(x1, y1, z1)); points.push(new THREE.Vector3(x2, y2, z2)); }
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [positions]);

  useFrame((state, delta) => {
    if (groupRef.current) { groupRef.current.rotation.x -= delta / 15; groupRef.current.rotation.y -= delta / 20; }
  });

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI / 4]}>
      <Points positions={positions} stride={3} frustumCulled={false} {...props}>
        <PointMaterial transparent color="#66fcf1" size={0.008} sizeAttenuation={true} depthWrite={false} />
      </Points>
      <lineSegments geometry={linesGeometry}>
        <lineBasicMaterial color="#66fcf1" transparent opacity={0.15} />
      </lineSegments>
      <ShootingStar />
    </group>
  );
};

const Lightbox = ({ image, onClose }) => {
  if (!image) return null;
  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <img src={image} className="lightbox-img" alt="Full Screen" onClick={(e) => e.stopPropagation()} />
      <button onClick={onClose} style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={40} /></button>
    </div>
  );
};

/* --- 3. PAGE COMPONENTS --- */

// HOME PAGE
const HomePage = ({ onProjectClick }) => {
  return (
    <div className="page-container">
      <nav className="mono">
        <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#fff' }}>K.Ulucay<span className="highlight">.</span></div>
        <div><a href="#projects">Projects</a><a href="#resume">Resume</a><a href="mailto:kubilay.ulucay@ozu.edu.tr">Contact</a></div>
      </nav>

      <div className="container">
        <section className="section" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
          <h1 className="mono" style={{ fontSize: '16px', color: '#66fcf1', marginBottom: '20px' }}>Hi, my name is</h1>
          <h2 style={{ fontSize: '60px', margin: 0, fontWeight: '800' }}>Kubilay Ulucay.</h2>
          <h2 style={{ fontSize: '50px', margin: 0, color: '#8892b0' }}>
            <Typewriter options={{ strings: ['I build robots.', 'I design PCBs.', 'I code embedded systems.', 'I solve problems.'], autoStart: true, loop: true, delay: 50, deleteSpeed: 30 }} />
          </h2>
          <p style={{ maxWidth: '500px', marginTop: '30px', fontSize: '18px', lineHeight: '1.6' }}>I am an Electrical & Electronics Engineer specializing in <span className="highlight">Power Systems</span> and <span className="highlight">Robotics</span>. Currently bridging the gap between hardware and software in Istanbul.</p>
          <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}><a href="https://github.com/KubilayUlucay" target="_blank" style={{ color: '#fff' }}><Github /></a><a href="https://linkedin.com/in/kubilayulucay" target="_blank" style={{ color: '#fff' }}><Linkedin /></a></div>
        </section>

        <section id="projects" className="section">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '60px' }}><h2 className="mono" style={{ fontSize: '24px', marginRight: '20px' }}><span className="highlight">01.</span> Selected Works</h2><div style={{ height: '1px', background: '#333', flex: 1 }}></div></div>
          {PROJECTS_DATA.map((proj) => (
             <div key={proj.id} style={{ display: 'flex', flexDirection: proj.align === 'left' ? 'row' : 'row-reverse', alignItems: 'center', gap: '60px', marginBottom: '80px' }} className="project-item">
             <div style={{ flex: 1 }}>
               <h3 className="mono" style={{ color: '#66fcf1', margin: '0 0 10px 0', fontSize: '28px' }}>{proj.title}</h3>
               <span style={{ fontSize: '12px', background: 'rgba(102, 252, 241, 0.1)', padding: '5px 10px', borderRadius: '4px', color: '#66fcf1', border: '1px solid rgba(102, 252, 241, 0.2)' }}>{proj.category}</span>
               <p style={{ lineHeight: '1.7', marginTop: '20px', fontSize: '16px', color: '#c5c6c7' }}>{proj.shortDesc}</p>
               <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
                 {proj.tags.map((tag, i) => ( <span key={i} className="mono" style={{ fontSize: '12px', color: '#45a29e' }}>#{tag}</span> ))}
               </div>
               <button onClick={() => onProjectClick(proj)} className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '25px', color: '#fff', background: 'transparent', border: 'none', borderBottom: '1px solid #66fcf1', paddingBottom: '2px', cursor: 'pointer', fontSize: '16px' }}>
                 View Project Details <ExternalLink size={16}/>
               </button>
             </div>
             <div style={{ flex: 1.2 }}>
               <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} glareEnable={true} glareMaxOpacity={0.3} glareColor="#66fcf1">
                 <div onClick={() => onProjectClick(proj)} style={{ height: '350px', background: '#0b0c10', borderRadius: '12px', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
                   {proj.mainImage ? (
                     <img src={proj.mainImage} alt={proj.title} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} />
                   ) : (
                     <div style={{ textAlign: 'center', color: '#45a29e' }}><Cpu size={64} style={{ marginBottom: '10px' }}/><div className="mono" style={{ fontSize: '12px' }}>NO_IMG_DATA</div></div>
                   )}
                   <div style={{ position: 'absolute', bottom: '15px', right: '15px', background: 'rgba(0,0,0,0.7)', padding: '5px 10px', borderRadius: '4px', border: '1px solid #333' }}><ZoomIn size={16} color="#66fcf1" /></div>
                 </div>
               </Tilt>
             </div>
           </div>
          ))}
        </section>

        <section style={{ textAlign: 'center', padding: '50px 0', fontSize: '12px' }} className="mono"><p>Designed & Built by Kubilay Ulucay.</p></section>
      </div>
    </div>
  );
}

// PROJECT DETAIL PAGE
const ProjectDetailPage = ({ project, onBack, onViewImage }) => {
  const [showCode, setShowCode] = useState(false);
  
  return (
    <div className="page-container" style={{ background: 'transparent' }}>
      
      {/* FLOATING SIDEBAR NAVIGATION */}
      <button onClick={onBack} className="floating-back-btn mono">
        <ChevronLeft size={32} />
      </button>

      <div className="container" style={{ paddingTop: '80px' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '60px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px' }}>{project.title}</h1>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
              {project.tags.map((tag, i) => ( <span key={i} className="mono" style={{ fontSize: '14px', background: 'rgba(102, 252, 241, 0.1)', color: '#66fcf1', padding: '6px 12px', borderRadius: '6px' }}>{tag}</span> ))}
            </div>
            <div style={{ fontSize: '18px', lineHeight: '1.8', color: '#e6e6e6', maxWidth: '800px' }}>
              {project.fullDesc}
            </div>
        </div>

        {/* 1. Visual Gallery */}
        {project.gallery && project.gallery.length > 0 && (
          <div style={{ marginBottom: '80px' }}>
             <h2 className="mono" style={{ fontSize: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}><ImageIcon /> Visual Documentation</h2>
             <div className="gallery-grid">
               {project.gallery.map((img, i) => (
                 <img key={i} src={img} className="gallery-img" alt={`Gallery ${i}`} onClick={() => onViewImage(img)} />
               ))}
             </div>
          </div>
        )}

        {/* 2. Code Viewer */}
        {project.codeSnippet && (
           <div style={{ marginBottom: '80px' }}>
              <h2 className="mono" style={{ fontSize: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}><Code /> Algorithm Logic</h2>
              <div style={{ border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#1f2833', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
                  <span className="mono" style={{ fontSize: '14px', color: '#66fcf1' }}>Source Code (C++)</span>
                  <button onClick={() => setShowCode(!showCode)} style={{ background: '#0b0c10', border: '1px solid #333', color: '#fff', padding: '5px 15px', cursor: 'pointer', borderRadius: '4px' }}>
                    {showCode ? "Hide Code" : "Expand Code"}
                  </button>
                </div>
                {showCode && <SyntaxHighlighterComponent code={project.codeSnippet} />}
              </div>
           </div>
        )}

        {/* 3. MULTI-DOCUMENT PDF VIEWER (Reports 1 & 2) */}
        {project.reports && project.reports.length > 0 && (
           <MultiDocViewer reports={project.reports} />
        )}

        {/* 4. Slides */}
        {project.slidesEmbed && (
          <div style={{ marginBottom: '80px' }}>
            <h2 className="mono" style={{ fontSize: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}><ExternalLink /> Presentation</h2>
            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
               <iframe src={project.slidesEmbed} frameBorder="0" width="100%" height="500" allowFullScreen={true} mozallowfullscreen="true" webkitallowfullscreen="true" title="Slides"></iframe>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* --- 4. MAIN APP WRAPPER --- */
export default function App() {
  const [activeProject, setActiveProject] = useState(null);
  const [viewImage, setViewImage] = useState(null);

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* STATIC BACKGROUNDS (Fixed outside animation) */}
      <div className="engineering-grid"></div>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: -1 }}>
        <Canvas camera={{ position: [0, 0, 1] }}>
          <SpaceBackground />
        </Canvas>
      </div>

      {/* PAGE SLIDER */}
      <AnimatePresence mode="wait">
        
        {!activeProject ? (
          <motion.div
            key="home"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
            style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1 }}
          >
            <HomePage onProjectClick={setActiveProject} />
          </motion.div>
        ) : (
          <motion.div
            key="project"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
            style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 2 }}
          >
            <ProjectDetailPage 
              project={activeProject} 
              onBack={() => setActiveProject(null)} 
              onViewImage={setViewImage} 
            />
          </motion.div>
        )}

      </AnimatePresence>

      {viewImage && <Lightbox image={viewImage} onClose={() => setViewImage(null)} />}
    </div>
  );
}