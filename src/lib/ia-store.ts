type Session = { id: string; title: string; updatedAt: string };
type Message = { id: string; text: string; from: 'client' | 'agent' | 'admin'; timestamp: string; role?: string; content?: string; createdAt?: string };

const globalForIaStore = globalThis as unknown as {
  mockSessions: Session[];
  mockMessages: Record<string, Message[]>;
};

export const mockSessions = globalForIaStore.mockSessions || [];
export const mockMessages = globalForIaStore.mockMessages || {};

if (process.env.NODE_ENV !== 'production') {
  globalForIaStore.mockSessions = mockSessions;
  globalForIaStore.mockMessages = mockMessages;
}
