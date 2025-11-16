"use client";

import React from "react";

export function HeroIllustration() {
  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 600 400"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background gradient circles */}
        <circle cx="100" cy="100" r="80" fill="#D6F5EB" opacity="0.3" />
        <circle cx="500" cy="300" r="100" fill="#D6F5EB" opacity="0.2" />
        <circle cx="300" cy="50" r="60" fill="#00A884" opacity="0.1" />
        
        {/* Main illustration - Student with books */}
        <g transform="translate(200, 100)">
          {/* Person */}
          <circle cx="100" cy="80" r="40" fill="#00A884" opacity="0.2" />
          <ellipse cx="100" cy="120" rx="35" ry="50" fill="#00A884" opacity="0.3" />
          
          {/* Books stack */}
          <rect x="150" y="100" width="40" height="60" rx="4" fill="#00A884" opacity="0.4" />
          <rect x="160" y="90" width="40" height="60" rx="4" fill="#00A884" opacity="0.5" />
          <rect x="170" y="80" width="40" height="60" rx="4" fill="#00A884" opacity="0.6" />
          
          {/* Laptop/Tablet */}
          <rect x="60" y="140" width="60" height="40" rx="4" fill="#00A884" opacity="0.3" />
          <rect x="65" y="145" width="50" height="30" rx="2" fill="#00A884" opacity="0.5" />
          
          {/* Success checkmarks floating */}
          <circle cx="250" cy="60" r="20" fill="#16A34A" opacity="0.3" />
          <path d="M245 60 L248 63 L255 56" stroke="#16A34A" strokeWidth="2" fill="none" opacity="0.6" />
          
          <circle cx="50" cy="200" r="15" fill="#16A34A" opacity="0.3" />
          <path d="M46 200 L49 203 L54 198" stroke="#16A34A" strokeWidth="2" fill="none" opacity="0.6" />
        </g>
        
        {/* Floating elements */}
        <circle cx="80" cy="250" r="8" fill="#00A884" opacity="0.4" />
        <circle cx="520" cy="150" r="12" fill="#00A884" opacity="0.3" />
        <circle cx="450" cy="80" r="10" fill="#00A884" opacity="0.4" />
      </svg>
    </div>
  );
}

export function ExamCategoryIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="60" cy="60" r="50" fill="#D6F5EB" />
      <path
        d="M40 40 L80 40 L80 80 L40 80 Z"
        fill="#00A884"
        opacity="0.3"
      />
      <path
        d="M45 45 L75 45 L75 75 L45 75 Z"
        fill="#00A884"
        opacity="0.5"
      />
      <circle cx="60" cy="60" r="8" fill="#00A884" />
    </svg>
  );
}

export function FeatureIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="featureGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00A884" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#D6F5EB" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="80" fill="url(#featureGrad)" />
      <path
        d="M60 100 L85 125 L140 70"
        stroke="#00A884"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatsBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary-teal-light rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-teal-light rounded-full blur-3xl opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-teal-light rounded-full blur-3xl opacity-10"></div>
    </div>
  );
}

export function GradientBlob({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute ${className} pointer-events-none`}>
      <div className="w-96 h-96 bg-primary-teal-light rounded-full blur-3xl opacity-30"></div>
    </div>
  );
}

export function PatternDots() {
  return (
    <div
      className="absolute inset-0 opacity-5"
      style={{
        backgroundImage: `radial-gradient(circle, #00A884 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      }}
    />
  );
}

export function AnimatedGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-teal rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-teal-light rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-teal rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
    </div>
  );
}

