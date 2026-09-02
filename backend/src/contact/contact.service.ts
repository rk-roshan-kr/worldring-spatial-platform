import { Injectable } from '@nestjs/common';

export interface ContactSubmissionDto {
  name: string;
  email: string;
  interestType: 'TECHNICAL_COLLABORATOR' | 'EARLY_USER' | 'ROBOTICS_AI_RESEARCHER' | 'GENERAL_INQUIRY';
  message: string;
  organization?: string;
}

@Injectable()
export class ContactService {
  private submissions: (ContactSubmissionDto & { id: string; receivedAt: string })[] = [];

  submitInquiry(dto: ContactSubmissionDto) {
    const record = {
      id: `inq_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ...dto,
      receivedAt: new Date().toISOString(),
    };
    this.submissions.push(record);
    console.log(`[Contact] Received inquiry from ${dto.name} (${dto.email}) - Category: ${dto.interestType}`);
    
    return {
      success: true,
      message: 'Inquiry received. Thank you for your interest in our spatial prototype.',
      inquiryId: record.id,
      stage: 'PROTOTYPE_SANDBOX',
    };
  }
}
