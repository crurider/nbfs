# NBFS — Newborn Baby Feeding Schedule

Jednostavna **Electron desktop aplikacija** za praćenje unosa mleka kod novorođenčadi. Radi offline, čuva podatke lokalno u SQLite bazi i može se pokrenuti kao portable `.exe` bez instalacije.

## Funkcionalnosti

### Unos obroka
Sve kontrole za unos obroka nalaze se u **jednom redu** sa ravnomernim razmacima:
- **Datum** — React date picker, lokalizovan na srpski
- **Vreme početka** — React time picker (npr. `07:30`)
- **Količina** u ml
- **Trajanje obroka** u minutima
- **Vitamini** — da/ne checkbox
- **Probiotik** — da/ne checkbox

### CRUD operacije
- **Dodaj** novi obrok
- **Izmeni** postojeći obrok
- **Obriši** obrok (sa custom confirm modalom)

### Navigacija po danima
- Dugmići **← Juče**, **Danas**, **Sutra →**
- Date picker za izbor bilo kog datuma
- Sve statistike i lista obroka se ažuriraju za izabrani dan

### React pickeri i srpska lokalizacija
Umesto nativnih browser kontrola, aplikacija koristi **React** pickere (`react-datepicker`) koji vizuelno odgovaraju baby temi:
- Kalendar je lokalizovan na **srpski** (`sr-Latn`)
- **Ponedeljak** je prvi dan u nedelji
- Datum je prikazan u formatu **DD.MM.YYYY**
- Vreme je u formatu **HH:mm**
- Izabrani dani i hover stanja koriste istu pastelnu paletu boja kao ostatak aplikacije

### Statistike za izabrani dan

| Kartica | Opis |
|---------|------|
| **Ukupno za dan** | Ukupno popijeno mleko tog dana |
| **Preostalo do mete** | Koliko ml fali do dnevne mete |
| **Prosek na sat** | `ukupno ml / broj sati od prvog do poslednjeg obroka` (fallback: 24h) |
| **Prosek na 3 sata** | `prosek na sat × 3` |
| **Vitamini & Probiotik** | `0/2`, `1/2` ili `2/2` — zeleno kad je `2/2`, crveno inače |

### Bojna indikacija ukupnog unosa
Kartica **Ukupno za dan** menja boju u zavisnosti od toga kako stojiš sa dnevnom metom:
- 🟢 **Zelena** — ukupno je jednako ili više od dnevne mete
- 🟡 **Žuta** — ukupno je ispod mete, a razlika je manja od `50 ml`
- 🔴 **Crvena** — ukupno je ispod mete, a razlika je `50 ml` ili više

### Projekcija do kraja dana
Na osnovu **dnevne mete**, **prosečne porcije** i poslednjeg obroka, aplikacija live predlaže:
- **Obroka do mete** — koliko obroka je potrebno da se dostigne meta
- **Obroka do ponoći** — koliko obroka stane do ponoći sa razmakom od 3 sata
- **Predloženi obroci** — lista vremena narednih obroka
- **Preporučena količina** — po koliko ml treba dati u preostalim obrocima
- **Predviđeno ukupno obroka** — koliko će ukupno biti obroka tog dana
- Ako obroci ne staju do ponoći, aplikacija automatski smanjuje broj obroka i povećava količinu da bi meta bila dostignuta do ponoći
- Ako je ponoć izabranog datuma već prošla u odnosu na trenutno vreme, projekcija prikazuje `0` preostalih obroka i odgovarajuću poruku

### Ostale funkcije
- **Dnevna meta** — podesiva, podrazumevano `400 ml`
- **Prosečna porcija** — podesiva, podrazumevano `60 ml`, koristi se za projekciju
- **Indikatori u listi obroka**:
  - 🔴 crvena strelica — manje od `40 ml`
  - 🟢 zelena strelica — više od `40 ml`
  - bez oznake — tačno `40 ml`
- **Custom confirm modal** — umesto ugrađenih browser dijaloga
- **Aplikacija se pokreće maximizovana**
- **SQLite baza** lokalno u Electron-ovom `userData` folderu (`nbfs.db`)

## Pokretanje u razvoju

```bash
npm install
npm start
```

> Napomena: `npm install` automatski rebuilduje `better-sqlite3` za Electron pomoću `postinstall` skripte.  
> `npm start` pre pokretanja automatski bundle-uje React pickere (`src/picker.bundle.js` i `src/picker.bundle.css`).

## Build portable `.exe`

```bash
npm run rebuild
npm run dist
```

Rezultat se nalazi u `dist/` folderu:

```
dist/NBFS 1.0.0.exe
```

Ovo je **portable** izvršna datoteka — nema potrebe za instalacijom.

## Testiranje baze

```bash
npm rebuild better-sqlite3
node test-db.js
npm run rebuild
```

## Struktura projekta

```
NBFS/
├── src/
│   ├── main.js              # Electron main proces
│   ├── preload.js           # IPC bridge između main i renderer procesa
│   ├── database.js          # SQLite logika
│   ├── index.html           # UI
│   ├── renderer.js          # Frontend logika
│   ├── styles.css           # Stilovi
│   ├── picker-entry.jsx     # React komponente za date/time pickere
│   ├── picker.bundle.js     # Bundle-ovani React pickeri (generiše esbuild)
│   └── picker.bundle.css    # Stilovi React pickera (generiše esbuild)
├── test-db.js               # Testovi SQLite logike
├── package.json
└── README.md
```

## Tehnički detalji

- **Electron** 30
- **better-sqlite3** za SQLite bazu
- **electron-builder** za pakovanje portable `.exe`
- **React** + **react-datepicker** + **date-fns** za custom date/time pickere
- **esbuild** za bundle-ovanje picker komponenti
- Baza se čuva u Electron-ovom `userData` folderu (`nbfs.db`)
- Prozor se automatski pokreće maximizovan
