import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BarChart3, Bot, CheckCircle2, ChevronRight, Cog, FileText, Globe, Shield, Target, Terminal, Upload } from 'lucide-react';
import Footer from '../components/layout/Footer';
import Sentrixcreatorvaibhav from '../assets/Sentrixcreatorvaibhav.png';


const modules = [
  { code: 'ISO 37001', name: 'Anti-bribery management', focus: 'Bribery risk assessment, due diligence, financial controls, gifts and hospitality, and whistleblowing readiness.', checks: 42, color: 'var(--blue-700)' },
  { code: 'ISO 37301', name: 'Compliance management', focus: 'Compliance obligations, risk assessment, controls, reporting mechanisms, and continual improvement cycles.', checks: 37, color: 'var(--green)' },
  { code: 'ISO 27001', name: 'Information security', focus: 'ISMS scoping, risk treatment, Annex A controls, and Statement of Applicability coverage analysis.', checks: 29, color: 'var(--chart-2)' },
  { code: 'ISO 9001', name: 'Quality management', focus: 'Customer requirements, design and development, production control, and nonconformity management.', checks: 31, color: 'var(--chart-5)' },
];

const valuePillars = [
  {
    title: 'One document pack, every standard at once',
    desc: 'Assess a shared policy and evidence inventory across ISO 37001, 37301, 27001, and 9001 simultaneously without running four disconnected audits.',
  },
  {
    title: 'Explainable AI, not black-box scoring',
    desc: 'Claude-powered agents map findings to specific ISO clauses, surface evidence gaps, and explain why readiness scores move so compliance teams can trust the output.',
  },
  {
    title: 'From finding to remediation in one flow',
    desc: 'The platform does not stop at detection. It prioritizes gaps, sequences a phased remediation roadmap, and generates audit-ready policy documents for action.',
  },
];

const steps = [
  { icon: Upload, step: 'Step 1', title: 'Upload governance documents', desc: 'Bring policies, procedures, and evidence packs into one governed workspace alongside your organization profile.' },
  { icon: Bot, step: 'Step 2', title: 'Claude agents run the pipeline', desc: 'Seven specialized agents on the Claude 5th-Gen Agentic Engine parse documents, map clauses, validate evidence, and score readiness across standards.' },
  { icon: AlertTriangle, step: 'Step 3', title: 'Identify gaps and weak evidence', desc: 'The platform highlights non-conformities, insufficient evidence, and the clause-level issues most likely to fail an audit.' },
  { icon: Target, step: 'Step 4', title: 'Generate remediation roadmap', desc: 'SentriX turns findings into prioritized remediation actions with ownership, effort estimates, and phased execution guidance.' },
  { icon: FileText, step: 'Step 5', title: 'Produce audit-ready reports', desc: 'Generate executive briefings, clause findings registers, and compliant policy documents ready for board, audit, and certification review.' },
];

const previewScores = [
  { code: 'ISO 37001', score: 61, color: 'var(--blue-700)' },
  { code: 'ISO 37301', score: 68, color: 'var(--green)' },
  { code: 'ISO 27001', score: 58, color: 'var(--chart-2)' },
  { code: 'ISO 9001', score: 74, color: 'var(--chart-5)' },
];

const heroSignals = [
  'Seven-agent compliance pipeline powered by Claude Sonnet 5 and Claude Fable 5',
  'Clause-level scoring with AI copilot explanations for every finding',
  'Evidence validation, gap analysis, and phased remediation sequencing in one run',
];

const copilotQuestions = [
  'Why is my ISO 37001 score low?',
  'What should we remediate first?',
  'Summarize this assessment for the board',
];

