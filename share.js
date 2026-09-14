((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ShoppingShare = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';

  function buildShoppingMessage(items, checkedIds, formatQty) {
    const checked = checkedIds instanceof Set ? checkedIds : new Set(checkedIds || []);
    const pending = (items || []).filter(item => !checked.has(item.id));
    if (!pending.length) return '';
    const lines = pending.map(item => `• ${item.name} — ${formatQty(item)}`);
    return [
      'Собери корзину ВкусВилла по списку «Едим дома»:',
      '',
      ...lines,
      '',
      'Замены согласуй. Оформление и оплату не подтверждай без моего согласия.'
    ].join('\n');
  }

  function buildTelegramShareUrl(message, appUrl) {
    const url = new URL('https://t.me/share/url');
    url.searchParams.set('url', appUrl);
    url.searchParams.set('text', message);
    return url.toString();
  }

  return { buildShoppingMessage, buildTelegramShareUrl };
});
