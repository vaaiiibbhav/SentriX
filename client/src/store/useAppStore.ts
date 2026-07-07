import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AssessmentResult,
  OrgProfile,
  AgentStatus,
  AgentLogEntry,
  ChatMessage,
  StandardCode,
  Notification,
  UploadedDocumentInfo,
} from '../types';
import { demoAssessmentResult } from '../data/demo-data';

export type ThemeMode = 'light' | 'dark' | 'system';

interface AppState {
  // Assessment
  currentAssessment: AssessmentResult | null;
  assessmentHistory: AssessmentResult[];
  isAssessing: boolean;
  assessmentStep: number;

  // Organization profile
  orgProfile: OrgProfile;
  selectedStandards: StandardCode[];

  // Agent tracking
  agentStatuses: AgentStatus[];
  agentLog: AgentLogEntry[];

  // Chat
  chatMessages: ChatMessage[];
  isChatOpen: boolean;

  // Assessment context
  activeAssessmentSessionId: string | null;
  uploadedDocuments: UploadedDocumentInfo[];

  // UI
  isDemoMode: boolean;
  sidebarCollapsed: boolean;
  themeMode: ThemeMode;

  // Notifications
  notifications: Notification[];
  unreadCount: number;

  // Actions
  setAssessment: (result: AssessmentResult) => void;
  setIsAssessing: (v: boolean) => void;
  setAssessmentStep: (step: number) => void;
  setOrgProfile: (profile: Partial<OrgProfile>) => void;
  setSelectedStandards: (standards: StandardCode[]) => void;
  addAgentLog: (entry: AgentLogEntry) => void;
  updateAgentStatus: (name: string, update: Partial<AgentStatus>) => void;
  resetAgentStatuses: () => void;
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  toggleChat: () => void;
  setAssessmentContext: (sessionId: string | null, uploadedDocuments: UploadedDocumentInfo[]) => void;
  toggleDemoMode: () => void;
  loadDemoData: () => void;
  toggleSidebar: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  resetAssessment: () => void;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

const defaultAgentStatuses: AgentStatus[] = [
  { name: 'Document Parsing Agent', status: 'idle', progress: 0, currentAction: '' },
  { name: 'Clause Mapping Agent', status: 'idle', progress: 0, currentAction: '' },
  { name: 'Evidence Validation Agent', status: 'idle', progress: 0, currentAction: '' },
  { name: 'Compliance Scoring Agent', status: 'idle', progress: 0, currentAction: '' },
  { name: 'Gap Detection Agent', status: 'idle', progress: 0, currentAction: '' },
  { name: 'Remediation Planning Agent', status: 'idle', progress: 0, currentAction: '' },
  { name: 'Policy Generation Agent', status: 'idle', progress: 0, currentAction: '' },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
  currentAssessment: null,
  assessmentHistory: [],
  isAssessing: false,
  assessmentStep: 0,
  orgProfile: {
    companyName: '',
    industrySector: '',
    employeeCount: '',
    assessmentScope: 'full',
  },
  selectedStandards: [],
  agentStatuses: [...defaultAgentStatuses],
  agentLog: [],
  chatMessages: [],
  isChatOpen: false,
  activeAssessmentSessionId: null,
  uploadedDocuments: [],
  isDemoMode: false,
  sidebarCollapsed: false,
  themeMode: 'light',
  notifications: [],
  unreadCount: 0,

  setAssessment: (result) =>
    set((s) => ({
      currentAssessment: result,
      assessmentHistory: [...s.assessmentHistory, result],
      isAssessing: false,
    })),

  setIsAssessing: (v) => set({ isAssessing: v }),
  setAssessmentStep: (step) => set({ assessmentStep: step }),

  setOrgProfile: (profile) =>
    set((s) => ({ orgProfile: { ...s.orgProfile, ...profile } })),

  setSelectedStandards: (standards) => set({ selectedStandards: standards }),

  addAgentLog: (entry) =>
    set((s) => ({ agentLog: [...s.agentLog, entry] })),

  updateAgentStatus: (name, update) =>
    set((s) => ({
      agentStatuses: s.agentStatuses.map((a) =>
        a.name === name ? { ...a, ...update } : a
      ),
    })),

  resetAgentStatuses: () => set({ agentStatuses: [...defaultAgentStatuses], agentLog: [] }),

  addChatMessage: (msg) =>
    set((s) => ({ chatMessages: [...s.chatMessages, msg] })),

  clearChat: () => set({ chatMessages: [] }),

  toggleChat: () => set((s) => ({ isChatOpen: !s.isChatOpen })),

  setAssessmentContext: (sessionId, uploadedDocuments) => set({ activeAssessmentSessionId: sessionId, uploadedDocuments }),

  toggleDemoMode: () =>
    set((s) => {
      if (!s.isDemoMode) {
        return {
          isDemoMode: true,
          currentAssessment: demoAssessmentResult,
          activeAssessmentSessionId: null,
          uploadedDocuments: demoAssessmentResult.uploadedDocuments || [],
        };
      }
      return { isDemoMode: false, currentAssessment: null, activeAssessmentSessionId: null, uploadedDocuments: [] };
    }),

  loadDemoData: () =>
    set((s) => ({
      isDemoMode: true,
      currentAssessment: demoAssessmentResult,
      activeAssessmentSessionId: null,
      uploadedDocuments: demoAssessmentResult.uploadedDocuments || [],
      orgProfile: {
        companyName: 'Acme Corp Financial Services',
        industrySector: 'Financial Services',
        employeeCount: '1000-5000',
        assessmentScope: 'full',
      },
      selectedStandards: ['ISO37001', 'ISO37301', 'ISO27001', 'ISO9001'],
      notifications: [
        ...s.notifications,
        { id: `n-${Date.now()}-1`, type: 'success' as const, title: 'Demo Data Loaded', message: 'Sample assessment for Acme Corp loaded successfully.', timestamp: new Date().toISOString(), read: false },
        { id: `n-${Date.now()}-2`, type: 'warning' as const, title: '5 Critical Gaps Found', message: 'Immediate attention required for ISO 37001 and ISO 27001 gaps.', timestamp: new Date().toISOString(), read: false },
        { id: `n-${Date.now()}-3`, type: 'info' as const, title: 'Remediation Plan Ready', message: '9 actions across 3 phases generated.', timestamp: new Date().toISOString(), read: false },
      ],
      unreadCount: s.unreadCount + 3,
    })),

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  setThemeMode: (mode) => set({ themeMode: mode }),

  resetAssessment: () =>
    set({
      currentAssessment: null,
      isAssessing: false,
      assessmentStep: 0,
      activeAssessmentSessionId: null,
      uploadedDocuments: [],
      agentStatuses: [...defaultAgentStatuses],
      agentLog: [],
      chatMessages: [],
    }),

  addNotification: (n) =>
    set((s) => ({
      notifications: [
        { ...n, id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, timestamp: new Date().toISOString(), read: false },
        ...s.notifications,
      ].slice(0, 50),
      unreadCount: s.unreadCount + 1,
    })),

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, s.unreadCount - (s.notifications.find((n) => n.id === id && !n.read) ? 1 : 0)),
    })),

  markAllNotificationsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
    }),
    {
      name: 'SentriX-store',
      partialize: (state) => ({
        currentAssessment: state.currentAssessment,
        assessmentHistory: state.assessmentHistory,
        orgProfile: state.orgProfile,
        selectedStandards: state.selectedStandards,
        activeAssessmentSessionId: state.activeAssessmentSessionId,
        uploadedDocuments: state.uploadedDocuments,
        isDemoMode: state.isDemoMode,
        sidebarCollapsed: state.sidebarCollapsed,
        themeMode: state.themeMode,
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);
