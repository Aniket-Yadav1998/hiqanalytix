import React from "react";
import "@/App.css";
import { Toaster } from "sonner";
import useSmoothScroll from "@/hooks/useSmoothScroll";
import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import About from "@/components/site/About";
import Services from "@/components/site/Services";
import Industries from "@/components/site/Industries";
import Contact from "@/components/site/Contact";
import Footer from "@/components/site/Footer";

function App() {
    useSmoothScroll();

    return (
        <div className="App" data-testid="app-root">
            <Navbar />
            <main>
                <Hero />
                <About />
                <Services />
                <Industries />
                <Contact />
            </main>
            <Footer />
            <Toaster
                position="bottom-right"
                theme="dark"
                toastOptions={{
                    style: {
                        background: "#121215",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        borderRadius: 0,
                    },
                }}
            />
        </div>
    );
}

export default App;
