<script setup lang="ts">
/**
 * Bagian Stack: kartu kategori teknologi + terminal yang
 * mengetik konfigurasi developer secara otomatis.
 *
 * Grup & item teknologi diambil dari `/api/stack`.
 * Isi terminal diatur lewat `DEVELOPER_CONFIG` di bawah — cukup mengisi
 * data biasa, markup warna dan indentasinya dibuat otomatis.
 */
import { computed, onMounted, onUnmounted, ref } from "vue";
import EyebrowLabel from "~/components/ui/EyebrowLabel.vue";
import type { ApiResponse } from "~/types/api";
import type { StackGroup } from "~/types/stack";

const { data: stackResponse } =
  await useFetch<ApiResponse<StackGroup[]>>("/api/stack");

/** Grup teknologi yang ditampilkan pada kartu. */
const stackGroups = computed<StackGroup[]>(
  () => stackResponse.value?.data ?? [],
);

// ---------------------------------------------------------------------------
// Terminal — satu-satunya tempat yang perlu disentuh untuk mengubah isi terminal.
//
// Isi `DEVELOPER_CONFIG` dengan data biasa; markup warna, kutip, dan indentasi
// dibentuk otomatis. Menambah, mengubah, atau menghapus key tidak perlu
// menyentuh template maupun logika animasi mengetik.
//
// Nilai yang didukung:
//   string     → "nilai"        warna aksen
//   string[]   → ["a", "b"]     tiap elemen warna aksen
//   number     → 42             warna ungu
//   boolean    → true           warna ungu
//   object     → blok bersarang, indentasinya mengikuti otomatis
// ---------------------------------------------------------------------------

/** Nilai daun: nilai yang cukup tampil pada satu baris. */
type TerminalScalar = string | number | boolean | string[];

/** Nilai yang boleh berada di dalam `DEVELOPER_CONFIG`. */
type TerminalValue = TerminalScalar | TerminalConfig;

/** Objek terminal: key apa pun bebas ditambah. */
interface TerminalConfig {
  [key: string]: TerminalValue;
}

/** Nama tab pada header terminal. */
const TERMINAL_FILE_NAME = "~/noel/stack.ts";
/** Komentar pada baris pertama terminal. */
const TERMINAL_COMMENT = "// noel.config.ts";
/** Nama konstanta yang diekspor. */
const TERMINAL_CONST_NAME = "developer";

/** Data yang diketik oleh terminal. Ubah, tambah, atau hapus key di sini saja. */
const DEVELOPER_CONFIG: TerminalConfig = {
  name: "Noel",
  role: "Full-Stack Engineer",
  focus: ["product", "performance", "craft"],
  openToWork: true,
  stack: {
    frontend: {
      language: "JavaScript + TypeScript",
      framework: "Vue.js, Nuxt.js, React",
      styling: "Tailwind CSS",
    },
    backend: {
      language: "JavaScript + TypeScript",
      framework: "Express.js, NestJS, Fastify",
    },
    database: {
      system: "MySQL, PostgreSQL",
    },
    tools: {
      system: "Git, Docker",
    },
  },
};

/** Warna sintaks. Kelima kelas di bawah harus tetap tertulis literal agar terdeteksi Tailwind. */
const KEY_COLOR = "text-[#79C0FF]";
const STRING_COLOR = "text-accent";
const LITERAL_COLOR = "text-[#D2A8FF]";
const KEYWORD_COLOR = "text-[#FF7B63]";
const COMMENT_COLOR = "text-muted-2";

/** Hasil render dimasukkan lewat `v-html`, jadi tanda `<`, `>`, `&`, dan `"` harus di-escape. */
const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const isPlainObject = (value: TerminalValue): value is TerminalConfig =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Render satu nilai daun menjadi markup terminal. */
const renderValue = (value: TerminalScalar): string => {
  if (typeof value === "string") {
    return `<span class="${STRING_COLOR}">"${escapeHtml(value)}"</span>`;
  }

  if (Array.isArray(value)) {
    const items = value.map(
      (item) => `<span class="${STRING_COLOR}">"${escapeHtml(item)}"</span>`,
    );
    return `[${items.join(", ")}]`;
  }

  return `<span class="${LITERAL_COLOR}">${String(value)}</span>`;
};

