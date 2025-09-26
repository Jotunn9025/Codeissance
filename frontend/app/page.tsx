"use client";

import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Brain, 
  Target,
  ArrowRight,
  BarChart3,
  LineChart,
  PieChart,
  Sparkles,
  Eye,
  Shield,
  Rocket,
  Globe,
  Users,
  Star
} from 'lucide-react';

function App() {
  const [currentMetric, setCurrentMetric] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const controls = useAnimation();

  const metrics = [
    { value: "94.7%", label: "Accuracy Rate", trend: "up" },
    { value: "2.3s", label: "Response Time", trend: "down" },
    { value: "15K+", label: "Data Sources", trend: "up" },
    { value: "$2.4M", label: "Saved Losses", trend: "up" }
  ];

  const features = [
    {
      icon: Brain,
      title: "Agentic Collection",
      description: "Autonomous AI agents continuously scan news, social media, forums, and financial data streams with intelligent relevance filtering.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Activity,
      title: "Time-Series Modeling",
      description: "Advanced predictive algorithms detect trend shifts, calculate confidence intervals, and forecast market impact with precision.",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Target,
      title: "Proactive Alerts",
      description: "Smart recommendations with risk assessment, optimal entry/exit points, and real-time portfolio impact analysis.",
      color: "from-green-500 to-blue-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Portfolio Manager",
      company: "Quantum Capital",
      content: "This platform transformed our trading strategy. The sentiment predictions are incredibly accurate.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Head of Trading",
      company: "Alpha Investments",
      content: "The real-time insights helped us avoid major losses during market volatility. Game-changer.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Risk Analyst",
      company: "Sterling Fund",
      content: "The AI-driven alerts are spot-on. We've seen a 40% improvement in our risk-adjusted returns.",
      rating: 5
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentMetric((prev) => (prev + 1) % metrics.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    controls.start({
      scale: [1, 1.1, 1],
      transition: { duration: 2, repeat: Infinity }
    });
  }, [controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
        style={{ minHeight: '100vh', minWidth: '100vw' }}
      >
        <source src="/bg_video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black/60 z-10" />
      
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)] pointer-events-none z-20" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.08),transparent_50%)] pointer-events-none z-20" />
      
      <motion.div
        className="relative z-30 backdrop-blur-sm bg-white/5"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <motion.div 
            variants={itemVariants} 
            className="mb-8"
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <motion.div
                animate={controls}
                className="w-2 h-2 bg-primary rounded-full"
              />
              <span className="text-sm font-medium text-primary">LIVE AI MONITORING</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
              Dynamic Market
              <br />
              <span className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">Sentiment Forecaster</span>
            </h1>
            
            <p className="text-xl text-white font-semibold max-w-4xl mx-auto leading-relaxed mb-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
              Agentic AI that autonomously collects signals, forecasts sentiment trends, 
              and turns them into proactive strategy with real-time market intelligence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <motion.button
                className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all duration-300 animate-pulse-glow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Trial
              </motion.button>
              <motion.button
                className="px-8 py-4 border border-border rounded-lg font-semibold text-lg hover:bg-secondary transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="w-5 h-5" />
                Watch Demo
              </motion.button>
            </div>
          </motion.div>

          {/* Metrics Display */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-20">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                className={`p-6 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 transition-all duration-500 ${
                  currentMetric === index ? 'ring-2 ring-primary shadow-lg bg-white/20' : ''
                }`}
                animate={{
                  scale: currentMetric === index ? 1.05 : 1,
                  y: currentMetric === index ? -5 : 0
                }}
              >
                <div className="flex items-center justify-center mb-2">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Visual Demo Section */}
        <section className="container mx-auto px-4 py-20">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">See It In Action</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the power of real-time sentiment analysis with our interactive dashboard
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="relative max-w-6xl mx-auto"
          >
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Live Sentiment Indicator */}
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-green-400 to-blue-500 animate-float flex items-center justify-center">
                      <div className="text-3xl font-bold text-white">87%</div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Live Sentiment</h3>
                  <p className="text-muted-foreground">Real-time market mood tracking</p>
                </div>

                {/* Trend Visualization */}
                <div className="text-center">
                  <div className="mb-4">
                    <LineChart className="w-32 h-32 mx-auto text-primary animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Trend Analysis</h3>
                  <p className="text-muted-foreground">Predictive trend forecasting</p>
                </div>

                {/* Alert System */}
                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center animate-pulse-glow">
                      <Zap className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Smart Alerts</h3>
                  <p className="text-muted-foreground">Proactive trading signals</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powered by Advanced AI</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our cutting-edge technology stack delivers unparalleled market insights
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group relative backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:shadow-2xl hover:bg-white/20 transition-all duration-500 overflow-hidden"
                whileHover={{ y: -10 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="container mx-auto px-4 py-20">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Industry Leaders</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of traders who rely on our AI-driven insights
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={itemVariants}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 hover:shadow-lg hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role} at {testimonial.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <motion.div 
            variants={itemVariants}
            className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl p-12 border border-primary/20"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-primary font-semibold">READY TO GET STARTED?</span>
            </div>
            <h2 className="text-4xl font-bold mb-6">Transform Your Trading Strategy Today</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the AI revolution in trading. Get started with our free trial and see the difference 
              intelligent sentiment analysis can make.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                className="px-8 py-4 border border-border rounded-lg font-semibold text-lg hover:bg-secondary transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Schedule Demo
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 border-t border-border">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Dynamic Market Sentiment Forecaster. All rights reserved.</p>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}

export default App;