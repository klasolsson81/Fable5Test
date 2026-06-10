# 3D-huvudmodell (valfritt)

Lägg din AI-genererade huvudmodell (t.ex. från Tripo eller Meshy) här som:

```
public/models/klas-head.glb
```

Konstruktionen upptäcker filen automatiskt och ersätter relief-bysten med
den riktiga 3D-modellen — hologram-material (grön tint, scanlines, fresnel,
glitch) appliceras och huvudet roterar långsamt. Saknas filen används
relief-bysten som vanligt.

Exporttips från Tripo:
- Format: **GLB** med inbakade texturer (standardexporten funkar)
- Ingen Draco-komprimering
- Håll filen rimlig i storlek (< ~10 MB) — den laddas bara i röda pillret
