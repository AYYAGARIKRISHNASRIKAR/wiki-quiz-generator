// Use relative path for production (Vercel rewrites handles /api)
// In development, you can use a proxy or env variable
const API = window.location.origin.includes('localhost') ? "http://127.0.0.1:8000" : "";


export async function generateQuiz(url) {
  const res = await fetch(`${API}/api/quizzes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export async function fetchHistory() {
  return fetch(`${API}/api/quizzes`).then(r => r.json());
}

export async function fetchQuiz(id) {
  return fetch(`${API}/api/quizzes/${id}`).then(r => r.json());
}

export async function submitAttempt(id, answers) {
  return fetch(`${API}/api/quizzes/${id}/attempt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers })
  }).then(r => r.json());
}
