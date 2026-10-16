<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface ProjectTag {
  name: string
}

interface ProjectItem {
  id?: string
  slug: string
  title: string
  description: string
  category: string
  year: number
  imageUrl: string
  href?: string | null
  featured?: boolean
  tags: ProjectTag[]
}

const menuOpen = ref(false)
const activeFilter = ref('all')
const progress = ref(0)
const clock = ref('--:--:--')
const currentYear = new Date().getFullYear()

const { data: projectResponse, status } = await useFetch<{ success: boolean; data: ProjectItem[] }>('/api/projects')

const projects = computed(() => projectResponse.value?.data || [])

const filteredProjects = computed(() => {
  if (activeFilter.value === 'all') return projects.value
  return projects.value.filter((p) => p.category === activeFilter.value)
})

const featuredProject = computed(() => {
  return filteredProjects.value.find((p) => p.featured) || (activeFilter.value === 'all' ? filteredProjects.value[0] : null)
})

const gridProjects = computed(() => {
  if (featuredProject.value) {
    return filteredProjects.value.filter((p) => p !== featuredProject.value)
  }
  return filteredProjects.value
})

const setFilter = (cat: string) => {
  activeFilter.value = cat
}

const updateScroll = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.value = max > 0 ? (window.scrollY / max) * 100 : 0
}

const updateClock = () => {
  try {
    clock.value = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta',
    }).format(new Date())
  } catch {
    clock.value = new Date().toLocaleTimeString()
  }
}

onMounted(() => {
  window.addEventListener('scroll', updateScroll, { passive: true })
  updateScroll()
  updateClock()
  const interval = setInterval(updateClock, 1000)

  onUnmounted(() => {
    window.removeEventListener('scroll', updateScroll)
    clearInterval(interval)
  })
})
</script>

<template>
  <div :class="{ 'menu-open': menuOpen }">
    <div id="progress" :style="{ width: progress + '%' }"></div>


<div id="progress"></div>

<!-- ================= NAV ================= -->
<header class="nav" id="nav">
  <div class="wrap nav-inner">
    <a href="#home" class="brand">
      <span class="brand-mark">&lt;/&gt;</span>
      raka.dev
    </a>
    <nav class="nav-links" id="navLinks">
      <a href="#home" class="active">Home</a>
      <a href="#about">About</a>
      <a href="#stack">Stack</a>
      <a href="#work">Work</a>
      <a href="#experience">Experience</a>
      <a href="#contact">Contact</a>
    </nav>
    <div class="nav-cta">
      <a href="#contact" class="btn btn-ghost">Download CV</a>
      <a href="#contact" class="btn btn-primary">Hire me <span class="arr">↗</span></a>
      <button class="burger" id="burger" aria-label="Open menu" @click="menuOpen = !menuOpen"><span></span><span></span></button>
    </div>
  </div>
</header>

<div class="mobile-panel" id="mobilePanel" :style="{ clipPath: menuOpen ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)' }" @click="menuOpen = false">
  <a href="#home">Home <span>01</span></a>
  <a href="#about">About <span>02</span></a>
  <a href="#stack">Stack <span>03</span></a>
  <a href="#work">Work <span>04</span></a>
  <a href="#experience">Experience <span>05</span></a>
  <a href="#contact">Contact <span>06</span></a>
  <div class="mobile-foot">
    <div>Jakarta, Indonesia — Open for freelance</div>
    <div style="margin-top:8px;color:var(--accent)">hello@rakadevano.dev</div>
  </div>
</div>

