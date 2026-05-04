// TODO: replace REPLACE_WITH_YOUR_ID with your Formspree form ID
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/REPLACE_WITH_YOUR_ID';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export async function submitContactForm(data: FormData): Promise<{ ok: boolean }> {
  // TODO: POST to Formspree with JSON body; return {ok: true} on 2xx, {ok: false} otherwise
  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}
