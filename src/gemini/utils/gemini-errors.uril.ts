import { StatusCodes } from 'http-status-codes';

export const isUnsupportedJsonFormat = (err: any) => {
  return (
    err?.code === StatusCodes.BAD_REQUEST &&
    err?.status === 'INVALID_ARGUMENT' &&
    err?.message.includes('JSON mode')
  );
};

export const isInvalidApiKey = (err: any) => {
  return (
    err?.code === StatusCodes.BAD_REQUEST &&
    err?.status === 'INVALID_ARGUMENT' &&
    err?.message.includes('API key not valid')
  );
};

export const isApiKeyPermissionDenied = (err: any) => {
  return (
    err?.code === StatusCodes.FORBIDDEN &&
    err?.status === 'PERMISSION_DENIED' &&
    err?.message.includes('API key not valid')
  );
};

export const isTooManyRequestsToGemini = (err: any) => {
  return (
    err?.code === StatusCodes.TOO_MANY_REQUESTS &&
    err?.status === 'RESOURCE_EXHAUSTED'
  );
};

export const isTimeoutExceed = (err: any) => {
  return (
    err?.code === StatusCodes.GATEWAY_TIMEOUT &&
    err?.status === 'DEADLINE_EXCEEDED'
  );
};

export const isUnavailable = (err: any) => {
  return (
    err?.code === StatusCodes.SERVICE_UNAVAILABLE &&
    err?.status === 'UNAVAILABLE'
  );
};
