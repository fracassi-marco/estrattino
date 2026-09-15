# Spese BBVA

App Expo (React Native + TypeScript) per visualizzare le spese del conto BBVA a partire da un export xlsx (es. `Downloads/bbva.xlsx`). Vedi il grafico mensile entrate/uscite in home, il riepilogo di ogni mese e il dettaglio dei movimenti con filtro entrate/uscite. I movimenti già importati non vengono mai duplicati, anche importando più volte lo stesso file o file diversi con transazioni sovrapposte.

## Requisiti

- Node.js 20+ e npm
- [Expo Go](https://expo.dev/go) sul telefono, oppure un emulatore Android (Android Studio) / simulatore iOS (Xcode, solo su macOS)

## Avvio in locale

```bash
npm install
npx expo start
```

Poi scegli come aprire l'app:

- **Telefono fisico**: apri Expo Go e inquadra il QR code stampato nel terminale (telefono e computer devono essere sulla stessa rete Wi-Fi).
- **Emulatore Android**: `npx expo start --android` (richiede un emulatore già avviato o Android Studio installato).
- **Simulatore iOS** (solo macOS): `npx expo start --ios`.

Se la porta 8081 è occupata da un altro progetto Expo, avvia su un'altra porta:

```bash
npx expo start --port 8085
```

### Importare i movimenti

Dalla home, tocca **Importa** e seleziona il file xlsx esportato da BBVA (es. `bbva.xlsx` scaricato in Downloads). Puoi reimportarlo o importarne altri sovrapposti: i movimenti duplicati vengono riconosciuti e ignorati automaticamente.

## Deploy (build per gli store)

Il deploy usa [EAS Build](https://docs.expo.dev/build/introduction/), il servizio di build cloud di Expo.

### 1. Setup iniziale (una tantum)

```bash
npm install -g eas-cli
eas login
eas build:configure
```

`eas build:configure` crea `eas.json` e chiede/imposta un `projectId` legato al tuo account Expo. Prima di buildare per gli store, aggiungi in `app.json` gli identificatori dell'app:

```json
{
  "expo": {
    "ios": { "bundleIdentifier": "com.tuonome.spese" },
    "android": { "package": "com.tuonome.spese" }
  }
}
```

### 2. Build

```bash
# Build di test installabile su un device/emulatore (APK Android, senza account Apple)
eas build --platform android --profile preview

# Build per gli store
eas build --platform android --profile production
eas build --platform ios --profile production
eas build --platform all --profile production
```

La build gira sui server Expo; a fine processo ottieni un link per scaricare il file (`.apk`/`.aab` o `.ipa`).

- Per iOS serve un account [Apple Developer](https://developer.apple.com/) (a pagamento); `eas build` guida nella creazione/registrazione dei certificati.
- Per Android puoi generare tu la keystore o lasciarla gestire da EAS.

### 3. Pubblicazione sugli store

```bash
eas submit --platform android
eas submit --platform ios
```

Richiede rispettivamente un account Google Play Console e Apple Developer già configurati.

### Aggiornamenti rapidi (OTA, senza ripassare dagli store)

Per le modifiche solo JS/asset (non native), puoi pubblicare un aggiornamento OTA agli utenti che hanno già installato l'app:

```bash
eas update --branch production
```
