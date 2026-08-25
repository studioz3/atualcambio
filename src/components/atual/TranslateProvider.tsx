import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouterState } from "@tanstack/react-router";
import { translateBatch } from "@/lib/translate.functions";

export type SiteLang = "pt" | "en" | "es";

const STORAGE_KEY = "atual:lang";
const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "CODE",
  "PRE",
  "SVG",
  "TEXTAREA",
]);
const ATTRS = ["placeholder", "aria-label", "alt", "title"] as const;

type Ctx = {
  lang: SiteLang;
  setLang: (lang: SiteLang) => void;
  translating: boolean;
};

const TranslateContext = createContext<Ctx>({
  lang: "pt",
  setLang: () => {},
  translating: false,
});

export function useTranslate() {
  return useContext(TranslateContext);
}

function isSkippable(el: Element | null): boolean {
  let node: Element | null = el;
  while (node) {
    if (SKIP_TAGS.has(node.tagName) || node.hasAttribute("data-no-translate")) return true;
    node = node.parentElement;
  }
  return false;
}

function hasLetters(value: string) {
  return /\p{L}{2,}/u.test(value);
}

export function TranslateProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<SiteLang>("pt");
  const [translating, setTranslating] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // cache por idioma: texto original -> tradução
  const dict = useRef<Record<SiteLang, Map<string, string>>>({
    pt: new Map(),
    en: new Map(),
    es: new Map(),
  });
  // nós já traduzidos, para restaurar o português
  const textOriginals = useRef(new Map<Text, string>());
  const attrOriginals = useRef(new Map<string, { el: Element; attr: string; value: string }>());
  const observer = useRef<MutationObserver | null>(null);
  const running = useRef(false);
  const rerun = useRef(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as SiteLang | null;
    if (stored === "en" || stored === "es") setLangState(stored);
  }, []);

  const setLang = useCallback((next: SiteLang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const restore = useCallback(() => {
    for (const [node, original] of textOriginals.current) {
      if (node.isConnected) node.data = original;
    }
    textOriginals.current.clear();
    for (const { el, attr, value } of attrOriginals.current.values()) {
      if (el.isConnected) el.setAttribute(attr, value);
    }
    attrOriginals.current.clear();
  }, []);

  const collect = useCallback(() => {
    const textNodes: Text[] = [];
    const attrTargets: Array<{ el: Element; attr: string; value: string }> = [];

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    while (current) {
      const node = current as Text;
      const value = node.data.trim();
      if (value && hasLetters(value) && !isSkippable(node.parentElement)) textNodes.push(node);
      current = walker.nextNode();
    }

    for (const attr of ATTRS) {
      document.body.querySelectorAll(`[${attr}]`).forEach((el) => {
        const value = el.getAttribute(attr)?.trim();
        if (value && hasLetters(value) && !isSkippable(el)) attrTargets.push({ el, attr, value });
      });
    }

    return { textNodes, attrTargets };
  }, []);

  const applyPass = useCallback(
    async (target: SiteLang) => {
      if (target === "pt") return;
      if (running.current) {
        rerun.current = true;
        return;
      }
      running.current = true;

      try {
        const cache = dict.current[target];
        const { textNodes, attrTargets } = collect();

        const pending = new Set<string>();
        for (const node of textNodes) {
          const source = node.data.trim();
          if (!cache.has(source)) pending.add(source);
        }
        for (const item of attrTargets) {
          if (!cache.has(item.value)) pending.add(item.value);
        }

        const list = Array.from(pending).slice(0, 600);
        if (list.length > 0) {
          setTranslating(true);
          const chunks: string[][] = [];
          for (let i = 0; i < list.length; i += 60) chunks.push(list.slice(i, i + 60));
          const results = await Promise.all(
            chunks.map((texts) =>
              translateBatch({ data: { lang: target, texts } }).catch(() => ({
                ok: false as const,
                map: {} as Record<string, string>,
              })),
            ),
          );
          for (const result of results) {
            for (const [source, value] of Object.entries(result.map)) cache.set(source, value);
          }
        }

        observer.current?.disconnect();
        for (const node of textNodes) {
          if (!node.isConnected) continue;
          const source = node.data.trim();
          const translated = cache.get(source);
          if (!translated || translated === source) continue;
          if (!textOriginals.current.has(node)) textOriginals.current.set(node, node.data);
          node.data = node.data.replace(source, translated);
        }
        for (const { el, attr, value } of attrTargets) {
          if (!el.isConnected) continue;
          const translated = cache.get(value);
          if (!translated || translated === value) continue;
          const key = `${attr}:${value}:${Math.random()}`;
          if (![...attrOriginals.current.values()].some((i) => i.el === el && i.attr === attr)) {
            attrOriginals.current.set(key, { el, attr, value });
          }
          el.setAttribute(attr, translated);
        }
        observer.current?.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      } finally {
        setTranslating(false);
        running.current = false;
        if (rerun.current) {
          rerun.current = false;
          void applyPass(target);
        }
      }
    },
    [collect],
  );

  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : lang;
    if (lang === "pt") {
      observer.current?.disconnect();
      observer.current = null;
      restore();
      return;
    }

    let timer: number | undefined;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => void applyPass(lang), 250);
    };

    observer.current?.disconnect();
    observer.current = new MutationObserver(schedule);
    observer.current.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    schedule();

    return () => {
      window.clearTimeout(timer);
      observer.current?.disconnect();
    };
  }, [lang, pathname, applyPass, restore]);

  const value = useMemo(() => ({ lang, setLang, translating }), [lang, setLang, translating]);

  return <TranslateContext.Provider value={value}>{children}</TranslateContext.Provider>;
}