<!-- ================= HERO ================= -->
<section class="hero" id="home">
  <div class="hero-bg"></div>
  <div class="hero-mesh"></div>
  <div class="hero-mesh-2"></div>
  <div class="spotlight" id="spotlight"></div>

  <div class="wrap hero-grid">
    <div class="hero-left">
      <div class="hero-pill reveal">
        <span class="dot-live"></span> Available for freelance — Jakarta, ID
      </div>

      <h1 class="hero-title reveal" style="--d:.08s">
        I build digital<br>
        products that<br>
        <span class="rot-wrap"><span class="rot-item" id="rot">ship fast.</span></span>
      </h1>

      <p class="hero-lead reveal" style="--d:.16s">
        Full-stack developer with <strong>6+ years</strong> crafting scalable web platforms,
        design systems, and cloud architecture — from the first wireframe to the last deploy.
      </p>

      <div class="hero-actions reveal" style="--d:.24s">
        <a href="#work" class="btn btn-primary">View selected work <span class="arr">↗</span></a>
        <a href="#contact" class="btn btn-ghost">Let's talk</a>
      </div>

      <div class="hero-stats reveal" style="--d:.32s">
        <div>
          <div class="stat-num"><span class="count" data-target="6">0</span><span class="u">+</span></div>
          <div class="stat-label">Years exp</div>
        </div>
        <div>
          <div class="stat-num"><span class="count" data-target="48">0</span><span class="u">+</span></div>
          <div class="stat-label">Projects</div>
        </div>
        <div>
          <div class="stat-num"><span class="count" data-target="26">0</span><span class="u">+</span></div>
          <div class="stat-label">Clients</div>
        </div>
        <div>
          <div class="stat-num"><span class="count" data-target="12">0</span><span class="u"></span></div>
          <div class="stat-label">Open source</div>
        </div>
      </div>
    </div>

    <div class="photo-stage reveal" style="--d:.2s">
      <div class="photo-frame">
        <span class="photo-corner tl"></span>
        <span class="photo-corner br"></span>
        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80" alt="Portrait of Raka Devano">
        <div class="photo-tag">
          <div>
            <div class="name">Raka Devano</div>
            <div class="role">Product Engineer</div>
          </div>
          <div class="mono" style="font-size:.72rem;color:var(--muted)">EST. 2019</div>
        </div>
      </div>

      <div class="float-chip chip-1">
        <span class="ico" style="background:#61DAFB;color:#0A0B0D">R</span> React 19
      </div>
      <div class="float-chip chip-2">
        <span class="ico" style="background:#3178C6;color:#fff">TS</span> TypeScript
      </div>
      <div class="float-chip chip-3">
        <span class="ico" style="background:#8CC84B;color:#0A0B0D">N</span> Node.js
      </div>
    </div>
  </div>

  <div class="wrap">
    <div class="marquee">
      <div class="marquee-track" id="marquee">
        <div class="marquee-item">
          TypeScript <i></i> React <i></i> Next.js <i></i> Node.js <i></i> Go <i></i> PostgreSQL <i></i>
          GraphQL <i></i> Docker <i></i> AWS <i></i> Redis <i></i> Tailwind <i></i> Kubernetes <i></i>
        </div>
        <div class="marquee-item" aria-hidden="true">
          TypeScript <i></i> React <i></i> Next.js <i></i> Node.js <i></i> Go <i></i> PostgreSQL <i></i>
          GraphQL <i></i> Docker <i></i> AWS <i></i> Redis <i></i> Tailwind <i></i> Kubernetes <i></i>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ================= ABOUT ================= -->
