import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ApiService {
	private readonly logger: Logger = new Logger(ApiService.name);
}
