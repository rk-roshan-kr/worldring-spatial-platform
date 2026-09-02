import { Controller, Post, Body } from '@nestjs/common';
import { ContactService, ContactSubmissionDto } from './contact.service';

@Controller('api/contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  submitInquiry(@Body() dto: ContactSubmissionDto) {
    return this.contactService.submitInquiry(dto);
  }
}