<section class="about" id="about">
  <div class="wrap">
    <div class="sec-head reveal">
      <div>
        <div class="eyebrow">About me</div>
        <h2 class="sec-title" style="margin-top:16px">Engineering with<br><em>design sensibility.</em></h2>
      </div>
      <p class="sec-note">I care as much about pixel spacing and motion curves as I do about database indexes and CI pipelines.</p>
    </div>

    <div class="about-grid">
      <div class="about-visual reveal">
        <div class="about-photo">
          <img loading="lazy" src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80" alt="Workspace with code on screen">
        </div>
        <div class="about-badge">
          <div class="big">99%</div>
          <div class="small">On-time delivery across 48 shipped projects</div>
        </div>
      </div>

      <div class="about-copy">
        <p class="reveal">
          I'm <span class="hl">Raka</span>, a full-stack developer based in Jakarta. I started out writing
          PHP for local businesses, and today I architect <span class="hl">cloud-native platforms</span>
          used by thousands of people every day.
        </p>
        <p class="reveal" style="--d:.08s">
          My sweet spot is the intersection of <span class="hl">engineering and interface</span> —
          translating messy product requirements into clean APIs, resilient systems, and interfaces
          that feel obvious to use. I work best in small teams where design, code, and product sit at the same table.
        </p>
        <p class="reveal" style="--d:.16s">
          Outside of work you'll find me contributing to open source tooling, writing about
          performance budgets, or over-engineering my home lab.
        </p>

        <dl class="facts reveal" style="--d:.22s">
          <div class="fact"><dt>Based in</dt><dd>Jakarta, <span>Indonesia</span></dd></div>
          <div class="fact"><dt>Availability</dt><dd>Open — <span>Q3 2026</span></dd></div>
          <div class="fact"><dt>Timezone</dt><dd>GMT+7 <span>(WIB)</span></dd></div>
          <div class="fact"><dt>Languages</dt><dd>Indonesian, <span>English</span></dd></div>
        </dl>

        <a href="#contact" class="btn btn-ghost reveal" style="--d:.28s">More about my journey <span class="arr">↗</span></a>
      </div>
    </div>

    <!-- services -->
    <div class="sec-head reveal" style="margin-top:104px">
      <div>
        <div class="eyebrow">What I do</div>
        <h2 class="sec-title" style="margin-top:16px">Services built<br>for <em>shipping.</em></h2>
      </div>
      <p class="sec-note">End-to-end capability means fewer handoffs, fewer misunderstandings, and faster launches.</p>
    </div>

    <div class="svc">
      <div class="svc-row reveal">
        <div class="svc-idx">01</div>
        <div class="svc-name">Product Engineering</div>
        <div class="svc-desc">Web apps, dashboards & SaaS platforms built with Next.js, TypeScript and Node — from architecture to production.</div>
        <div class="svc-arrow">↗</div>
      </div>
      <div class="svc-row reveal" style="--d:.07s">
        <div class="svc-idx">02</div>
        <div class="svc-name">UI Engineering & Design Systems</div>
        <div class="svc-desc">Component libraries, motion design and accessibility-first interfaces that stay consistent as teams scale.</div>
        <div class="svc-arrow">↗</div>
      </div>
      <div class="svc-row reveal" style="--d:.14s">
        <div class="svc-idx">03</div>
        <div class="svc-name">Cloud & DevOps</div>
        <div class="svc-desc">AWS infrastructure, container orchestration, CI/CD pipelines and observability that let teams deploy with confidence.</div>
        <div class="svc-arrow">↗</div>
      </div>
      <div class="svc-row reveal" style="--d:.21s">
        <div class="svc-idx">04</div>
        <div class="svc-name">Technical Consulting</div>
        <div class="svc-desc">Code audits, performance budgets, architecture reviews and mentoring for growing engineering teams.</div>
        <div class="svc-arrow">↗</div>
      </div>
    </div>
  </div>
</section>

<!-- ================= STACK ================= -->
<section class="stack" id="stack">
  <div class="wrap">
    <div class="sec-head reveal">
      <div>
        <div class="eyebrow">Toolkit</div>
        <h2 class="sec-title" style="margin-top:16px">Languages &amp;<br><em>frameworks.</em></h2>
      </div>
      <p class="sec-note">The stack I reach for daily — chosen for velocity, maintainability and developer happiness.</p>
    </div>

    <div class="stack-grid">
      <div class="stack-cards">
        <div class="stack-card reveal">
          <h3><span class="sq"></span> Frontend</h3>
          <div class="chipset">
            <span class="chip">TypeScript</span><span class="chip">React</span><span class="chip">Next.js</span>
            <span class="chip">Vue</span><span class="chip">Tailwind CSS</span><span class="chip">Framer Motion</span>
            <span class="chip">GSAP</span><span class="chip">WebGL</span>
          </div>
        </div>
        <div class="stack-card reveal" style="--d:.07s">
          <h3><span class="sq"></span> Backend</h3>
          <div class="chipset">
            <span class="chip">Node.js</span><span class="chip">Go</span><span class="chip">NestJS</span>
            <span class="chip">GraphQL</span><span class="chip">gRPC</span><span class="chip">PostgreSQL</span>
            <span class="chip">Redis</span><span class="chip">MongoDB</span>
          </div>
        </div>
        <div class="stack-card reveal" style="--d:.14s">
          <h3><span class="sq"></span> Cloud &amp; DevOps</h3>
          <div class="chipset">
            <span class="chip">AWS</span><span class="chip">Docker</span><span class="chip">Kubernetes</span>
            <span class="chip">Terraform</span><span class="chip">GitHub Actions</span><span class="chip">Vercel</span>
            <span class="chip">Grafana</span>
          </div>
        </div>
        <div class="stack-card reveal" style="--d:.21s">
          <h3><span class="sq"></span> Design &amp; Tools</h3>
          <div class="chipset">
            <span class="chip">Figma</span><span class="chip">Storybook</span><span class="chip">Playwright</span>
            <span class="chip">Vitest</span><span class="chip">Linear</span><span class="chip">Git</span>
            <span class="chip">Figma MCP</span>
          </div>
        </div>
      </div>

      <div class="terminal reveal" style="--d:.12s">
        <div class="term-bar">
          <i></i><i></i><i></i>
          <span class="fname">~/raka/stack.ts</span>
        </div>
        <div class="term-body" id="term"></div>
      </div>
    </div>
  </div>
