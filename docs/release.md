# Odoo Forge Release Guide

## Goal

This guide defines the smallest repeatable release flow for Odoo Forge internal 1.0.

Internal 1.0 only includes:

- `odoo-forge-bundle`
- `odoo-forge`

## Publish Order

Always publish in this order:

1. `odoo-forge-bundle`
2. `odoo-forge`

The CLI depends on the bundle package at the same version, so the bundle must already exist in the target registry.

## Pre-Release Checklist

Before publishing, make sure:

1. `config/product.json` version is correct
2. both package versions match
3. `npm run release:check` passes
4. you are logged in to the target npm registry

## Release Check Command

```bash
npm run release:check
```

This command will:

1. sync the bundle payload
2. run the CLI test suite
3. create a tarball for `odoo-forge-bundle`
4. create a tarball for `odoo-forge`

If any step fails, do not publish.

## Publish Commands

Log in first if needed:

```bash
npm login
```

Then publish the two packages in order:

```bash
npm publish --workspace odoo-forge-bundle
npm publish --workspace odoo-forge
```

If you use a private registry, add the appropriate `--registry` or environment-based registry configuration before publishing.

## Post-Release Smoke Test

Use a clean machine or a temporary user profile.

```bash
npm i -g odoo-forge
odoo-forge install
odoo-forge doctor
```

Verify:

1. `~/.agents/skills/` contains the installed Odoo Forge skills
2. `odoo-forge doctor` reports `Skills installed: yes`
3. `odoo-forge doctor` reports a non-zero `Installed skills count`

## Windows Manual Smoke Checklist

Run these checks on a real Windows machine before calling the release stable:

1. `npm i -g odoo-forge`
2. run `odoo-forge install`
3. run `odoo-forge doctor`
4. confirm `%USERPROFILE%\\.agents\\skills` contains the installed Odoo Forge skills
5. confirm `odoo-forge doctor` shows `Skills installed: yes`

## Cleanup

`npm pack` leaves `.tgz` files in the workspace root. Remove them after verification if they are no longer needed.
