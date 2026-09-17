import React from "react";
import "@/App.css";
import { Toaster } from "sonner";
import useSmoothScroll from "@/hooks/useSmoothScroll";
import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import About from "@/components/site/About";
import Services from "@/components/site/Services";
import AnalyticsFlow from "@/components/site/AnalyticsFlow";
import TechStack from "@/components/site/TechStack";
import CaseStudies from "@/components/site/CaseStudies";
import RoiCalculator from "@/components/site/RoiCalculator";
import Industries from "@/components/site/Industries";
import Insights from "@/components/site/Insights";
import Certification from "@/components/site/Certification";
import Contact from "@/components/site/Contact";
import Footer from "@/components/site/Footer";

function App() {
    useSmoothScroll();

    return (
        <div className="App" data-testid="app-root">
            <Navbar />
            <main className="relative">
                <Hero />
                <About />
                <Services />
                <AnalyticsFlow />
                <TechStack />
                <CaseStudies />
                <RoiCalculator />
                <Industries />
                <Insights />
                <Certification />
                <Contact />
            </main>
            <Footer />
            <Toaster
                position="bottom-right"
                theme="light"
                toastOptions={{
                    style: {
                        background: "#FFFFFF",
                        border: "1px solid rgba(0,0,0,0.08)",
                        color: "#0B0B0F",
                        borderRadius: 0,
                    },
                }}
            />
        </div>
    );
}

export default App;
