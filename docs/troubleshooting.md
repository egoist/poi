# Troubleshooting

## Multiple assets emit to the same filename

This usually happens when you try to use `filename` option and build app in production mode, because in production the **auto-splitting for vendor code** is enabled, so there's also `vendor.js` besides your app bundle, to fix this you can disable `vendor` option.
