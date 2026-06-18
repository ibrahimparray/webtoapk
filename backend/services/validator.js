function validatePackageName(packageName) {
  if (!packageName || typeof packageName !== 'string') {
    return false;
  }

  const packageRegex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;

  if (!packageRegex.test(packageName)) {
    return false;
  }

  const segments = packageName.split('.');
  const javaKeywords = [
    'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
    'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
    'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
    'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new',
    'package', 'private', 'protected', 'public', 'return', 'short', 'static',
    'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
    'transient', 'try', 'void', 'volatile', 'while',
  ];

  for (const segment of segments) {
    if (javaKeywords.includes(segment)) {
      return false;
    }
  }

  return true;
}

function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'https:') {
      return false;
    }
    if (!urlObj.hostname || urlObj.hostname === 'localhost') {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

function validateAppName(appName) {
  if (!appName || typeof appName !== 'string') {
    return false;
  }

  if (appName.length < 3 || appName.length > 50) {
    return false;
  }

  const invalidChars = /[<>&"']/;
  if (invalidChars.test(appName)) {
    return false;
  }

  return true;
}

function validateInput({ siteUrl, appName, packageName }) {
  const errors = [];

  if (!validateUrl(siteUrl)) {
    errors.push('Invalid URL. Must be a valid HTTPS URL (e.g., https://example.com)');
  }

  if (!validateAppName(appName)) {
    errors.push('Invalid app name. Must be 3-50 characters and cannot contain <, >, &, ", or \'');
  }

  if (!validatePackageName(packageName)) {
    errors.push('Invalid package name. Must follow Android package naming conventions (e.g., com.example.app)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateInput,
  validatePackageName,
  validateUrl,
  validateAppName,
};
