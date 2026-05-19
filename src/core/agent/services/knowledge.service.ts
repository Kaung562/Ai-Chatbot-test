import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class KnowledgeService {
  private cachedKnowledge: string | null = null;

  getKnowledge(): string {
    if (this.cachedKnowledge) {
      return this.cachedKnowledge;
    }

const filePath = path.join(
      __dirname,
      '..',
      'prompt',
      'knowledge.txt',
    );

    // Read file
    const knowledge = fs.readFileSync(filePath, 'utf-8');

    // Cache it in memory
    this.cachedKnowledge = knowledge;

    return knowledge;
  }

   refreshKnowledge(): void {
    this.cachedKnowledge = null;
  }
}