</section>

<!-- ================= WORK ================= -->
<section class="work" id="work">
  <div class="wrap">
    <div class="sec-head reveal">
      <div>
        <div class="eyebrow">Selected work</div>
        <h2 class="sec-title" style="margin-top:16px">Projects I've<br><em>shipped &amp; scaled.</em></h2>
      </div>
      <div class="filters" id="filters">
        <button
          v-for="cat in ['all', 'web', 'mobile', 'oss']"
          :key="cat"
          :class="['filter', activeFilter === cat ? 'on' : '']"
          @click="setFilter(cat)"
        >
          {{ cat === 'all' ? 'All' : cat === 'web' ? 'Web App' : cat === 'mobile' ? 'Mobile' : 'Open Source' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="status === 'pending'" class="py-12 text-center text-muted">
      Loading projects...
    </div>

    <div v-else>
      <!-- featured project -->
      <article
        v-if="featuredProject"
        class="project featured reveal"
        :data-cat="featuredProject.category"
      >
        <div class="project-img">
          <img loading="lazy" :src="featuredProject.imageUrl" :alt="featuredProject.title">
        </div>
        <div class="project-body">
          <div class="feat-label">★ Featured case study</div>
          <h3 class="project-title">{{ featuredProject.title }}</h3>
          <p class="project-desc">{{ featuredProject.description }}</p>
          <div class="project-tags">
            <span v-for="tag in featuredProject.tags" :key="tag.name" class="tag">{{ tag.name }}</span>
          </div>
          <div class="project-top">
            <a :href="featuredProject.href || '#'" class="project-link">View case study <span class="arr">→</span></a>
            <span class="year-chip">{{ featuredProject.year }}</span>
          </div>
        </div>
      </article>

      <!-- grid projects -->
      <div class="project-grid">
        <article
          v-for="item in gridProjects"
          :key="item.id || item.slug"
          class="project reveal"
          :data-cat="item.category"
        >
          <div class="project-img">
            <img loading="lazy" :src="item.imageUrl" :alt="item.title">
          </div>
          <div class="project-body">
            <div class="project-top">
              <h3 class="project-title">{{ item.title }}</h3>
              <span class="year-chip">{{ item.year }}</span>
            </div>
            <p class="project-desc">{{ item.description }}</p>
            <div class="project-tags">
              <span v-for="tag in item.tags" :key="tag.name" class="tag">{{ tag.name }}</span>
            </div>
            <a :href="item.href || '#'" class="project-link">{{ item.category === 'oss' ? 'View on GitHub' : 'Read more' }} <span class="arr">→</span></a>
          </div>
        </article>
      </div>
    </div>
  </div>
</section>

<!-- ================= EXPERIENCE ================= -->
<section class="exp" id="experience">
  <div class="wrap">
    <div class="sec-head reveal">
      <div>
        <div class="eyebrow">Career</div>
        <h2 class="sec-title" style="margin-top:16px">Experience &amp;<br><em>milestones.</em></h2>
      </div>
      <p class="sec-note">A path shaped by startups, scale-ups, and a lot of shipped code.</p>
    </div>

    <div class="timeline">
      <div class="tl-item reveal">
        <div class="tl-head">
          <h3 class="tl-role">Senior Full-Stack Engineer</h3>
          <span class="tl-date">2023 — Present</span>
        </div>
        <div class="tl-company">Northlane Technologies — Jakarta (Remote)</div>
        <p class="tl-desc">Leading the platform squad for a B2B SaaS analytics product serving 200+ enterprise accounts.</p>
        <ul class="tl-points">
          <li>Redesigned the event ingestion pipeline, reducing infrastructure cost by 34%.</li>
          <li>Introduced design-system-driven development across 3 product teams.</li>
          <li>Mentoring 5 engineers through weekly architecture reviews.</li>
        </ul>
      </div>

      <div class="tl-item reveal" style="--d:.08s">
        <div class="tl-head">
          <h3 class="tl-role">Full-Stack Developer</h3>
          <span class="tl-date">2021 — 2023</span>
        </div>
        <div class="tl-company">Satu Digital Studio — Bandung</div>
        <p class="tl-desc">Delivered 20+ client products across fintech, logistics and e-commerce.</p>
        <ul class="tl-points">
          <li>Built a reusable Next.js starter that cut project setup time by 2 weeks.</li>
          <li>Led migration from REST monolith to modular GraphQL services.</li>
        </ul>
      </div>

      <div class="tl-item reveal" style="--d:.16s">
        <div class="tl-head">
          <h3 class="tl-role">Frontend Developer</h3>
          <span class="tl-date">2019 — 2021</span>
        </div>
        <div class="tl-company">KaryaNusa — Yogyakarta</div>
        <p class="tl-desc">Focused on interface engineering, motion design and performance optimisation.</p>
        <ul class="tl-points">
          <li>Improved Core Web Vitals from "needs work" to green across 8 marketing sites.</li>
        </ul>
      </div>

      <div class="tl-item reveal" style="--d:.24s">
        <div class="tl-head">
          <h3 class="tl-role">B.Sc Computer Science</h3>
          <span class="tl-date">2015 — 2019</span>
        </div>
        <div class="tl-company">Universitas Gadjah Mada</div>
        <p class="tl-desc">Thesis on distributed caching strategies for high-traffic web applications.</p>
      </div>
    </div>
  </div>
</section>

<!-- ================= QUOTE ================= -->
<section class="quote">
  <div class="wrap">
    <div class="quote-box reveal">
      <div class="quote-mark">”</div>
      <p class="quote-text">
        Raka doesn't just write code — he <em>understands the product</em>.
        He shipped our dashboard two weeks early and it still runs flawlessly.
      </p>
      <div class="quote-author">
        <img loading="lazy" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" alt="Client portrait">
        <div>
          <div class="qa-name">Maya Prasetyo</div>
          <div class="qa-role">Head of Product — Nimbus</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ================= CONTACT ================= -->
<section class="contact" id="contact">
  <div class="contact-glow"></div>
  <div class="wrap">
    <h2 class="contact-title reveal">
      LET'S BUILD<br>
      <span class="outline">SOMETHING</span> <span class="accent">GOOD.</span>
    </h2>
    <p class="contact-sub reveal" style="--d:.1s">
      Got a product idea, a legacy system that needs rescuing, or a team that needs an extra pair of hands?
      My inbox is open.
    </p>
    <div class="contact-actions reveal" style="--d:.18s">
      <a href="mailto:hello@rakadevano.dev" class="btn btn-mail">hello@rakadevano.dev <span class="arr">↗</span></a>
      <a href="#" class="btn btn-ghost" style="padding:19px 30px">Book a call</a>
    </div>

    <div class="contact-cards">
      <div class="c-card reveal">
        <div class="k">Availability</div>
        <div class="v">Open for <span class="accent">freelance</span> & long-term</div>
      </div>
      <div class="c-card reveal" style="--d:.08s">
        <div class="k">Based in</div>
        <div class="v">Jakarta, Indonesia — GMT+7</div>
      </div>
      <div class="c-card reveal" style="--d:.16s">
        <div class="k">Response time</div>
        <div class="v">Usually within <span class="accent">24 hours</span></div>
      </div>
    </div>

    <div class="socials reveal" style="--d:.22s">
      <a class="social" href="#">GitHub</a>
      <a class="social" href="#">LinkedIn</a>
      <a class="social" href="#">Dribbble</a>
      <a class="social" href="#">X / Twitter</a>
      <a class="social" href="#">Instagram</a>
    </div>
  </div>
</section>

<!-- ================= FOOTER ================= -->
<footer>
  <div class="wrap foot-inner">
    <a href="#home" class="brand">
      <span class="brand-mark">&lt;/&gt;</span> raka.dev
    </a>
    <div class="foot-links">
      <a href="#about">About</a>
      <a href="#stack">Stack</a>
      <a href="#work">Work</a>
      <a href="#experience">Experience</a>
      <a href="#contact">Contact</a>
    </div>
    <div class="foot-meta">
      Jakarta <b id="clock">--:--:--</b> · © <span id="year">{{ currentYear }}</span> Raka Devano
    </div>
    <a href="#home" id="toTop" aria-label="Back to top">↑</a>
  </div>
</footer>


  </div>
</template>
