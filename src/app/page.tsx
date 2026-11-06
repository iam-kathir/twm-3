import React from "react";
import { NavBar } from "@/components/landing/NavBar";
import { HeroSection } from "@/components/landing/HeroSection";
import { BoundaryChecker } from "@/components/landing/BoundaryChecker";
import { MotionShowcase } from "@/components/landing/MotionShowcase";
import { CockpitPreview } from "@/components/landing/CockpitPreview";
import { PlatformMatrix } from "@/components/landing/PlatformMatrix";
import { OrbitingTelemetryShowcase } from "@/components/landing/OrbitingTelemetryShowcase";
import { FairnessGuarantees } from "@/components/landing/FairnessGuarantees";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col selection:bg-accent selection:text-canvas">
      <NavBar />
      <main className="flex-1">
        <HeroSection />
        <BoundaryChecker />
        <MotionShowcase />
        <CockpitPreview />
        <PlatformMatrix />
        <OrbitingTelemetryShowcase />
        <FairnessGuarantees />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
