async function testChat() {
  const cookies = new Map();
  const updateCookies = response => {
    for (const entry of response.headers.getSetCookie()) {
      const pair = entry.split(';', 1)[0];
      const at = pair.indexOf('=');
      cookies.set(pair.slice(0, at), pair.slice(at + 1));
    }
  };

  const csrfRes = await fetch('http://localhost:5173/api/auth/csrf');
  updateCookies(csrfRes);
  const { csrfToken } = await csrfRes.json();
  const cookieHeader = [...cookies].map(([k, v]) => `${k}=${v}`).join('; ');

  const chatRes = await fetch('http://localhost:5173/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'Cookie': cookieHeader
    },
    body: JSON.stringify({
      message: 'What is famous in Maharaj Bada?',
      language: 'en'
    })
  });

  const d = await chatRes.json();
  console.log('CHAT HTTP STATUS:', chatRes.status);
  console.log('CHAT STATUS:', d.status);
  console.log('CHAT REPLY (truncated):', String(d.reply).slice(0, 200));
}

testChat().catch(console.error);

