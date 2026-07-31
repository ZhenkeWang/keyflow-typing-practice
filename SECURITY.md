# Security Policy

## Supported versions

Security fixes are provided for the current version on the default branch.

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability.

Use GitHub's **Report a vulnerability** option in the Security tab of the
repository. Include:

- A description of the issue and its impact
- Reproduction steps or a minimal proof of concept
- Affected browser, runtime, or deployment configuration
- Suggested remediation, if known

Avoid accessing data that is not yours and do not perform denial-of-service
testing against the public deployment.

You should receive an initial acknowledgement within seven days. Confirmed
issues will be prioritized according to severity and disclosed after a fix is
available.

## Deployment responsibility

Self-hosters are responsible for:

- Keeping dependencies and runtimes updated
- Protecting server-side secrets
- Configuring Supabase Row Level Security
- Restricting CORS and authentication settings
- Reviewing external content sources and privacy requirements
