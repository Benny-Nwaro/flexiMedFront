export async function fetchAIResponse(prompt: string): Promise<string> {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`http://localhost:8080/api/ai/chat?prompt=${encodeURIComponent(prompt)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "",
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch AI response");
        }

        const data = await response.json();
        console.log("🔹 Full AI Response:", JSON.stringify(data, null, 2));

        // ✅ Extract message content safely
        const messageContent = data.choices?.[0]?.message?.content || "No AI response received.";

        console.log("🔹 Extracted Message:", messageContent);

        return messageContent;
    } catch (error) {
        console.error("❌ Error fetching AI response:", error);
        return "Error fetching AI response.";
    }
}

