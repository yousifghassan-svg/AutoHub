export type ShareChannel = 'native' | 'clipboard' | 'whatsapp' | 'telegram' | 'qr' | 'deeplink';

export type SharePayload = {
  title: string;
  url: string;
  text?: string;
};

export type ShareResult = {
  ok: boolean;
  channel: ShareChannel;
  message?: string;
};

export type ShareOptions = {
  /** Preferred channel; defaults to native → clipboard fallback. */
  preferred?: ShareChannel;
};

/**
 * Share abstraction — browsers call native/clipboard today.
 * Future: WhatsApp, Telegram, QR, deep links, mobile SDK without page changes.
 */
export async function shareListing(
  payload: SharePayload,
  options: ShareOptions = {},
): Promise<ShareResult> {
  const preferred = options.preferred ?? 'native';

  if (preferred === 'whatsapp') {
    const text = encodeURIComponent(`${payload.title}\n${payload.url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
    return { ok: true, channel: 'whatsapp', message: 'Opened WhatsApp' };
  }

  if (preferred === 'telegram') {
    const url = encodeURIComponent(payload.url);
    const text = encodeURIComponent(payload.title);
    window.open(
      `https://t.me/share/url?url=${url}&text=${text}`,
      '_blank',
      'noopener,noreferrer',
    );
    return { ok: true, channel: 'telegram', message: 'Opened Telegram' };
  }

  if (preferred === 'qr' || preferred === 'deeplink') {
    return {
      ok: false,
      channel: preferred,
      message: `${preferred} share is not available yet`,
    };
  }

  try {
    if (
      preferred === 'native' &&
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url,
      });
      return { ok: true, channel: 'native', message: 'Shared' };
    }
  } catch {
    /* fall through to clipboard */
  }

  try {
    await navigator.clipboard.writeText(payload.url);
    return { ok: true, channel: 'clipboard', message: 'Link copied' };
  } catch {
    return { ok: false, channel: 'clipboard', message: 'Could not share' };
  }
}
