import { useEffect } from "react";
import { useRouter } from "next/router";

const GoogleAuthCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth2/token`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token); // Store token
        router.push("/dashboard"); // Redirect to dashboard
      }
    };

    fetchToken();
  }, [router]);

  return <p>Loading...</p>;
};

export default GoogleAuthCallback;
