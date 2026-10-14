
(function () {
  // Top Beans outbound click tracker v0.3.
  // Records product_id, affiliate_offer_id, source, referrer and UTM params.
  // The log stays in the visitor's browser (localStorage) until a collector
  // endpoint is configured via window.TB_COLLECTOR. Nothing here records a
  // purchase: purchases exist only when an affiliate network reports them.
  // Every step is guarded so this file can never throw on a static host.
  try {
    var params = new URLSearchParams(location.search);
    var landing = { source: params.get('utm_source'), medium: params.get('utm_medium'),
      campaign: params.get('utm_campaign'), creative_id: params.get('utm_content'),
      experiment_id: params.get('exp'), solution_id: params.get('sol'),
      video_id: params.get('v'), referrer: document.referrer || null,
      landing_page: location.pathname, ts: new Date().toISOString() };
    try { sessionStorage.setItem('tb_landing', JSON.stringify(landing)); } catch (e) {}
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[data-track-click]') : null;
      if (!a) return;
      var land = {}; try { land = JSON.parse(sessionStorage.getItem('tb_landing') || '{}'); } catch (err) {}
      var ev = { event_type: 'outbound_click', ts: new Date().toISOString(),
        experiment_id: land.experiment_id || null,
        solution_id: a.getAttribute('data-solution-id') || land.solution_id || null,
        product_id: a.getAttribute('data-product-id'), affiliate_offer_id: a.getAttribute('data-offer-id'),
        merchant: a.getAttribute('data-merchant'), href: a.href,
        source: land.source || null, medium: land.medium || null, campaign: land.campaign || null,
        video_id: land.video_id || null, creative_id: land.creative_id || null,
        referrer: land.referrer || null, landing_page: land.landing_page || null };
      try { var log = JSON.parse(localStorage.getItem('tb_clicks') || '[]'); log.push(ev);
        localStorage.setItem('tb_clicks', JSON.stringify(log)); } catch (err) {}
      try { if (window.fbq) fbq('trackCustom', 'AffiliateClick', { product_id: ev.product_id, affiliate_offer_id: ev.affiliate_offer_id }); } catch (err) {}
      try { if (window.gtag) gtag('event', 'affiliate_click', { product_id: ev.product_id, affiliate_offer_id: ev.affiliate_offer_id }); } catch (err) {}
      if (window.TB_COLLECTOR) { try { navigator.sendBeacon(window.TB_COLLECTOR, JSON.stringify(ev)); } catch (err) {} }
    });
  } catch (outer) { /* never break the page */ }
})();
