/**
 * Logger Class - Centralized logging utility with emoji prefixes and color support
 * Provides consistent logging across the entire application
 */

class Logger {
  constructor(moduleName = "APP") {
    this.moduleName = moduleName;
    this.timestamps = true;
  }

  /**
   * Get formatted timestamp
   */
  getTimestamp() {
    if (!this.timestamps) return "";
    const now = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `[${now}]`;
  }

  /**
   * Info level logging (blue)
   * Usage: logger.info("User logged in")
   */
  info(message, data = null) {
    const prefix = `ℹ️  [${this.moduleName}]`;
    const timestamp = this.getTimestamp();
    if (data) {
      console.log(`${timestamp} ${prefix} ${message}`, data);
    } else {
      console.log(`${timestamp} ${prefix} ${message}`);
    }
  }

  /**
   * Success level logging (green)
   * Usage: logger.success("User registered successfully")
   */
  success(message, data = null) {
    const prefix = `✅ [${this.moduleName}]`;
    const timestamp = this.getTimestamp();
    if (data) {
      console.log(`${timestamp} ${prefix} ${message}`, data);
    } else {
      console.log(`${timestamp} ${prefix} ${message}`);
    }
  }

  /**
   * Error level logging (red)
   * Usage: logger.error("Database connection failed", error)
   */
  error(message, error = null) {
    const prefix = `❌ [${this.moduleName}]`;
    const timestamp = this.getTimestamp();
    if (error) {
      console.error(`${timestamp} ${prefix} ${message}`, error);
    } else {
      console.error(`${timestamp} ${prefix} ${message}`);
    }
  }

  /**
   * Warning level logging (yellow)
   * Usage: logger.warn("OTP expired")
   */
  warn(message, data = null) {
    const prefix = `⚠️  [${this.moduleName}]`;
    const timestamp = this.getTimestamp();
    if (data) {
      console.warn(`${timestamp} ${prefix} ${message}`, data);
    } else {
      console.warn(`${timestamp} ${prefix} ${message}`);
    }
  }

  /**
   * Debug level logging (purple)
   * Usage: logger.debug("Checking user details", user)
   */
  debug(message, data = null) {
    const prefix = `🔍 [${this.moduleName}]`;
    const timestamp = this.getTimestamp();
    if (data) {
      console.log(`${timestamp} ${prefix} ${message}`, data);
    } else {
      console.log(`${timestamp} ${prefix} ${message}`);
    }
  }

  /**
   * Start operation logging
   * Usage: logger.start("Registering new user")
   */
  start(message, data = null) {
    const prefix = `📝 [${this.moduleName}]`;
    const timestamp = this.getTimestamp();
    if (data) {
      console.log(`${timestamp} ${prefix} [START] ${message}`, data);
    } else {
      console.log(`${timestamp} ${prefix} [START] ${message}`);
    }
  }

  /**
   * Security/Auth related logging
   * Usage: logger.security("JWT token verified")
   */
  security(message, data = null) {
    const prefix = `🔐 [${this.moduleName}]`;
    const timestamp = this.getTimestamp();
    if (data) {
      console.log(`${timestamp} ${prefix} ${message}`, data);
    } else {
      console.log(`${timestamp} ${prefix} ${message}`);
    }
  }

  /**
   * Database operation logging
   * Usage: logger.database("User saved to database")
   */
  database(message, data = null) {
    const prefix = `💾 [${this.moduleName}]`;
    const timestamp = this.getTimestamp();
    if (data) {
      console.log(`${timestamp} ${prefix} ${message}`, data);
    } else {
      console.log(`${timestamp} ${prefix} ${message}`);
    }
  }

  /**
   * OTP related logging
   * Usage: logger.otp("OTP generated", {otp: "123456"})
   */
  otp(message, data = null) {
    const prefix = `🔢 [${this.moduleName}]`;
    const timestamp = this.getTimestamp();
    if (data) {
      console.log(`${timestamp} ${prefix} ${message}`, data);
    } else {
      console.log(`${timestamp} ${prefix} ${message}`);
    }
  }

  /**
   * Email/SMS sending logging
   * Usage: logger.notification("Email sent to user")
   */
  notification(message, data = null) {
    const prefix = `📧 [${this.moduleName}]`;
    const timestamp = this.getTimestamp();
    if (data) {
      console.log(`${timestamp} ${prefix} ${message}`, data);
    } else {
      console.log(`${timestamp} ${prefix} ${message}`);
    }
  }

  /**
   * API/HTTP request logging
   * Usage: logger.http("GET /api/users")
   */
  http(message, data = null) {
    const prefix = `🌐 [${this.moduleName}]`;
    const timestamp = this.getTimestamp();
    if (data) {
      console.log(`${timestamp} ${prefix} ${message}`, data);
    } else {
      console.log(`${timestamp} ${prefix} ${message}`);
    }
  }

  /**
   * Performance/timing logging
   * Usage: logger.performance("Query took 45ms")
   */
  performance(message, data = null) {
    const prefix = `⏱️  [${this.moduleName}]`;
    const timestamp = this.getTimestamp();
    if (data) {
      console.log(`${timestamp} ${prefix} ${message}`, data);
    } else {
      console.log(`${timestamp} ${prefix} ${message}`);
    }
  }

  /**
   * Raw/generic logging with custom emoji
   * Usage: logger.raw("🚀", "Server started")
   */
  raw(emoji, message, data = null) {
    const prefix = `${emoji} [${this.moduleName}]`;
    const timestamp = this.getTimestamp();
    if (data) {
      console.log(`${timestamp} ${prefix} ${message}`, data);
    } else {
      console.log(`${timestamp} ${prefix} ${message}`);
    }
  }

  /**
   * Create a new logger instance with a different module name
   * Usage: const userLogger = logger.module("USER_SERVICE")
   */
  module(moduleName) {
    return new Logger(moduleName);
  }
}

export default new Logger("APP");
