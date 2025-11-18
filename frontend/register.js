document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const registerResponse = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    const registerData = await registerResponse.json();

    if (!registerResponse.ok) {
        document.getElementById("registerError").innerText =
            registerData.detail || "Registration failed";
        return;
    }

    const loginData = new URLSearchParams();
    loginData.append("username", email);
    loginData.append("password", password);

    const loginResponse = await fetch("http://127.0.0.1:8000/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: loginData
    });

    const tokenResult = await loginResponse.json();

    if (!loginResponse.ok) {
        document.getElementById("registerError").innerText =
            "Registered, but auto-login failed. Please log in manually.";
        return;
    }

    localStorage.setItem("access_token", tokenResult.access_token);

    window.location.href = "/frontend/flashcard.html";
});
