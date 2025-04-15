import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Users, BarChart, GraduationCap, Brain, Target, TestTube2, Rocket, Award, Globe, Laptop } from 'lucide-react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import type { Engine } from 'tsparticles-engine';
import { TypeAnimation } from 'react-type-animation';

// Optimized Gradient Background with Parallax
const GradientBackground = () => {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '80%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.5]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-900"
        style={{ opacity }}
      />
      <motion.div 
        className="absolute inset-0 bg-[url('https://assets.codepen.io/939494/noise.png')] opacity-10"
        style={{ y: backgroundY }}
      />
      <ParticlesBackground />
    </div>
  );
};

// Interactive Particles Background
const ParticlesBackground = () => {
  const particlesInit = async (engine: Engine) => {
    await loadFull(engine);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        particles: {
          number: { value: 50 },
          color: { value: '#ffffff' },
          opacity: { value: 0.1 },
          size: { value: 1 },
          links: {
            enable: true,
            color: '#ffffff',
            opacity: 0.1,
            distance: 150
          },
          move: { enable: true, speed: 1 }
        }
      }}
      className="absolute inset-0 opacity-30"
    />
  );
};

// Enhanced Mascot with SVG Morphing
const Mascot = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div 
      className="relative w-48 h-48"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <motion.div
        animate={{
          rotate: hovered ? [0, 15, -15, 0] : 0,
          y: hovered ? [-10, 10, -10] : 0
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          type: 'keyframes'
        }}
      >
        <GraduationCap className="w-full h-full text-white" />
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-4 -right-4"
            >
              <Rocket className="w-12 h-12 text-purple-400 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

interface StatCardProps {
  number: number;
  label: string;
}

// Animated Stat Card with Counting
const StatCard = ({ number, label }: StatCardProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const animate = () => {
        setCount((prev) => {
          const next = prev + Math.ceil(number / 20);
          return next >= number ? number : next;
        });
      };
      const interval = setInterval(animate, 50);
      if (count >= number) clearInterval(interval);
      return () => clearInterval(interval);
    }
  }, [isInView, number, count]);

  return (
    <motion.div
      ref={ref}
      className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/10 shadow-xl"
      whileHover={{ scale: 1.05 }}
    >
      <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
        {count.toLocaleString()}+
      </div>
      <div className="text-indigo-100 font-medium">{label}</div>
    </motion.div>
  );
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

// 3D Feature Card
const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.2 1"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.5, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      className="group perspective-1000"
    >
      <motion.div
        className="relative h-full bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-3xl p-8 backdrop-blur-xl border border-white/10 shadow-2xl transform-style-preserve-3d"
        whileHover={{ rotateY: 10, rotateX: 5 }}
      >
        <div className="flex flex-col items-center text-center">
          <motion.div 
            className="mb-6 p-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg"
            whileHover={{ scale: 1.1 }}
          >
            <Icon className="w-12 h-12 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
          <p className="text-indigo-100 leading-relaxed">{description}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Adaptive algorithms that personalize your learning journey"
    },
    {
      icon: TestTube2,
      title: "Real Experiments",
      description: "Interactive simulations for practical understanding"
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Connect with learners worldwide in our network"
    }
  ];

  const additionalFeatures = [
    {
      icon: Laptop,
      title: "Dynamic Mock Tests",
      description: "Access a wide range of practice tests that simulate real exam conditions",
      forRole: "For Students"
    },
    {
      icon: Brain,
      title: "Real-time Progress",
      description: "Track your performance with detailed analytics and insights",
      forRole: "For Students"
    },
    {
      icon: Target,
      title: "Customized Learning",
      description: "Get personalized recommendations based on your performance",
      forRole: "For Students"
    },
    {
      icon: BookOpen,
      title: "Question Bank",
      description: "Create and manage comprehensive question banks for your subjects",
      forRole: "For Teachers"
    },
    {
      icon: Users,
      title: "Student Management",
      description: "Monitor and analyze student performance with detailed reports",
      forRole: "For Teachers"
    },
    {
      icon: BarChart,
      title: "Analytics Dashboard",
      description: "Get insights into student performance and identify areas for improvement",
      forRole: "For Teachers"
    }
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 z-50"
        style={{ scaleX }}
      />

      <GradientBackground />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="mb-16"
          >
            <Mascot />
          </motion.div>

          <h1 className="text-7xl font-bold text-white mb-8 leading-tight">
            Transform Your
            <TypeAnimation
              sequence={[
                'Learning',
                2000,
                'Future',
                2000,
                'Career',
                2000
              ]}
              wrapper="div"
              cursor={true}
              repeat={Infinity}
              className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300"
            />
          </h1>

          <p className="text-2xl text-indigo-100 mb-12 max-w-3xl mx-auto">
            <TypeAnimation
              sequence={[
                'Join thousands mastering their subjects with our intelligent platform...',
                3000,
                'Experience education reimagined through AI and expert insights...',
                3000
              ]}
              wrapper="span"
              cursor={true}
              repeat={Infinity}
            />
          </p>

          <motion.div 
            className="flex flex-wrap justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="btn-primary group text-lg font-semibold px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
              <span className="flex items-center space-x-3">
                <Rocket className="w-6 h-6" />
                <span>Launch Your Journey</span>
              </span>
            </motion.button>
          </motion.div>

          <motion.div 
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <StatCard number={10000} label="Active Learners" />
            <StatCard number={95} label="Success Rate" />
            <StatCard number={50000} label="Lessons Mastered" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-24"
            initial={{ y: 50 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Revolutionary Features
            </h2>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Discover tools designed to accelerate your learning process
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature) => (
              <FeatureCard 
                key={feature.title}
                {...feature}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need to excel
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Comprehensive tools for both students and teachers
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="text-indigo-600">
                  {React.createElement(feature.icon, { className: "w-12 h-12" })}
                </div>
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {feature.forRole}
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Demo Section */}
      <section className="py-32 px-4 relative">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div 
            className="inline-block mb-12"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 1 }}
          >
            <Award className="w-24 h-24 text-purple-400" />
          </motion.div>
          <h2 className="text-5xl font-bold text-white mb-8">
            See It in Action
          </h2>
          <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="aspect-video bg-purple-900/20 rounded-xl overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <button className="btn-primary px-8 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Launch Interactive Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block">Create your account today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Join thousands of students and teachers already using our platform.
          </p>
          <Link
            to="/login"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;