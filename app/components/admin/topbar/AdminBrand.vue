<script setup lang="ts">
/**
 * Brand panel admin: mark, nama situs, dan label lingkungan.
 *
 * Dipakai dua kali di topbar — pada bilah atas maupun laci mobile —
 * sehingga bentuk dan jaraknya cukup didefinisikan sekali di sini.
 */
interface Props {
  brand?: string;
  mark?: string;
  env?: string;
  /** Rute tujuan saat brand diklik. */
  to?: string;
}

const props = withDefaults(defineProps<Props>(), {
  brand: "raka.dev",
  mark: "</>",
  env: "Admin",
  to: "/admin",
});
</script>

<template>
  <NuxtLink
    :to="props.to"
    class="flex shrink-0 items-center gap-2.5 font-display text-[1.02rem] font-extrabold tracking-tight text-admin-ink"
  >
    <span
      class="relative grid h-[33px] w-[33px] place-items-center rounded-[10px] bg-admin-ink font-mono text-[.72rem] font-bold text-white"
    >
      {{ props.mark }}
      <span
        class="absolute -right-[3px] -top-[3px] h-[9px] w-[9px] rounded-full border-2 border-white bg-admin-accent"
        aria-hidden="true"
      />
    </span>
    <span>{{ props.brand }}</span>
    <span
      class="rounded-md bg-admin-accent-soft px-2 py-[3px] font-mono text-[.62rem] font-bold uppercase tracking-[.13em] text-admin-accent"
    >
      {{ props.env }}
    </span>
  </NuxtLink>
</template>
