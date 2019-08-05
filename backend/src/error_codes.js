module.exports = {
  missing_parameter: (parameter) => ({
    code: 'missing_parameter',
    description: `Missing required parameter ${parameter}.`
  }),

  invalid_parameter: (parameter, description) => ({
    code: 'invalid_parameter',
    description: `parameter: ${parameter}---${description}`
  }),

  not_found: (description) => ({
    code: 'not_found',
    description
  }),

  token_not_cached: {
    code: 'token_not_cached',
    msg: 'No cached tokens---wait a minute and try again?'
  },

  token_invalid_or_expired: {
    code: 'token_invalid_or_expired',
    msg: 'Token is invalid or expired.'
  },

  jwt_expired: {
    code: 'jwt_expired',
    msg: 'The jwt provided has expired.'
  },

  jwt_invalid: {
    code: 'jwt_invalid',
    msg: 'The jwt provided is invalid.'
  }
}
