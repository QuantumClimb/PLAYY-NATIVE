// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

vi.stubEnv('WHATSAPP_TOKEN', 'tok');
vi.stubEnv('WHATSAPP_SENDER_NUMBER', '+91 98765 43210');
vi.stubEnv('WHATSAPP_TEMPLATE_NAME', 'playy_ready');
vi.stubEnv('WHATSAPP_TEMPLATE_BODY', 'name');
vi.stubEnv('WHATSAPP_TEMPLATE_HEADER', 'document');
vi.stubEnv('SITE_URL', 'https://playy.example/');

const { sendWhatsapp, templateMessage, whatsappConfigured, whatsappNumber } = await import('../../server/whatsapp.mjs');

describe('whatsapp', () => {
  it('turns what a visitor typed into an international number', () => {
    expect(whatsappNumber('98765 43210')).toBe('+919876543210');
    expect(whatsappNumber('+44 7700 900123')).toBe('+447700900123');
    expect(whatsappNumber('12345')).toBeNull();
  });

  it('is configured only with everything needed', () => {
    expect(whatsappConfigured()).toBe(true);
  });

  it('puts the PDF in the header and the name in the body', () => {
    const message = templateMessage({
      to: '+919876543210',
      name: 'Asha',
      documentUrl: 'https://playy.example/a.pdf',
      filename: 'playy-playypal.pdf',
    });
    expect(message.template.name).toBe('playy_ready');
    expect(message.template.components[0].parameters[0].document.link).toBe('https://playy.example/a.pdf');
    expect(message.template.components[1].parameters.map((p: { text: string }) => p.text)).toEqual(['Asha']);
  });

  it('sends with the bearer token and the sender number, and reports a refusal', async () => {
    const fetchMock = vi.fn(async () => new Response('bad template', { status: 400 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(
      sendWhatsapp({ phone: '9876543210', name: 'Asha', documentUrl: 'u', filename: 'f.pdf' }),
    ).rejects.toThrow('refused it (400) bad template');
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://rest.qikberry.ai/v1/whatsapp/messages');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer tok', 'x-phone-number': '919876543210' });
    vi.unstubAllGlobals();
  });
});

describe('whatsapp text-only template', () => {
  it('sends no header and no body variables', async () => {
    vi.resetModules();
    vi.stubEnv('WHATSAPP_TEMPLATE_HEADER', 'none');
    vi.stubEnv('WHATSAPP_TEMPLATE_BODY', '');
    const { templateMessage: build } = await import('../../server/whatsapp.mjs');
    const message = build({ to: '+919876543210', name: 'Asha', documentUrl: '', filename: 'f.pdf' });
    expect(message.template.components).toEqual([]);
  });
});

describe('whatsapp sender number', () => {
  it('adds 91 to a ten-digit sender and keeps one that has a country code', async () => {
    vi.resetModules();
    vi.stubEnv('WHATSAPP_SENDER_NUMBER', '7200637887');
    expect((await import('../../server/config.mjs')).WHATSAPP.sender).toBe('917200637887');
    vi.resetModules();
    vi.stubEnv('WHATSAPP_SENDER_NUMBER', '+91 72006 37887');
    expect((await import('../../server/config.mjs')).WHATSAPP.sender).toBe('917200637887');
  });
});

describe('whatsapp template with the name in the header', () => {
  it('sends the name as the header text and nothing else', async () => {
    vi.resetModules();
    vi.stubEnv('WHATSAPP_TEMPLATE_HEADER', 'text');
    vi.stubEnv('WHATSAPP_TEMPLATE_BODY', '');
    const { templateMessage: build } = await import('../../server/whatsapp.mjs');
    const message = build({ to: '+919876543210', name: 'Asha', documentUrl: '', filename: 'f.pdf' });
    expect(message.template.components).toEqual([{ type: 'header', parameters: [{ type: 'text', text: 'Asha' }] }]);
  });
});

describe('whatsapp template with a named variable', () => {
  it('sends the variable with its name', async () => {
    vi.resetModules();
    vi.stubEnv('WHATSAPP_TEMPLATE_HEADER', 'document');
    vi.stubEnv('WHATSAPP_TEMPLATE_BODY', 'name');
    vi.stubEnv('WHATSAPP_TEMPLATE_PARAM_NAME', 'name');
    const { templateMessage: build } = await import('../../server/whatsapp.mjs');
    const message = build({ to: '+919876543210', name: 'Asha', documentUrl: 'u', filename: 'f.pdf' });
    expect(message.template.components[1].parameters).toEqual([{ type: 'text', parameter_name: 'name', text: 'Asha' }]);
  });
});
