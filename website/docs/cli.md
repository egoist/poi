---
sidebar: auto
---

# CLI Reference

## Base Directory

Set the base directory to load files via CLI flag `--baseDir`:

```bash
# Load config files, resolve entries from ./web folder
poi build --baseDir web
```

You should use a directory which contains `package.json` as the base directory, generally you don't need to change this unless you're sure what you're doing.

The default value is `.` which is the current working directory `process.cwd()`.

## Entry files

Set the entry files via CLI argument: 

```bash
# Default to index.js
poi build
# Set custom entrypoints
poi build foo.js bar.js
```

When set it will override the [entry](config.md#entry) property in config file.

## Inspect Webpack Config

To print webpack config as a string in your terminal, you can add a `--inspectWebpack` flag to the command you run:

```bash
poi dev foo.js --inspectWebpack
poi build --inspectWebpack
```

## Progress Bar

Toggle the progress bar for webpack, it's always disabled on CI.

```bash
poi dev --no-progress
poi build --no-progress
```