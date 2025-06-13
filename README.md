# Generator Prezentacji Biznesowych z n8n

Aplikacja webowa stworzona w React do generowania prezentacji biznesowych przy użyciu n8n.

🌐 **[Zobacz aplikację na żywo](https://ai-academy-vert.vercel.app/)**

## Funkcjonalności

- Interfejs użytkownika w formie czatu
- Zbieranie kluczowych informacji o biznesie:
  - Pomysł na biznes
  - Grupa docelowa
  - Propozycja wartości
  - Źródła przychodów
- Integracja z n8n poprzez webhook
- Automatyczne generowanie prezentacji biznesowej
- Ładny interfejs użytkownika z animacją ładowania

## Technologie

- React
- Vite
- Tailwind CSS
- n8n (webhook)
- Vercel (hosting)

## Instalacja

1. Sklonuj repozytorium:
```bash
git clone https://github.com/lukaszaitools/ai_academy.git
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Uruchom aplikację w trybie deweloperskim:
```bash
npm run dev
```

## Użycie

1. Wprowadź swój pomysł na biznes w polu tekstowym
2. Odpowiedz na pytania dotyczące:
   - Grupy docelowej
   - Propozycji wartości
   - Źródeł przychodów
3. Poczekaj na wygenerowanie prezentacji

## Konfiguracja n8n

### Konfiguracja Webhooka (odbieranie danych)

1. Upewnij się, że masz działający webhook w n8n
2. Webhook URL: `https://lukai.app.n8n.cloud/webhook-test/a713d6ed-70ed-4eb5-9ff1-1147fe2f4274`
3. Metoda: POST
4. Format danych wejściowych:
```json
{
  "businessIdea": "string",
  "targetAudience": "string",
  "valueProposition": "string",
  "revenueStreams": "string"
}
```

### Konfiguracja HTTP Request (wysyłanie danych do aplikacji)

1. Dodaj node "HTTP Request" w n8n
2. Skonfiguruj parametry:
   - Metoda: POST
   - URL: `https://ai-academy-vert.vercel.app/api/presentation`
   - Headers:
     ```json
     {
       "Content-Type": "application/json"
     }
     ```

3. Skonfiguruj Body (wybierz jeden z dwóch sposobów):

   **Sposób 1 - Expression:**
   ```javascript
   {
     "status": "completed",
     "content": $json["output"]
   }
   ```

   **Sposób 2 - JSON:**
   ```json
   {
     "status": "completed",
     "content": "={{ $json[\"output\"] }}"
   }
   ```

4. Response handling:
   - Success: Status 200
   - Error: Status 400-500

## Struktura projektu

```
src/
  ├── components/
  │   ├── ChatScreen.jsx    # Główny komponent czatu
  │   └── LoadingScreen.jsx # Komponent ekranu ładowania
  ├── App.tsx               # Główny komponent aplikacji
  ├── main.jsx             # Punkt wejścia aplikacji
  └── style.css            # Style globalne i Tailwind
```

## Wdrożenie

Aplikacja jest automatycznie wdrażana na Vercel przy każdym push'u do głównej gałęzi repozytorium.
- Produkcyjna wersja: [https://ai-academy-vert.vercel.app/](https://ai-academy-vert.vercel.app/)

## Licencja

MIT 