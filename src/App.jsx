import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-grid-slate/30" />

      {/* Gradient spotlight */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-[60vh] w-[90vw] max-w-6xl rounded-full bg-radial-blue blur-3xl opacity-40" />

      {/* Floating blobs */}
      <div className="gradient-blob blob-1" />
      <div className="gradient-blob blob-2" />
      <div className="gradient-blob blob-3" />

      {/* Noise overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.04] mix-blend-overlay" />
    </div>
  )
}

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.2 })
  return (
    <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-[2px] origin-left bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 z-30" />
  )
}

function Reveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}

function TiltCard({ children }) {
  const ref = useRef(null)

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const midX = rect.width / 2
    const midY = rect.height / 2
    const rotateX = ((y - midY) / midY) * -6
    const rotateY = ((x - midX) / midX) * 6
    el.style.setProperty('--rx', `${rotateX}deg`)
    el.style.setProperty('--ry', `${rotateY}deg`)
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="[transform:perspective(900px)_rotateX(var(--rx,0))_rotateY(var(--ry,0))] transition-transform duration-200 will-change-transform"
    >
      {children}
    </div>
  )
}

function App() {
  const [company, setCompany] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [lead, setLead] = useState({ name: '', email: '', company: '', message: '', country: '' })
  const [leadStatus, setLeadStatus] = useState({ state: 'idle', message: '' })

  const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          fetch(`${API}/api/company`),
          fetch(`${API}/api/services`),
        ])
        const c = await cRes.json()
        const s = await sRes.json()
        setCompany(c)
        setServices(s)
      } catch (e) {
        setCompany({
          name: 'SPEED OF MASTRY',
          headline: 'The leading technology partner across the Gulf and Saudi Arabia',
          subheadline: 'From strategy to delivery, we engineer scalable platforms, cloud-native systems, and AI solutions that power regional leaders.',
          stats: [
            { label: 'Projects Delivered', value: '+120' },
            { label: 'Enterprise Uptime', value: '99.99%' },
            { label: 'Avg. Launch Time', value: '8 weeks' },
          ],
          awards: ['Top Technology Innovator – KSA', 'Best Cloud Modernization Partner – GCC'],
        })
        setServices([
          { title: 'Custom Software', desc: 'High-performance web and mobile applications tailored to your business.', bullets: ['Product engineering', 'Microservices', 'API platforms'] },
          { title: 'Cloud & DevOps', desc: 'Secure, scalable cloud on AWS, Azure, and GCP with modern DevOps.', bullets: ['Kubernetes', 'CI/CD', 'Observability'] },
          { title: 'AI & Data', desc: 'Applied AI, analytics, and data platforms for real impact.', bullets: ['LLM apps', 'MLOps', 'Data lakes'] },
          { title: 'Digital Transformation', desc: 'From legacy to modern, accelerate delivery across the enterprise.', bullets: ['Cloud migration', 'ERP integrations', 'Governance'] },
        ])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const submitLead = async (e) => {
    e.preventDefault()
    setLeadStatus({ state: 'submitting', message: '' })
    try {
      const res = await fetch(`${API}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      })
      if (!res.ok) throw new Error('Failed to submit. Please try again.')
      await res.json()
      setLeadStatus({ state: 'success', message: 'Thank you! We will reach out shortly.' })
      setLead({ name: '', email: '', company: '', message: '', country: '' })
    } catch (err) {
      setLeadStatus({ state: 'error', message: err.message })
    }
  }

  const servicesWithDelay = useMemo(() => services.map((s, i) => ({ ...s, _delay: i * 0.06 })), [services])

  return (
    <div className="min-h-screen text-slate-800">
      <AnimatedBackground />
      <ScrollProgressBar />

      {/* Navbar */}
      <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md" />
            <span className="font-extrabold text-xl tracking-tight">SPEED OF MASTRY</span>
          </motion.div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#services" className="hover:text-blue-600 transition-colors">Services</a>
            <a href="#credibility" className="hover:text-blue-600 transition-colors">Why Us</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
            <a href="/test" className="text-slate-500 hover:text-blue-600 transition-colors">System Test</a>
          </nav>
          <a href="#contact" className="hidden md:inline-flex bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold shadow transition-colors">Work with us</a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div>
              <p className="inline-block text-xs uppercase tracking-widest font-semibold text-blue-700 bg-blue-50/70 px-2.5 py-1 rounded">Gulf • Saudi Arabia</p>
              <h1 className="mt-5 text-4xl md:text-6xl font-extrabold leading-tight">
                {company?.headline || 'Leading technology, delivered at speed.'}
              </h1>
              <p className="mt-5 text-lg text-slate-600 max-w-xl">
                {company?.subheadline || 'We build high-performance platforms, cloud-native systems, and AI products for ambitious organizations.'}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <motion.a whileHover={{ y: -2 }} whileTap={{ y: 0 }} href="#contact" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-md font-semibold shadow">Start your project</motion.a>
                <motion.a whileHover={{ y: -2 }} whileTap={{ y: 0 }} href="#services" className="px-5 py-3 rounded-md font-semibold border border-slate-300/80 hover:border-slate-400/90 bg-white/60 backdrop-blur">Explore services</motion.a>
              </div>
              <div id="credibility" className="mt-10 grid grid-cols-3 gap-6 max-w-lg">
                {(company?.stats || []).map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.05 }} className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-slate-900">{s.value}</div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative">
              <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 shadow-2xl relative overflow-hidden">
                {/* Animated shine */}
                <div className="absolute inset-0 [mask-image:radial-gradient(white,transparent_70%)]">
                  <div className="absolute -inset-1 shimmer" />
                </div>
              </motion.div>
              <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur rounded-xl shadow p-4 w-56 border border-slate-200">
                <div className="text-xs text-slate-500">Recognized in</div>
                <div className="mt-1 font-semibold">Saudi Arabia • GCC</div>
                <ul className="mt-2 text-sm list-disc pl-5 text-slate-600">
                  {(company?.awards || []).map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-white/60 backdrop-blur-sm border-y border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-extrabold">What we do</h2>
            <p className="mt-2 text-slate-600 max-w-2xl">End-to-end engineering for leaders in the Gulf—built for scale, security, and speed.</p>
          </Reveal>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicesWithDelay.map((svc, idx) => (
              <Reveal key={idx} delay={0.05 + svc._delay}>
                <TiltCard>
                  <motion.div whileHover={{ y: -6 }} className="group relative bg-white/80 backdrop-blur rounded-xl p-6 shadow-sm hover:shadow-xl transition-shadow border border-slate-200 overflow-hidden">
                    <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 mb-4 opacity-90 group-hover:opacity-100" />
                    <h3 className="font-bold text-lg">{svc.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{svc.desc}</p>
                    <ul className="mt-3 text-sm text-slate-600 list-disc pl-5 space-y-1">
                      {svc.bullets?.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </motion.div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-start">
          <Reveal>
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold">Let’s build something great</h2>
              <p className="mt-3 text-slate-600 max-w-xl">Tell us about your goals in Saudi Arabia or anywhere in the GCC. Our team will get back within 24 hours.</p>
              <div className="mt-8 grid grid-cols-2 gap-6">
                <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-xl p-6 shadow-sm">
                  <div className="text-sm text-slate-500">HQ</div>
                  <div className="font-semibold">Saudi Arabia</div>
                </div>
                <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-xl p-6 shadow-sm">
                  <div className="text-sm text-slate-500">Region</div>
                  <div className="font-semibold">Gulf Cooperation Council</div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={submitLead} className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-6 shadow">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium">Full name</label>
                  <input required value={lead.name} onChange={e => setLead({ ...lead, name: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="Your name" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium">Work email</label>
                  <input required type="email" value={lead.email} onChange={e => setLead({ ...lead, email: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="you@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Company</label>
                  <input value={lead.company} onChange={e => setLead({ ...lead, company: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="Company name" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Country</label>
                  <input value={lead.country} onChange={e => setLead({ ...lead, country: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="e.g., Saudi Arabia" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium">Project details</label>
                  <textarea value={lead.message} onChange={e => setLead({ ...lead, message: e.target.value })} rows={4} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="What are you building?" />
                </div>
              </div>
              <motion.button whileHover={{ y: -2 }} whileTap={{ y: 0 }} disabled={leadStatus.state === 'submitting'} type="submit" className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-md">
                {leadStatus.state === 'submitting' ? 'Sending…' : 'Request consultation'}
              </motion.button>
              {leadStatus.state === 'success' && (
                <p className="mt-3 text-green-600 text-sm">{leadStatus.message}</p>
              )}
              {leadStatus.state === 'error' && (
                <p className="mt-3 text-red-600 text-sm">{leadStatus.message}</p>
              )}
            </form>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-200/60 bg-white/60 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded bg-gradient-to-tr from-blue-600 to-indigo-500" />
            <span className="font-bold">SPEED OF MASTRY</span>
          </div>
          <div className="text-sm text-slate-500">© {new Date().getFullYear()} SPEED OF MASTRY. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

export default App
