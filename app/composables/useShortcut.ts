// ⌘ + key on Mac, Ctrl + key everywhere else, e.g. ⌘K / Ctrl+K.
// Without onTrigger it only gives the label, for tooltips.
export function useShortcut(key: string, onTrigger?: () => void) {
  // only known in the browser, so the server renders the Ctrl label
  const isMac = ref(false);
  onMounted(() => {
    const { userAgentData } = navigator as Navigator & {
      userAgentData?: { platform: string };
    };
    isMac.value = /mac|iphone|ipad/i.test(
      userAgentData?.platform ?? navigator.platform,
    );
  });

  if (onTrigger) {
    useEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key || event.altKey || event.shiftKey)
        return;
      if (!(isMac.value ? event.metaKey : event.ctrlKey)) return;
      // the browser's own shortcut (e.g. Ctrl+K search) shouldn't run too
      event.preventDefault();
      onTrigger();
    });
  }

  const label = computed(
    () => `${isMac.value ? "⌘" : "Ctrl+"}${key.toUpperCase()}`,
  );
  return { label };
}
