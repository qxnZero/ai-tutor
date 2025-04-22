import { NextResponse } from "next/server";
import { logError, logInfo } from "./logger";

/**
 * Standard error response format for API endpoints
 */
export interface ErrorResponse {
  status: "error";
  code: number;
  message: string;
  details?: string;
  errorCode?: string;
}

/**
 * Standard success response format for API endpoints
 */
export interface SuccessResponse<T> {
  status: "success";
  data: T;
}

/**
 * Create a standardized error response
 *
 * @param message Error message
 * @param statusCode HTTP status code
 * @param details Additional error details
 * @param errorCode Custom error code
 * @returns NextResponse with standardized error format
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 400,
  details?: string,
  errorCode?: string
): NextResponse<ErrorResponse> {
  const response: ErrorResponse = {
    status: "error",
    code: statusCode,
    message,
  };

  if (details) {
    response.details = details;
  }

  if (errorCode) {
    response.errorCode = errorCode;
  }

  // Log the error with enhanced logging
  logError(`Error response: ${message}`, {
    statusCode,
    details,
    errorCode,
  });

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Create a standardized success response
 *
 * @param data Response data
 * @param statusCode HTTP status code
 * @returns NextResponse with standardized success format
 */
export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200
): NextResponse<SuccessResponse<T>> {
  // Log the success response
  logInfo(`Success response sent`, { statusCode });

  return NextResponse.json(
    {
      status: "success",
      data,
    },
    { status: statusCode }
  );
}