const analyticsViews = [
  { icon: BarChart3, title: 'Readiness trend', desc: 'Track compliance scores over time, identify standards regressing, and see the overall governance posture trend.' },
  { icon: AlertTriangle, title: 'Clause heatmap', desc: 'Surface the clauses and controls creating the highest audit risk through clause-level readiness intelligence.' },
  { icon: Target, title: 'Remediation priorities', desc: 'Rank quick wins versus strategic fixes using severity, effort, and expected score uplift from the remediation agent.' },
  { icon: Cog, title: 'Peer benchmarking', desc: 'Compare compliance posture against industry benchmarks and understand where attention is most needed.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-shell" id="top">
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal), var(--green))' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--slate-900)' }}>SentriX</div>
        </div>

        <div className="landing-links" style={{ alignItems: 'center' }}>
          <a href="/#how-it-works" style={{ color: 'var(--slate-600)', textDecoration: 'none', fontWeight: 600 }}>How it works</a>
          <a href="/#copilot" style={{ color: 'var(--slate-600)', textDecoration: 'none', fontWeight: 600 }}>Copilot</a>
          <a href="/#analytics" style={{ color: 'var(--slate-600)', textDecoration: 'none', fontWeight: 600 }}>Analytics</a>
          <a href="/#modules" style={{ color: 'var(--slate-600)', textDecoration: 'none', fontWeight: 600 }}>Standards</a>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Launch app</button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-container landing-hero-grid">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <motion.span
              className="landing-eyebrow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Shield size={14} /> Claude 5th-Gen Agentic Engine · Sonnet 5 + Fable 5
            </motion.span>

            <h1 className="landing-title">
              Agentic AI Compliance
              <br />
              &amp; Multi-Standard Readiness
            </h1>

            <p className="landing-copy">
              Upload your policy documents and receive instant readiness scores, gap analysis, evidence validation, and phased remediation roadmaps across multiple ISO standards &mdash; all driven by autonomous Claude agents.
            </p>

            <p className="landing-copy landing-copy-secondary">
              Connect your governance documents and organization profile. SentriX orchestrates seven specialized agents on Claude Sonnet 5 and Claude Fable 5 to produce clause-level scores, audit-grade findings, and remediation roadmaps.
            </p>

            <div className="landing-actions">
              <button onClick={() => navigate('/assessment')} className="btn btn-primary">Run an assessment <ArrowRight size={16} /></button>
              <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">View compliance dashboard</button>
            </div>

            <div className="landing-proof-row" style={{ marginTop: 22 }}>
              {heroSignals.map((signal) => (
                <div key={signal} className="landing-proof-card">
                  <CheckCircle2 size={14} />
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="landing-preview">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
              <div>
                <div className="summary-stat-label" style={{ color: 'var(--blue-700)' }}>Assessment outcome preview</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--slate-900)', marginTop: 4 }}>Multi-standard readiness snapshot</div>
                <div className="summary-stat-copy">One document pack translated into scores, gaps, and actions for compliance stakeholders.</div>
              </div>
              <Shield size={28} style={{ color: 'var(--blue-700)' }} />
            </div>

            <div className="landing-score-grid">
              {previewScores.map((item, index) => (
                <motion.div
                  key={item.code}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + index * 0.08 }}
                  className="landing-card"
                  style={{ padding: 18 }}
                >
                  <div className="summary-stat-label" style={{ color: item.color }}>{item.code}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 800, color: item.color, lineHeight: 1, marginTop: 8 }}>{item.score}%</div>
                  <div style={{ height: 8, borderRadius: 999, background: 'var(--slate-100)', overflow: 'hidden', marginTop: 14 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.score}%` }} transition={{ delay: 0.5 + index * 0.08, duration: 0.8 }} style={{ height: '100%', borderRadius: 999, background: item.color }} />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="landing-preview-list">
              <div className="landing-preview-item">
                <div className="landing-preview-item-label">AI finding</div>
                <div className="landing-preview-item-copy">Claude agents flagged missing due diligence procedures and an undocumented risk treatment plan suppressing your ISO 37001 score.</div>
              </div>
              <div className="landing-preview-item">
                <div className="landing-preview-item-label">Priority action</div>
                <div className="landing-preview-item-copy">Close the highest-severity mandatory gaps first to lift cross-standard readiness with the fastest effort-to-impact ratio.</div>
              </div>
              <div className="landing-preview-item">
                <div className="landing-preview-item-label">Executive output</div>
                <div className="landing-preview-item-copy">Generate a board-ready briefing, clause findings register, and phased remediation roadmap in the same workflow.</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-container">
          <div style={{ marginBottom: 28 }}>
            <div className="section-label">Product differentiation</div>
            <h2 className="enterprise-hero-title" style={{ marginTop: 10, marginBottom: 0 }}>Why SentriX stands out</h2>
            <p className="enterprise-hero-copy landing-section-lead" style={{ marginTop: 10 }}>Designed for enterprise compliance teams and obvious enough for judges to understand in under a minute.</p>
          </div>

          <div className="landing-section-grid">
            {valuePillars.map((item, index) => (
              <motion.div 
                key={item.title} 
                initial={{ opacity: 0, y: 12 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                whileHover={{ y: -6, scale: 1.01, boxShadow: '0 20px 40px rgba(20, 32, 51, 0.08)', borderColor: 'rgba(37, 99, 235, 0.2)' }}
                viewport={{ once: true }} 
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: index * 0.06 }} 
                className="landing-feature"
              >
                <div className="landing-kicker">Differentiator {index + 1}</div>
                <div className="action-card-title" style={{ marginTop: 10 }}>{item.title}</div>
                <div className="action-card-copy" style={{ marginTop: 10 }}>{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="landing-section">
        <div className="landing-container">
          <div style={{ marginBottom: 28 }}>
            <div className="section-label">How it works</div>
            <h2 className="enterprise-hero-title" style={{ marginTop: 10, marginBottom: 0 }}>A guided pipeline from document upload to audit-ready remediation</h2>
            <p className="enterprise-hero-copy landing-section-lead" style={{ marginTop: 10 }}>The product narrative is simple: upload documents, let the Claude agents do the heavy analysis, then act on the findings with confidence.</p>
          </div>

          <div className="landing-step-grid">
            {steps.map((item, index) => (
              <motion.div 
                key={item.title} 
                initial={{ opacity: 0, y: 12 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                whileHover={{ y: -6, scale: 1.01, boxShadow: '0 20px 40px rgba(20, 32, 51, 0.08)', borderColor: 'rgba(37, 99, 235, 0.2)' }}
                viewport={{ once: true }} 
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: index * 0.08 }} 
                className="landing-feature"
              >
                <div className="landing-step-top">
                  <div className="landing-step-index">{item.step}</div>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--teal), var(--green))', color: 'white', marginBottom: 16 }}>
                  <item.icon size={20} />
                </div>
                <div className="action-card-title">{item.title}</div>
                <div className="action-card-copy" style={{ marginTop: 8 }}>{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="copilot" className="landing-section">
        <div className="landing-container">
          <div style={{ marginBottom: 28 }}>
            <div className="section-label">SentriX Copilot</div>
            <h2 className="enterprise-hero-title" style={{ marginTop: 10, marginBottom: 0 }}>Ask compliance questions in plain language</h2>
            <p className="enterprise-hero-copy landing-section-lead" style={{ marginTop: 10 }}>The copilot explains readiness scores, prioritizes remediation, and summarizes assessment reports so compliance teams and executives do not need to parse raw clause tables on their own.</p>
          </div>

          <div className="landing-split-grid">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="landing-feature">
              <div className="landing-kicker">Ask questions like</div>
              <div className="landing-question-list">
                {copilotQuestions.map((question) => (
                  <div key={question} className="landing-question-chip">
                    <Bot size={16} />
                    <span>{question}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }} className="landing-preview landing-preview-copilot">
              <div className="landing-kicker">Copilot response style</div>
              <div className="action-card-title" style={{ marginTop: 10 }}>Clear answers tied to evidence and next actions</div>
              <div className="action-card-copy" style={{ marginTop: 10 }}>
                SentriX explains why a score is low, which gaps matter most, what should be remediated first, and how remediation will change readiness over time.
              </div>
              <div className="landing-preview-list" style={{ marginTop: 18 }}>
                <div className="landing-preview-item">
                  <div className="landing-preview-item-label">Why is the score low?</div>
                  <div className="landing-preview-item-copy">Missing due diligence procedures, undocumented financial controls, and an incomplete compliance obligation register are suppressing your readiness score.</div>
                </div>
                <div className="landing-preview-item">
                  <div className="landing-preview-item-label">What should we fix first?</div>
                  <div className="landing-preview-item-copy">Start with high-severity, cross-standard gaps like risk assessment and document control because closing them lifts readiness across multiple standards at once.</div>
                </div>
                <div className="landing-preview-item">
                  <div className="landing-preview-item-label">Can you summarize the assessment?</div>
                  <div className="landing-preview-item-copy">Yes. The copilot converts raw clause and evidence data into board-friendly narratives, remediation actions, and executive summaries.</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="analytics" className="landing-section">
        <div className="landing-container">
          <div style={{ marginBottom: 28 }}>
            <div className="section-label">Enterprise analytics</div>
            <h2 className="enterprise-hero-title" style={{ marginTop: 10, marginBottom: 0 }}>Dashboards built for compliance operations</h2>
            <p className="enterprise-hero-copy landing-section-lead" style={{ marginTop: 10 }}>The analytics workspace is not cosmetic. It helps leadership understand readiness posture, gap concentration, and where remediation investment will matter most.</p>
          </div>

          <div className="landing-section-grid">
            {analyticsViews.map((item, index) => (
              <motion.div 
                key={item.title} 
                initial={{ opacity: 0, y: 12 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                whileHover={{ y: -6, scale: 1.01, boxShadow: '0 20px 40px rgba(20, 32, 51, 0.08)', borderColor: 'rgba(37, 99, 235, 0.2)' }}
                viewport={{ once: true }} 
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: index * 0.06 }} 
                className="landing-feature"
              >
                <div style={{ width: 44, height: 44, borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--blue-50)', color: 'var(--blue-700)', marginBottom: 16 }}>
                  <item.icon size={20} />
                </div>
                <div className="action-card-title">{item.title}</div>
                <div className="action-card-copy" style={{ marginTop: 8 }}>{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="modules" className="landing-section">
        <div className="landing-container">
          <div style={{ marginBottom: 28 }}>
            <div className="section-label">Standards coverage</div>
            <h2 className="enterprise-hero-title" style={{ marginTop: 10, marginBottom: 0 }}>ISO standards coverage built for modern governance programs</h2>
            <p className="enterprise-hero-copy landing-section-lead" style={{ marginTop: 10 }}>SentriX highlights how one document pack performs across anti-bribery, compliance, information security, and quality management standards.</p>
          </div>

          <div className="landing-mapping-grid">
            {modules.map((module, index) => (
              <motion.div 
                key={module.code} 
                initial={{ opacity: 0, y: 12 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                whileHover={{ y: -6, scale: 1.01, boxShadow: '0 20px 45px rgba(20, 32, 51, 0.08)', borderColor: 'rgba(37, 99, 235, 0.2)' }}
                viewport={{ once: true }} 
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: index * 0.06 }} 
                className="landing-standard"
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div className="summary-stat-label" style={{ color: module.color }}>{module.code}</div>
                    <div className="action-card-title" style={{ marginTop: 8 }}>{module.name}</div>
                    <div className="action-card-copy" style={{ marginTop: 8 }}>{module.focus}</div>
                  </div>
                  <span className="badge badge-pending">{module.checks} checks</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 18, color: 'var(--blue-700)', fontSize: 13, fontWeight: 700 }}>
                  Multi-agent assessment ready <ChevronRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="landing-cta">
            <div className="section-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Deployment readiness</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 4vw, 52px)', lineHeight: 1.05, marginTop: 12 }}>Start assessing your compliance posture in minutes.</h2>
            <p style={{ marginTop: 14, maxWidth: 720, color: 'rgba(255,255,255,0.76)', fontSize: 16, lineHeight: 1.8 }}>
              Upload your policies, run the seven-agent Claude pipeline across anti-bribery, compliance, information security, and quality standards, and give your team a clear remediation path without waiting for a manual audit cycle.
            </p>
            <div className="landing-actions" style={{ marginTop: 24 }}>
              <button onClick={() => navigate('/assessment')} className="btn btn-primary">Start your first assessment <ArrowRight size={16} /></button>
              <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">Open compliance dashboard</button>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="landing-section landing-creator-section">
        <div className="landing-container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6, scale: 1.01, boxShadow: '0 32px 80px rgba(0,0,0,0.6)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="landing-creator-card"
          >
            <div className="landing-creator-glow" aria-hidden="true" />

            <div className="landing-creator-content">
              <div className="landing-creator-eyebrow">
                <Terminal size={14} />
                <span>root@sentrix:~$ whoami</span>
              </div>

              <h2 className="landing-creator-name">Engineered by Vaibhav Verma</h2>

              <p className="landing-creator-bio">
                Vaibhav builds agentic AI platforms end to end &mdash; from multi-agent orchestration pipelines and
                compliance intelligence engines to the full-stack React/Node ecosystems that turn raw policy documents
                into a readiness score a board can act on. SentriX runs on his upgraded Claude 5th-Gen Agentic Engine,
                pairing Claude Sonnet 5 for high-throughput document analysis with Claude Fable 5 for deep remediation
                planning and policy synthesis &mdash; seven specialized agents assessing an entire governance program
                without a human in the loop.
              </p>

              <div className="landing-creator-tags">
                <span className="landing-creator-tag">Claude 5th-Gen Agentic Engine</span>
                <span className="landing-creator-tag">Multi-Agent AI Pipelines</span>
                <span className="landing-creator-tag">Full-stack React / Node</span>
                <span className="landing-creator-tag">Compliance Intelligence</span>
              </div>

              <div className="landing-creator-links">
                <a
                  href="https://www.linkedin.com/in/vaibhav-verma-905a1b270/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-creator-link"
                  id="creator-linkedin"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span>linkedin.com/in/vaibhav-verma</span>
                </a>
                <a
                  href="https://github.com/vaaiiibbhav"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-creator-link"
                  id="creator-github"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  <span>github.com/vaaiiibbhav</span>
                </a>
                <a
                  href="https://vaaiiibbhav.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-creator-link"
                  id="creator-portfolio"
                >
                  <Globe size={16} />
                  <span>vaaiiibbhav.vercel.app</span>
                </a>
              </div>
            </div>

            <div className="landing-creator-image-wrapper">
              <img 
                src={Sentrixcreatorvaibhav} 
                alt="Vaibhav Verma" 
                className="landing-creator-image" 
              />
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
