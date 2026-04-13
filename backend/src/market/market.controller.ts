import { Controller, Get } from '@nestjs/common';
import { MarketService, MarketIndex } from './market.service';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('indices')
  async getMarketIndices(): Promise<MarketIndex[]> {
    return this.marketService.getMarketData();
  }
}
