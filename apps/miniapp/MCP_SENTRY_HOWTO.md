# Sentry MCP Integration - How-To Guide

## Overview

This guide explains how to use the Sentry MCP server in Claude Code to analyze errors and issues **before** starting to fix code. The MCP integration allows you to query Sentry directly from Claude Code to get real-time production error data.

## Prerequisites

✅ MCP Sentry server is already configured in `~/.claude.json`:
```json
"sentry": {
  "type": "http",
  "url": "https://mcp.sentry.dev/mcp",
  "headers": {
    "Authorization": "Bearer sntryu_..."
  }
}
```

✅ Sentry project: `va-pc/tg-final`

## Available MCP Sentry Tools

### 1. **whoami** - Verify Authentication
Check your Sentry authentication and access.

**Example:**
```
mcp__sentry__whoami()
```

### 2. **find_organizations** - List Organizations
Find organizations you have access to.

**Example:**
```
mcp__sentry__find_organizations()
mcp__sentry__find_organizations({ query: "va-pc" })
```

### 3. **find_projects** - List Projects
Find projects in an organization.

**Example:**
```
mcp__sentry__find_projects({
  organizationSlug: "va-pc"
})
```

### 4. **search_issues** - Search for Grouped Issues
Search for grouped issues/problems - returns a LIST, not counts.

**When to use:**
- "show me issues"
- "unresolved issues"
- "critical bugs from last week"
- "issues assigned to me"

**Example:**
```
mcp__sentry__search_issues({
  organizationSlug: "va-pc",
  naturalLanguageQuery: "unresolved errors from last 7 days",
  limit: 10
})
```

### 5. **search_events** - Search Events & Count/Aggregate
Search for individual events AND perform counts/aggregations.

**When to use for COUNTS:**
- "how many errors today"
- "count of database failures"
- "total tokens used by AI"

**When to use for EVENTS:**
- "error logs from last hour"
- "trace spans for slow API calls"

**Example:**
```
mcp__sentry__search_events({
  organizationSlug: "va-pc",
  naturalLanguageQuery: "how many errors happened today",
  limit: 10
})

mcp__sentry__search_events({
  organizationSlug: "va-pc",
  naturalLanguageQuery: "error logs from the last hour with timestamps"
})
```

### 6. **get_issue_details** - Get Specific Issue Details
Get detailed information about a specific Sentry issue by ID or URL.

**Example:**
```
mcp__sentry__get_issue_details({
  issueUrl: "https://sentry.io/issues/PROJECT-123"
})

mcp__sentry__get_issue_details({
  organizationSlug: "va-pc",
  issueId: "TG-FINAL-123"
})
```

### 7. **analyze_issue_with_seer** - AI Root Cause Analysis
Use Sentry's AI to analyze production errors and get detailed root cause analysis with specific code fixes.

**When to use:**
- Detailed root cause analysis
- Specific code fixes and implementation guidance
- Understanding why an error is happening in production

**Example:**
```
mcp__sentry__analyze_issue_with_seer({
  issueUrl: "https://sentry.io/issues/PROJECT-123"
})

mcp__sentry__analyze_issue_with_seer({
  organizationSlug: "va-pc",
  issueId: "TG-FINAL-456",
  instruction: "Focus on the database connection errors"
})
```

## Recommended Workflow

### Step 1: List Recent Issues
Before starting any fix, check what issues exist:

```
mcp__sentry__search_issues({
  organizationSlug: "va-pc",
  naturalLanguageQuery: "unresolved errors from last 24 hours",
  limit: 20
})
```

### Step 2: Filter by Route/Feature
Use the route tags we configured to focus on specific areas:

```
mcp__sentry__search_issues({
  organizationSlug: "va-pc",
  naturalLanguageQuery: "errors tagged with route:pcs",
  limit: 10
})
```

### Step 3: Get Issue Details
Pick an issue and get full details:

```
mcp__sentry__get_issue_details({
  organizationSlug: "va-pc",
  issueId: "TG-FINAL-123"
})
```

### Step 4: Analyze with AI (Optional)
For complex issues, use Sentry's AI analysis:

```
mcp__sentry__analyze_issue_with_seer({
  organizationSlug: "va-pc",
  issueId: "TG-FINAL-123"
})
```

### Step 5: Analyze Events (if needed)
Look at individual error events with timestamps:

```
mcp__sentry__search_events({
  organizationSlug: "va-pc",
  naturalLanguageQuery: "error events for issue TG-FINAL-123 with stack traces"
})
```

### Step 6: Start Fixing
Now you have all the context to fix the issue properly!

## Filtering by User

Since we configured user context, you can filter errors by specific Telegram users:

```
mcp__sentry__search_issues({
  organizationSlug: "va-pc",
  naturalLanguageQuery: "errors from telegram user 123456789"
})
```

## Filtering by Route/Feature

We configured route tags (home, pcs, product, filters, configurator):

```
mcp__sentry__search_issues({
  organizationSlug: "va-pc",
  naturalLanguageQuery: "errors on product detail page",
  limit: 10
})

mcp__sentry__search_events({
  organizationSlug: "va-pc",
  naturalLanguageQuery: "errors tagged with route:filters from today"
})
```

## Filtering by Release

Filter errors by specific version:

```
mcp__sentry__search_issues({
  organizationSlug: "va-pc",
  naturalLanguageQuery: "errors in release miniapp@0.1.0"
})
```

## Common Queries Examples

### Check Production Health
```
mcp__sentry__search_events({
  organizationSlug: "va-pc",
  naturalLanguageQuery: "how many errors in the last hour",
  limit: 1
})
```

### Find Most Common Errors
```
mcp__sentry__search_issues({
  organizationSlug: "va-pc",
  naturalLanguageQuery: "most frequent errors this week",
  limit: 5
})
```

### Check Specific Feature
```
mcp__sentry__search_issues({
  organizationSlug: "va-pc",
  naturalLanguageQuery: "errors in PC configurator from last 7 days"
})
```

### User-Specific Issues
```
mcp__sentry__search_events({
  organizationSlug: "va-pc",
  naturalLanguageQuery: "errors from Telegram user 123456 today"
})
```

## Best Practices

1. **Always check Sentry BEFORE fixing code** - Understand the issue first
2. **Use natural language queries** - The MCP translates them automatically
3. **Start broad, then narrow** - List all issues, then focus on specific ones
4. **Check release versions** - Make sure you're fixing the right version
5. **Use route tags** - Filter by feature area (home, pcs, product, etc.)
6. **Analyze with AI for complex issues** - Let Sentry's AI help with root cause

## Troubleshooting

### "No issues found"
- Check that errors are actually being sent to Sentry
- Verify DSN is correct in .env.local
- Check Sentry web UI to confirm issues exist

### "Unauthorized"
- MCP Bearer token might have expired
- Check ~/.claude.json for correct token

### "Organization not found"
- Double-check organization slug is "va-pc"
- Verify you have access to the organization

## Support

- Sentry Docs: https://docs.sentry.io
- MCP Sentry: https://mcp.sentry.dev
- Project Issues: https://va-pc.sentry.io/issues/

---

**Remember:** The goal of MCP Sentry integration is to **analyze first, fix second**. Always understand the error before writing code!
