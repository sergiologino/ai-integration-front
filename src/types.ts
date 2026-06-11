// Типы для AI-интеграционного сервиса

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  expiresIn: number;
}

export interface NeuralNetwork {
  id: string;
  name: string;
  displayName: string;
  provider: string;
  networkType: string;
  apiUrl: string;
  modelName: string;
  isActive: boolean;
  isFree: boolean;
  priority: number;
  timeoutSeconds: number;
  maxRetries: number;
  requestMapping?: Record<string, any>;
  responseMapping?: Record<string, any>;
  costPerTokenRub?: number;
  wordsPerToken?: number;
  secondsPerToken?: number;
  connectionInstruction?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NetworkCreateRequest {
  name: string;
  displayName: string;
  provider: string;
  networkType: string;
  apiUrl: string;
  apiKey: string;
  modelName: string;
  isActive: boolean;
  isFree: boolean;
  priority: number;
  timeoutSeconds: number;
  maxRetries: number;
  requestMapping: Record<string, any>;
  responseMapping: Record<string, any>;
  costPerTokenRub?: number;
  wordsPerToken?: number;
  secondsPerToken?: number;
  connectionInstruction?: string;
}

export interface ClientApplication {
  id: string;
  name: string;
  description: string;
  apiKey: string;
  isActive: boolean;
  totalTokensRemaining?: number;
  estimatedDaysRemaining?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientCreateRequest {
  name: string;
  description: string;
  isActive: boolean;
}

export interface RequestLog {
  id: string;
  externalUserId: string;
  neuralNetworkId: string;
  neuralNetworkName: string;
  clientApplicationId: string;
  clientApplicationName: string;
  requestType: string;
  prompt: string;
  response: string;
  success: boolean;
  errorMessage?: string;
  tokensUsed?: number;
  costUsd?: number | string;
  provider?: string;
  createdAt: string;
}

export interface UsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokensUsed: number;
  totalCostRub?: string | number;
  totalCostUsd?: string | number;
  monthlyTotalTokensUsed?: number;
  monthlyTotalCostUsd?: string | number;
  monthlyTokensByProvider?: Record<string, number>;
  monthlyCostUsdByProvider?: Record<string, string | number>;
  requestsByNetwork: Record<string, number>;
  requestsByClient: Record<string, number>;
  tokensByNetwork?: Record<string, number>;
  costByNetwork?: Record<string, string | number>;
  tokensByClient?: Record<string, number>;
  costByClient?: Record<string, string | number>;
  networkDetails?: Array<{
    networkId: string;
    networkName: string;
    networkDisplayName: string;
    provider: string;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalTokensUsed: number;
    totalCostRub?: string | number;
    costPerTokenRub?: string | number;
    requestsByClient?: Record<string, number>;
    tokensByClient?: Record<string, number>;
    costByClient?: Record<string, string | number>;
  }>;
  clientDetails?: Array<{
    clientId: string;
    clientName: string;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalTokensUsed: number;
    totalCostRub?: string | number;
    requestsByNetwork?: Record<string, number>;
    tokensByNetwork?: Record<string, number>;
    costByNetwork?: Record<string, string | number>;
  }>;
  providerDetails?: Array<{
    provider: string;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalTokensUsed: number;
    totalCostUsd?: string | number;
    totalCostRub?: string | number;
  }>;
}

export interface ClientNetworkAccess {
  id: string;
  clientId: string;
  clientName: string;
  networkId: string;
  networkDisplayName: string;
  networkProvider: string;
  networkType: string;
  dailyRequestLimit?: number;
  monthlyRequestLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserAccessGroup {
  userId: string | null;
  userEmail: string;
  userFullName: string;
  services: ClientServiceGroup[];
}

export interface ClientServiceGroup {
  clientId: string;
  clientName: string;
  clientDescription: string;
  isAdminService: boolean;
  networks: NetworkAccessInfo[];
}

export interface NetworkAccessInfo {
  accessId: string;
  networkId: string;
  networkDisplayName: string;
  networkProvider: string;
  networkType: string;
  dailyRequestLimit?: number;
  monthlyRequestLimit?: number;
  priority?: number;
}

export interface PaymentStats {
  paymentId: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  planName: string;
  planDisplayName: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  transactionId?: string;
}

export interface AccessStats {
  totalAccesses: number;
  accessesWithLimits: number;
  unlimitedAccesses: number;
}

export interface GrantAccessRequest {
  clientId: string;
  networkId: string;
  dailyRequestLimit?: number | null;
  monthlyRequestLimit?: number | null;
}

export interface NetworkLimit {
  id: string;
  neuralNetworkId: string;
  userType: string;
  limitPeriod: string;
  requestLimit: number;
}

