# Privacy Notes

This document describes the default behavior of the open-source KeyFlow
application. A third-party deployment may use different infrastructure and
should publish its own privacy notice.

## Local data

KeyFlow can store preferences, training history, progress, and session state in
the browser. Clearing site storage removes this local data.

## Optional cloud features

When a deployer configures Supabase and a user chooses to create an account,
authentication and synchronized training records are sent to that Supabase
project. The deployer controls retention, access policies, and deletion.

## External content

The server-side trending route may retrieve public practice material from:

- Google News RSS
- Wikimedia pageview APIs
- Hacker News APIs

The route returns text used for typing practice and does not intentionally send
the user's typed content to those sources.

## AI analysis

The included coaching logic can analyze session metrics locally. If a deployer
connects an external AI provider in the future, that deployment must disclose
which data is sent and obtain any required consent.

## Sensitive information

Do not use personal, confidential, or regulated information as custom practice
text. Self-hosters must never expose service-role credentials or provider keys
to browser code.
