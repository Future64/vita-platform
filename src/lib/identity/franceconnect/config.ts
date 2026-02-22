// Endpoints officiels FranceConnect v2
// Source : https://docs.partenaires.franceconnect.gouv.fr/fs/fs-integration/env-sandbox-fc/

const SANDBOX_URLS = {
  authorize: 'https://fcp-low.sbx.dev-franceconnect.fr/api/v2/authorize',
  token:     'https://fcp-low.sbx.dev-franceconnect.fr/api/v2/token',
  userinfo:  'https://fcp-low.sbx.dev-franceconnect.fr/api/v2/userinfo',
  logout:    'https://fcp-low.sbx.dev-franceconnect.fr/api/v2/session/end',
  jwks:      'https://fcp-low.sbx.dev-franceconnect.fr/api/v2/jwks',
};

const PRODUCTION_URLS = {
  authorize: 'https://app.franceconnect.gouv.fr/api/v2/authorize',
  token:     'https://app.franceconnect.gouv.fr/api/v2/token',
  userinfo:  'https://app.franceconnect.gouv.fr/api/v2/userinfo',
  logout:    'https://app.franceconnect.gouv.fr/api/v2/session/end',
  jwks:      'https://app.franceconnect.gouv.fr/api/v2/jwks',
};

export const FC_URLS = process.env.FC_ENV === 'production'
  ? PRODUCTION_URLS
  : SANDBOX_URLS;

export const FC_CONFIG = {
  clientId:     process.env.FC_CLIENT_ID ?? '',
  clientSecret: process.env.FC_CLIENT_SECRET ?? '',
  callbackUrl:  process.env.FC_CALLBACK_URL ?? '',
  // Scopes — doivent correspondre a ce qui est autorise dans Datapass
  scopes: 'openid given_name family_name birthdate birthplace birthcountry gender email',
};
