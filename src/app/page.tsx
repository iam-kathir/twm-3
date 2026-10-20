import React from "react";
import { NavBar } from "@/components/landing/NavBar";
import { HeroSection } from "@/components/landing/HeroSection";
import { MotionShowcase } from "@/components/landing/MotionShowcase";
import { CockpitPreview } from "@/components/landing/CockpitPreview";
import { AppScreensGallery } from "@/components/landing/AppScreensGallery";
import { PlatformMatrix } from "@/components/landing/PlatformMatrix";
import { FairnessGuarantees } from "@/components/landing/FairnessGuarantees";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col selection:bg-accent selection:text-canvas">
      <NavBar />
      <main className="flex-1">
        <HeroSection />
        <MotionShowcase />
        <CockpitPreview />
        <AppScreensGallery />
        <PlatformMatrix />
        <FairnessGuarantees />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}


