import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authenticate } from "../../src/middleware/auth";
import env from "../../src/config/env";

// Mock the environment configuration
jest.mock("../../src/config/env", () => ({
  JWT_SECRET: "test-secret"
}));

describe("Authentication Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  describe("authenticate", () => {
    it("should authenticate valid token", () => {
      const token = jwt.sign({ sub: "testuser" }, env.JWT_SECRET, { algorithm: "HS256" });
      mockRequest.headers = { authorization: `Bearer ${token}` };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toEqual({ username: "testuser" });
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should reject missing authorization header", () => {
      mockRequest.headers = {};

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Missing or invalid Authorization header"
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject invalid authorization header format", () => {
      mockRequest.headers = { authorization: "InvalidFormat token" };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Missing or invalid Authorization header"
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject empty token", () => {
      mockRequest.headers = { authorization: "Bearer " };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid token"
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject malformed token", () => {
      mockRequest.headers = { authorization: "Bearer invalid.token.here" };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid token"
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject token with wrong secret", () => {
      const token = jwt.sign({ sub: "testuser" }, "wrong-secret", { algorithm: "HS256" });
      mockRequest.headers = { authorization: `Bearer ${token}` };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid token"
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject expired token", () => {
      const token = jwt.sign({ sub: "testuser" }, env.JWT_SECRET, { 
        algorithm: "HS256",
        expiresIn: "-1h" // Expired 1 hour ago
      });
      mockRequest.headers = { authorization: `Bearer ${token}` };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Token expired"
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject token not yet active", () => {
      const token = jwt.sign({ sub: "testuser" }, env.JWT_SECRET, { 
        algorithm: "HS256",
        notBefore: Math.floor(Date.now() / 1000) + 3600 // Not active for 1 hour
      });
      mockRequest.headers = { authorization: `Bearer ${token}` };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Token not active"
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject token without subject", () => {
      const token = jwt.sign({}, env.JWT_SECRET, { algorithm: "HS256" });
      mockRequest.headers = { authorization: `Bearer ${token}` };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid token payload"
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle token with extra whitespace", () => {
      const token = jwt.sign({ sub: "testuser" }, env.JWT_SECRET, { algorithm: "HS256" });
      mockRequest.headers = { authorization: `Bearer  ${token}  ` };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toEqual({ username: "testuser" });
    });

    it("should reject token with wrong algorithm", () => {
      const token = jwt.sign({ sub: "testuser" }, env.JWT_SECRET, { algorithm: "HS512" });
      mockRequest.headers = { authorization: `Bearer ${token}` };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid token"
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
