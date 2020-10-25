export const unregisterAll = async () => {
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();

    for (const reg of registrations) {
      reg.unregister();
    }
  }
  catch { }
}