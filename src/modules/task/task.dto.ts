export interface TaskDto {
  readonly createdAt: string;
  readonly description: string;
  readonly id: string;
  readonly isTickedOff: boolean;
  readonly resumedAt?: string;
  readonly tickedOffAt?: string;
}
