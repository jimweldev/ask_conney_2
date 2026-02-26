export const getNotificationLink = (link: string) => {
  const url = new URL(link, window.location.origin);

  // clone url without the `ts` param for comparison
  const urlWithoutTs = new URL(url.toString());
  urlWithoutTs.searchParams.delete('ts');

  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.delete('ts');

  // if link matches current (ignoring ts), add a new timestamp
  if (
    urlWithoutTs.pathname + urlWithoutTs.search ===
    currentUrl.pathname + currentUrl.search
  ) {
    url.searchParams.set('ts', Date.now().toString());
  }

  return url.pathname + url.search;
};
