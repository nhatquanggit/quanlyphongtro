import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { ContractQueryDto, CreateContractDto, UpdateContractDto } from './dto/contract.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contract (3 to 12 months)' })
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contracts with filters' })
  findAll(@Query() query: ContractQueryDto) {
    return this.contractsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get contract statistics' })
  getStats(@Query('propertyId') propertyId?: string) {
    return this.contractsService.getStats(propertyId);
  }

  @Get(':id/printable')
  @ApiOperation({ summary: 'Get printable contract HTML' })
  getPrintable(@Param('id') id: string) {
    return this.contractsService.getPrintableContract(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract by ID' })
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update contract' })
  update(@Param('id') id: string, @Body() updateContractDto: UpdateContractDto) {
    return this.contractsService.update(id, updateContractDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contract' })
  remove(@Param('id') id: string) {
    return this.contractsService.remove(id);
  }
}
