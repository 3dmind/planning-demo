export interface TaskDto {
  readonly archivedAt?: string;
  readonly createdAt: string;
  readonly description: string;
  readonly id: string;
  readonly isArchived: boolean;
  readonly isTickedOff: boolean;
  readonly resumedAt?: string;
  readonly tickedOffAt?: string;
}
