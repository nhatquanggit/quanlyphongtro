import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto, MarkPaidDto, GenerateInvoicesDto, InvoiceQueryDto } from './dto/invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Post('generate-all')
  @ApiOperation({ summary: 'Generate invoices for all active contracts' })
  generateAll(@Body() generateDto: GenerateInvoicesDto) {
    return this.invoicesService.generateInvoicesForAll(generateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices with filters' })
  findAll(@Query() query: InvoiceQueryDto) {
    return this.invoicesService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get invoice statistics' })
  getStats(@Query('propertyId') propertyId?: string) {
    return this.invoicesService.getStats(propertyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice' })
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Patch(':id/mark-paid')
  @ApiOperation({ summary: 'Mark invoice as paid' })
  markPaid(@Param('id') id: string, @Body() markPaidDto: MarkPaidDto) {
    return this.invoicesService.markPaid(id, markPaidDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invoice' })
  remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }
}
