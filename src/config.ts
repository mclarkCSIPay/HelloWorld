/**
 * Server Configuration Module
 * 
 * Defines the ServerConfiguration interface and validation logic for the Hello World server.
 * Validates port numbers, host addresses, and complete configuration objects.
 */

/**
 * Server configuration interface
 */
export interface ServerConfiguration {
  port: number;
  host: string;
  environment: string;
}

/**
 * Validates that a port number is within the valid range (1024-65535)
 * 
 * @param port - The port number to validate
 * @returns true if the port is valid, false otherwise
 */
export function validatePort(port: number): boolean {
  return Number.isInteger(port) && port >= 1024 && port <= 65535;
}

/**
 * Validates that a host is a valid IP address or hostname
 * 
 * @param host - The host address to validate
 * @returns true if the host is valid, false otherwise
 */
export function validateHost(host: string): boolean {
  if (typeof host !== 'string' || host.trim().length === 0) {
    return false;
  }

  // Check for valid IPv4 address
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(host)) {
    const parts = host.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  // Check for valid IPv6 address (simplified check)
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  if (ipv6Regex.test(host)) {
    return true;
  }

  // Check for valid hostname
  // Hostname can contain alphanumeric characters, hyphens, and dots
  // Must start with alphanumeric, can't end with hyphen
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return hostnameRegex.test(host);
}

/**
 * Validates a complete server configuration object
 * 
 * @param config - The configuration object to validate
 * @returns true if the configuration is valid, false otherwise
 */
export function validateConfiguration(config: ServerConfiguration): boolean {
  if (!config || typeof config !== 'object') {
    return false;
  }

  if (!validatePort(config.port)) {
    return false;
  }

  if (!validateHost(config.host)) {
    return false;
  }

  if (typeof config.environment !== 'string' || config.environment.trim().length === 0) {
    return false;
  }

  return true;
}
