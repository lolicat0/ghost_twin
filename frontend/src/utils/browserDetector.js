/**
 * Browser Detection and Validation Utility
 * Detects browser type, version, and security features
 */

export function detectBrowser() {
  const userAgent = navigator.userAgent
  const browserInfo = {
    name: 'Unknown',
    version: 'Unknown',
    supported: false,
    securityFeatures: [],
    issues: []
  }

  // Detect Chrome/Chromium
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg') && !userAgent.includes('OPR')) {
    browserInfo.name = 'Chrome'
    const match = userAgent.match(/Chrome\/(\d+)/)
    if (match) {
      browserInfo.version = parseInt(match[1])
      browserInfo.supported = browserInfo.version >= 90 // Chrome 90+
      if (browserInfo.version < 90) {
        browserInfo.issues.push('Please update Chrome to the latest version for better security')
      }
    }
  }
  // Detect Edge
  else if (userAgent.includes('Edg')) {
    browserInfo.name = 'Edge'
    const match = userAgent.match(/Edg\/(\d+)/)
    if (match) {
      browserInfo.version = parseInt(match[1])
      browserInfo.supported = browserInfo.version >= 90
    }
  }
  // Detect Firefox
  else if (userAgent.includes('Firefox')) {
    browserInfo.name = 'Firefox'
    const match = userAgent.match(/Firefox\/(\d+)/)
    if (match) {
      browserInfo.version = parseInt(match[1])
      browserInfo.supported = browserInfo.version >= 88
    }
  }
  // Detect Safari
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browserInfo.name = 'Safari'
    const match = userAgent.match(/Version\/(\d+)/)
    if (match) {
      browserInfo.version = parseInt(match[1])
      browserInfo.supported = browserInfo.version >= 14
    }
  }

  // Check security features
  browserInfo.securityFeatures = []
  
  // Check HTTPS
  if (window.location.protocol === 'https:') {
    browserInfo.securityFeatures.push('HTTPS Enabled')
  } else {
    browserInfo.issues.push('Site should be accessed via HTTPS for security')
  }

  // Check if cookies are enabled
  try {
    document.cookie = 'test=1'
    if (document.cookie.indexOf('test=') !== -1) {
      browserInfo.securityFeatures.push('Cookies Enabled')
      document.cookie = 'test=1; expires=Thu, 01 Jan 1970 00:00:00 UTC'
    }
  } catch (e) {
    browserInfo.issues.push('Cookies are disabled. Please enable cookies to continue.')
  }

  // Check localStorage
  try {
    localStorage.setItem('test', '1')
    localStorage.removeItem('test')
    browserInfo.securityFeatures.push('Local Storage Available')
  } catch (e) {
    browserInfo.issues.push('Local Storage is not available')
  }

  // Check WebSocket support
  if ('WebSocket' in window) {
    browserInfo.securityFeatures.push('WebSocket Supported')
  } else {
    browserInfo.issues.push('WebSocket is not supported in this browser')
  }

  return browserInfo
}

export function validateBrowserForLogin() {
  const browserInfo = detectBrowser()
  const validation = {
    valid: true,
    warnings: [],
    errors: []
  }

  // Check if browser is supported
  if (!browserInfo.supported) {
    validation.warnings.push(
      `${browserInfo.name} ${browserInfo.version} may not be fully supported. Please update to the latest version.`
    )
  }

  // Check for critical issues
  if (browserInfo.issues.length > 0) {
    validation.errors.push(...browserInfo.issues)
    validation.valid = false
  }

  // Recommend modern browsers
  if (!['Chrome', 'Edge', 'Firefox', 'Safari'].includes(browserInfo.name)) {
    validation.warnings.push(
      'For the best experience, please use Chrome, Edge, Firefox, or Safari'
    )
  }

  return {
    ...validation,
    browserInfo
  }
}

export function getBrowserIcon() {
  const browserInfo = detectBrowser()
  const iconMap = {
    Chrome: '🟢',
    Edge: '🔵',
    Firefox: '🟠',
    Safari: '🔴',
    Unknown: '⚪'
  }
  return iconMap[browserInfo.name] || '⚪'
}





