## Repro result

- V7 ordered chunks: assets/a-D_2AunLE.js, assets/b-sY_ZoMrU.js, assets/c-CTp9319i.js, assets/preload-helper-BXl3LOEh.js, assets/dyn-b-D7205jQD.js, assets/shared-BP0xZ7vB.js, assets/dyn-c-BS7Ltlo9.js
- V8 ordered chunks: assets/a-QBbzyAYH.js, assets/b-BTvC8h1w.js, assets/c-C5jHdnnS.js, assets/dyn-b-D40FS-Hx.js, assets/dyn-c-BbiRgxKp.js, assets/preload-helper-rov5CBGT.js, assets/shared-B4zBkPxN.js

## Entry imports missing from emitted dist

```json
{
  "v7": [],
  "v8": [
    {
      "entry": "a",
      "importedFile": "assets/shared-B4zBkPxN.js"
    },
    {
      "entry": "c",
      "importedFile": "assets/shared-B4zBkPxN.js"
    }
  ]
}
```

## Missing shared css (buggy collector)

- V7: a, c
- V8: a, c

## Entry diff for buggy collector (normalized)

```json
{}
```

## Entry diff for stable collector (normalized)

```json
{}
```
