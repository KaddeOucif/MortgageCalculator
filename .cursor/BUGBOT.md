# Bugbot review rules

- Flag any changes to `src/calculations/` that lack corresponding test updates in `tests/`.
- Verify currency conversion uses SEK as the hub and preserves round-trip accuracy.
- Check that monetary formatting respects each currency's locale (SEK, EUR, GBP).
