// Thin wrapper around the /api/attendees endpoints.
//
// The public site only ever wants people currently marked as attending, so
// these pass ?attending=true. (admin.html is a separate static page and
// talks to the API directly without this param, since it needs to see
// everyone to let someone be re-checked.)

export async function fetchAttendees() {
  const res = await fetch('/api/attendees?attending=true');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchAttendee(id) {
  const res = await fetch(`/api/attendees/${id}?attending=true`);
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