/** Render isi objek menjadi beberapa baris, lengkap dengan indentasinya. */
const renderConfigLines = (config: TerminalConfig, depth: number): string[] => {
  const pad = "  ".repeat(depth);
  const lines: string[] = [];

  for (const [key, value] of Object.entries(config)) {
    const keyMarkup = `<span class="${KEY_COLOR}">${escapeHtml(key)}</span>`;

    // Objek bersarang dibuka sebagai blok, isinya dirender mendalam satu tingkat.
    if (isPlainObject(value)) {
      lines.push(`${pad}${keyMarkup}: {`);
      lines.push(...renderConfigLines(value, depth + 1));
      lines.push(`${pad}},`);
      continue;
    }

    lines.push(`${pad}${keyMarkup}: ${renderValue(value)},`);
  }

  return lines;
};

/** Baris terminal dengan markup sintaks highlight, dibentuk dari `DEVELOPER_CONFIG`. */
const TERMINAL_LINES: string[] = [
  `<span class="${COMMENT_COLOR}">${escapeHtml(TERMINAL_COMMENT)}</span>`,
  `<span class="${KEYWORD_COLOR}">export const</span> <span class="${KEY_COLOR}">${escapeHtml(TERMINAL_CONST_NAME)}</span> = {`,
  ...renderConfigLines(DEVELOPER_CONFIG, 1),
  "};",
];

const termRef = ref<HTMLElement | null>(null);

/** State terminal: daftar baris yang sudah "selesai" diketik. */
const typedLines = ref<string[]>([]);
const showCaret = ref(false);

onMounted(() => {
  const el = termRef.value;
  if (!el) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const renderAll = () => {
    typedLines.value = [...TERMINAL_LINES];
    showCaret.value = true;
  };

  if (reducedMotion || !("IntersectionObserver" in window)) {
    renderAll();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(el);
        typeSequentially();
      });
    },
    { threshold: 0.3 },
  );
  observer.observe(el);

  onUnmounted(() => observer.disconnect());

  /** Ketik baris demi baris, karakter demi karakter (tag HTML dilewati). */
  function typeSequentially() {
    let lineIndex = 0;

    const typeLine = () => {
      if (lineIndex >= TERMINAL_LINES.length) {
        showCaret.value = true;
        return;
      }

      const raw = TERMINAL_LINES[lineIndex] ?? "";
      const tokens = raw.match(/<[^>]+>|&[a-z]+;|./gi) ?? [];
      let buffer = "";

      const tick = () => {
        if (tokens.length === 0) {
          typedLines.value[lineIndex] = buffer;
          lineIndex += 1;
          setTimeout(typeLine, 160);
          return;
        }

        const token = tokens.shift();
        if (token === undefined) return;
        buffer += token;
        typedLines.value[lineIndex] = buffer;

        const isTag = token.startsWith("<");
        setTimeout(tick, isTag ? 0 : 14);
      };

      typedLines.value[lineIndex] = "";
      tick();
    };

    typeLine();
  }
});
</script>

