export async function verifyLogin() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const res = await fetch("http://localhost:3001/api/me", {
      headers: {
        Authorization: `Bearer ${token}`,  // aici e crucial să trimiți token-ul
      },
    });

    if (!res.ok) return false;

    const data = await res.json();
    return true; // sau verifică ceva din data dacă vrei
  } catch {
    return false;
  }
}
