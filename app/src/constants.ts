const API = "http://localhost:3001";
const STUDENT = "student-1";

function getClientId(): string {
  const p = new URLSearchParams(window.location.search);
  return p.get("client") || "device-A";
}

export { API, STUDENT, getClientId };
