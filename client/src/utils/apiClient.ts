import axios from 'axios';
import toast from 'react-hot-toast';
import type {
  BackendAssessmentResult,
  ComplianceCopilotResponse,
  CopilotContextSnapshot,
  KnowledgeBaseOverview,
  QuestionnaireResponse,
  StandardCode,
  GovernanceLibraryItem,
  StandardLibraryItem,
  UploadedDocumentInfo,
} from '../types';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Please try again.');
    } else if (!error.response) {
      toast.error('Network error. Check your connection.');
    } else {
      const status = error.response.status;
      const message = error.response.data?.error || error.message;
      if (status === 400) {
        toast.error(`Bad request: ${message}`);
      } else if (status === 404) {
        toast.error('Resource not found.');
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      }
    }
    return Promise.reject(error);
  }
);

export const assessmentApi = {
  async uploadDocuments(files: File[]): Promise<UploadedDocumentInfo[]> {
    if (files.length === 0) {
      return [];
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.files;
  },

  async startAssessment(payload: {
    filePaths: string[];
    standards: StandardCode[];
    orgProfile: { company: string; industry: string; employees: string; scope: string };
    uploadedDocuments: UploadedDocumentInfo[];
  }): Promise<{ assessmentId: string; status: string }> {
    const response = await apiClient.post('/assessment/start', payload);
    return response.data;
  },

  async getResults(assessmentId: string): Promise<{ status: string; result?: BackendAssessmentResult }> {
    const response = await apiClient.get(`/assessment/${assessmentId}/results`);
    return response.data;
  },
};

export const copilotApi = {
  async askQuestion(payload: {
    message: string;
    assessmentId?: string | null;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    context?: CopilotContextSnapshot;
  }): Promise<ComplianceCopilotResponse> {
    const response = await apiClient.post('/chat/copilot', payload);
    return response.data;
  },
};

export const standardsApi = {
  async getLibrary(): Promise<{ standards: StandardLibraryItem[]; governance: GovernanceLibraryItem[] }> {
    const response = await apiClient.get('/standards/library');
    return response.data;
  },

  async getClauses(code: string): Promise<{ code: string; name: string; fullName?: string; version?: string; clauses: Array<{ id: string; title: string; description: string; category: string; weight?: number }> }> {
    const response = await apiClient.get(`/standards/${code}/clauses`);
    return response.data;
  },

  async getQuestionnaire(code: string): Promise<QuestionnaireResponse> {
    const response = await apiClient.get(`/standards/${code}/questionnaire`);
    return response.data;
  },

  async getKnowledgeBase(industry: string): Promise<KnowledgeBaseOverview> {
    const response = await apiClient.get('/standards/knowledge-base/overview', {
      params: { industry },
    });
    return response.data;
  },
};

export default apiClient;
