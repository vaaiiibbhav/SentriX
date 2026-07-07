import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import AppLayout from './components/layout/AppLayout'
import { PageLoader } from './components/Skeleton'

const Landing = lazy(() => import('./pages/Landing'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Assessment = lazy(() => import('./pages/Assessment'))
const Standards = lazy(() => import('./pages/Standards'))
const AgentWorkflow = lazy(() => import('./pages/AgentWorkflow'))
const Analytics = lazy(() => import('./pages/Analytics'))
const KnowledgeBase = lazy(() => import('./pages/KnowledgeBase'))
const RiskIntelligence = lazy(() => import('./pages/RiskIntelligence'))
const ControlLibrary = lazy(() => import('./pages/ControlLibrary'))
const RemediationTracker = lazy(() => import('./pages/RemediationTracker'))
const AgentMonitoring = lazy(() => import('./pages/AgentMonitoring'))
const Reports = lazy(() => import('./pages/Reports'))
const Settings = lazy(() => import('./pages/Settings'))

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <Suspense fallback={<PageLoader />}>
            <PageTransition><Landing /></PageTransition>
          </Suspense>
        } />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition><Dashboard /></PageTransition>
            </Suspense>
          } />
          <Route path="/assessment" element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition><Assessment /></PageTransition>
            </Suspense>
          } />
          <Route path="/standards" element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition><Standards /></PageTransition>
            </Suspense>
          } />
          <Route path="/agents" element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition><AgentWorkflow /></PageTransition>
            </Suspense>
          } />
          <Route path="/analytics" element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition><Analytics /></PageTransition>
            </Suspense>
          } />
          <Route path="/knowledge-base" element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition><KnowledgeBase /></PageTransition>
            </Suspense>
          } />
          <Route path="/risk-intelligence" element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition><RiskIntelligence /></PageTransition>
            </Suspense>
          } />
          <Route path="/control-library" element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition><ControlLibrary /></PageTransition>
            </Suspense>
          } />
          <Route path="/remediation-tracker" element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition><RemediationTracker /></PageTransition>
            </Suspense>
          } />
          <Route path="/agent-monitoring" element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition><AgentMonitoring /></PageTransition>
            </Suspense>
          } />
          <Route path="/reports" element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition><Reports /></PageTransition>
            </Suspense>
          } />
          <Route path="/settings" element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition><Settings /></PageTransition>
            </Suspense>
          } />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return <AnimatedRoutes />
}

export default App
