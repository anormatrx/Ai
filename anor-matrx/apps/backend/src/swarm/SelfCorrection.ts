/**
 * ANOR-MATRX - Self-Correction Loop v4
 * 
 * Enables Swarm to retry and self-correct on failures
 */

export interface RetryConfig {
  maxRetries: number;
  backoffMs: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
}

export interface ExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  attempts: number;
  finalAttempt: boolean;
}

export class SelfCorrection {
  private defaultConfig: RetryConfig = {
    maxRetries: 3,
    backoffMs: 1000,
    shouldRetry: (error: any, attempt: number) => {
      // Retry on network errors, timeouts
      const retryable = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'timeout'];
      const isRetryable = retryable.some(code => 
        error?.message?.includes(code) || error?.code === code
      );
      return isRetryable && attempt < 3;
    },
  };

  /**
   * Execute with retry and self-correction
   */
  async executeWithRetry<T>(
    task: string,
    executor: (attempt: number) => Promise<T>,
    config?: Partial<RetryConfig>
  ): Promise<ExecutionResult<T>> {
    const cfg = { ...this.defaultConfig, ...config };
    let lastError: any = null;

    for (let attempt = 1; attempt <= cfg.maxRetries + 1; attempt++) {
      try {
        console.log(`[SelfCorrection] Attempt ${attempt}/${cfg.maxRetries + 1}: ${task}`);
        
        const data = await executor(attempt);
        
        return {
          success: true,
          data,
          attempts: attempt,
          finalAttempt: attempt === cfg.maxRetries + 1,
        };
      } catch (error: any) {
        lastError = error;
        console.error(`[SelfCorrection] Attempt ${attempt} failed:`, error.message);

        const shouldRetry = cfg.shouldRetry?.(error, attempt) ?? (attempt < cfg.maxRetries + 1);
        
        if (!shouldRetry) {
          break;
        }

        // Exponential backoff
        const delay = cfg.backoffMs * Math.pow(2, attempt - 1);
        console.log(`[SelfCorrection] Retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Max retries exceeded',
      attempts: cfg.maxRetries + 1,
      finalAttempt: true,
    };
  }

  /**
   * Evaluate result quality and trigger correction if needed
   */
  async evaluateAndCorrect(
    result: any,
    evaluationCriteria: {
      minLength?: number;
      hasError?: boolean;
      customCheck?: (result: any) => boolean;
    }
  ): Promise<{ needsCorrection: boolean; corrected?: any; reason?: string }> {
    // Check minimum length
    if (evaluationCriteria.minLength && typeof result === 'string' && result.length < evaluationCriteria.minLength) {
      return { needsCorrection: true, reason: 'Output too short' };
    }

    // Check for error markers
    if (evaluationCriteria.hasError && typeof result === 'string') {
      const errorMarkers = ['error:', 'failed', 'exception', 'cannot', 'unable to'];
      const hasError = errorMarkers.some(marker => result.toLowerCase().includes(marker));
      if (hasError) {
        return { needsCorrection: true, reason: 'Output contains error markers' };
      }
    }

    // Custom evaluation
    if (evaluationCriteria.customCheck && !evaluationCriteria.customCheck(result)) {
      return { needsCorrection: true, reason: 'Custom evaluation failed' };
    }

    return { needsCorrection: false };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default SelfCorrection;