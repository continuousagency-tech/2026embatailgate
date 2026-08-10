// Thin wrapper around the /api/attendees endpoints.

export async function fetchAttendees() {
  const res = await fetch('/api/attendees');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function addAttendee(attendee, adminPassword) {
  const res = await fetch('/api/attendees', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPassword,
    },
    body: JSON.stringify(attendee),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return body;
}

export async function deleteAttendee(id, adminPassword) {
  const res = await fetch(`/api/attendees/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-password': adminPassword,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
}