<template>
  <section id="stack" class="py-[118px]">
    <div
      class="mx-auto w-[min(1240px,100%-48px)] max-[680px]:w-[min(1240px,100%-32px)]"
    >
      <div
        class="mb-14 flex flex-wrap items-end justify-between gap-7 max-[680px]:mb-[38px]"
      >
        <div v-reveal>
          <EyebrowLabel>Toolkit</EyebrowLabel>
          <h2
            class="mt-4 font-display text-[clamp(2.1rem,5.2vw,3.65rem)] font-extrabold leading-[0.98] tracking-[-0.025em]"
          >
            Languages &amp;<br /><em class="not-italic text-accent"
              >frameworks.</em
            >
          </h2>
        </div>
        <p v-reveal class="max-w-[38ch] text-[0.98rem] text-muted">
          The stack I reach for daily — chosen for velocity, maintainability and
          developer happiness.
        </p>
      </div>

      <div
        class="grid grid-cols-[1.12fr_.88fr] items-stretch gap-[56px] max-[1100px]:grid-cols-1"
      >
        <!-- Kartu stack -->
        <div class="grid grid-cols-2 gap-4 max-[680px]:grid-cols-1">
          <div
            v-for="(group, index) in stackGroups"
            :key="group.title"
            v-reveal="index * 0.07"
            class="rounded-[18px] border border-line bg-surface p-6 transition-[transform,border-color,background] duration-[450ms] ease-[cubic-bezier(.22,.9,.28,1)] hover:-translate-y-[7px] hover:border-accent/40 hover:bg-surface-2"
          >
            <h3
              class="mb-4 flex items-center gap-2.5 font-display text-[1.06rem] font-bold tracking-[-0.015em]"
            >
              <span
                class="h-[9px] w-[9px] rotate-45 rounded-sm bg-accent"
                aria-hidden="true"
              />
              {{ group.title }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="item in group.items"
                :key="item"
                class="rounded-[9px] border border-line bg-white/[0.045] px-3 py-[7px] font-mono text-[0.72rem] text-muted transition-all duration-300 ease-[cubic-bezier(.22,.9,.28,1)] hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-accent-ink"
              >
                {{ item }}
              </span>
            </div>
          </div>
        </div>

        <!--
          Terminal.

          Kunci layoutnya: bungkus luar tidak punya konten dalam alur
          ( anaknya di-`absolute` ), sehingga tingginya tidak ikut menentukan
          tinggi baris grid. Baris grid murni ditentukan oleh kolom kartu,
          lalu bungkus luar ikut meregang mengikuti kartu lewat `items-stretch`.

          Akibatnya tinggi terminal selalu setinggi kartu. Bila isi terminal
          lebih panjang, hanya bagian dalam yang bisa digulir — judul tab tetap
          terlihat.

          `h-[520px]` dipakai hanya saat layout menumpuk (≤1100px), ketika
          terminal berdiri di baris grid sendiri sehingga tidak punya saudara
          yang bisa dijadikan acuan tinggi. Karena tingginya kini definit,
          isi yang lebih panjang otomatis tergulir.
        -->
        <div v-reveal="0.12" class="relative h-[520px] min-[1101px]:h-auto">
          <div
            class="absolute inset-0 flex flex-col overflow-hidden rounded-[18px] border border-line bg-[#08090B] shadow-[0_40px_80px_-34px_rgba(0,0,0,.9)]"
          >
            <div
              class="flex shrink-0 items-center gap-2 border-b border-line bg-white/[0.025] px-4 py-[13px]"
            >
              <i class="block h-[11px] w-[11px] rounded-full bg-[#FF5F57]" />
              <i class="block h-[11px] w-[11px] rounded-full bg-[#FEBC2E]" />
              <i class="block h-[11px] w-[11px] rounded-full bg-[#28C840]" />
              <span class="ml-2.5 font-mono text-[0.72rem] text-muted-2">{{
                TERMINAL_FILE_NAME
              }}</span>
            </div>
            <div
              ref="termRef"
              class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-[22px] font-mono text-[0.815rem] leading-[1.95]"
            >
              <div
                v-for="(line, index) in typedLines"
                :key="index"
                class="break-words whitespace-pre-wrap"
                v-html="line"
              />
              <span
                v-if="showCaret"
                class="inline-block h-[15px] w-2 -translate-y-0.5 bg-accent align-middle [animation:blink_1s_steps(2)_infinite]"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
