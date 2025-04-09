"use client";
import Image from "next/image";
import AcmeLogo from "@/app/ui/acme-logo";
import dynamic from "next/dynamic";
import AmbulanceForm from "./ui/ambulance/AmbulanceForm";
import Link from "next/link"; 
import { TrainFrontIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchAIResponse } from "@/app/ui/chat/aiService";


// const AmbulanceMap = dynamic(() => import("@/app/ui/tracking/AmbulanceMap"), { ssr: false });

export default function Page() {
    const [userId, setUserId] = useState("");
    const [token, setToken] = useState("");
    const [aiAdvice, setAiAdvice] = useState("");
    const [showAI, setShowAI] = useState(false);

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        const storedToken = localStorage.getItem("token");

        if (storedUserId) {
            setUserId(storedUserId);
            setToken(storedToken || ""); // Ensure token is always a string
        }
    }, []);

    const handleAIChat = async () => {
        try {
            setShowAI(true);
            setAiAdvice("Loading first-aid advice...");
            
            const advice = await fetchAIResponse("I just had an accident please outline the steps for first aid");
            setAiAdvice(advice);
        } catch (error) {
            console.error("Error fetching AI response:", error);
            setAiAdvice("Failed to retrieve advice. Please try again.");
        }
    };

    return (
        <main className="relative flex flex-col lg:flex-row items-center justify-center min-h-screen bg-blue-900 px-4 lg:py-10 max-md:space-y-24 lg:space-y-0 lg:space-x-16 max-md:p-10">
            {/* Logo and GIF */}
            <div className="flex flex-col items-center max-md:-space-y-8">
                <Image
                    src="/firstAid.gif"
                    alt="Ambulance GIF"
                    width={300}
                    height={200}
                    className="hidden md:block mb-4"
                    unoptimized
                />
                <Image
                    src="/firstAid.gif"
                    alt="Ambulance GIF"
                    width={80}
                    height={80}
                    className="md:hidden "
                    unoptimized
                />
                <AcmeLogo />
            </div>

            {/* Form Section */}
            <div className="w-full max-w-2xl border-t-2 border-b-2 rounded-3xl shadow-2xl shadow-black border-white h-fit lg:p-20 max-md:rounded-lg">
                <AmbulanceForm />
            </div>

            {/* AI Chat Button */}
            <button
                className="fixed bottom-6 right-6 text-white bg-green-700 p-4 rounded-full shadow-3xl shadow-white hover:bg-blue-900 transition"
                onClick={handleAIChat}
            >
                <TrainFrontIcon size={50} />
            </button>

            {/* AI Advice Popup */}
            {showAI && (
                <div className="fixed bottom-28 right-20 text-white border-l-2 border-r-2 border-white bg-blue-900 p-4 rounded-lg shadow-xl w-fit">
                    <h3 className="text-lg font-semibold">AI First Aid Advice</h3>
                    <p>{aiAdvice}</p>
                    <button
                        className="mt-2 bg-red-600 text-white px-3 py-1 rounded"
                        onClick={() => setShowAI(false)}
                    >
                        Close
                    </button>
                </div>
            )}
        </main>
    );
}
