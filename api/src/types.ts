export enum JobStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Job {
  id: string;
  status: JobStatus;
  tokens?: string;
}