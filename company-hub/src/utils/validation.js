// Form validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  const cleanedPhone = phone.replace(/\s/g, '');
  
  if (cleanedPhone.length < 10) {
    return {
      isValid: false,
      error: 'Phone number must be at least 10 digits long'
    };
  }
  
  if (!phoneRegex.test(phone)) {
    return {
      isValid: false,
      error: 'Phone number can only contain digits, spaces, and + - ( ) characters'
    };
  }
  
  return { isValid: true };
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: `${fieldName} is required`
    };
  }
  
  return { isValid: true };
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid URL'
    };
  }
};

export const validateDateOfBirth = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const minAge = 16;
  const maxAge = 100;
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: 'Please enter a valid date'
    };
  }
  
  // Check if date is in the future
  if (date > today) {
    return {
      isValid: false,
      error: 'Date of birth cannot be in the future'
    };
  }
  
  // Calculate age
  const age = Math.floor((today - date) / (365.25 * 24 * 60 * 60 * 1000));
  
  if (age < minAge) {
    return {
      isValid: false,
      error: `You must be at least ${minAge} years old`
    };
  }
  
  if (age > maxAge) {
    return {
      isValid: false,
      error: `Please enter a valid date of birth`
    };
  }
  
  return { isValid: true };
};

export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    maxFileNameLength = 255
  } = options;
  
  const errors = [];
  
  if (!file) {
    return {
      isValid: false,
      error: 'Please select a file'
    };
  }
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }
  
  // Check file name length
  if (file.name.length > maxFileNameLength) {
    errors.push(`File name must be less than ${maxFileNameLength} characters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Form field validator
export const validateField = (value, rules) => {
  const errors = [];
  
  for (const rule of rules) {
    const result = rule(value);
    if (!result.isValid) {
      errors.push(result.error);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Complete form validator
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;
  
  for (const [fieldName, rules] of Object.entries(validationRules)) {
    const value = formData[fieldName];
    const result = validateField(value, rules);
    
    if (!result.isValid) {
      errors[fieldName] = result.errors;
      isValid = false;
    }
  }
  
  return {
    isValid,
    errors
  };
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .replace(/\s+/g, ' '); // Normalize whitespace
};

// Sanitize form data
export const sanitizeFormData = (formData) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};
