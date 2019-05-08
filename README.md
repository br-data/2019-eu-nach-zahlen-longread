# EU nach Zahlen

- Artikel: 
- Redirect:

## Verwendung
1. Repository klonen `git clone https://...`
2. Erforderliche Module installieren `npm install`
3. Entwicklungsserver starten `npm start`
4. Projekt bauen mit `npm run build`

Um die Module installieren und die Entwicklerwerkzeuge nutzen zu können, muss vorher die JavaScript-Runtime [Node.js](https://nodejs.org/en/download/) installiert werden. Informationen für Entwickler finden sich weiter unten.

## Daten

## Anpassen
Neue Fragen können in `scr/index.html` hinzugefügt werden. Die Daten und Einstellungen zur Frage müssen in der Datei `src/data/data.json` ergänzt werden. Die Frage wird mit den Daten über das Attribut `id`, beziehungsweise `data-id` verknüpft.

Ein Beispiel für eine neue Schätzfrage. Im HTML wird eine neue `section` mit der `data-id="trust"` hinzugefügt.

```html
<section data-id="trust">
  <h2>Schätzen Sie den Wert? Wie hoch ist der Anteil der EU-Bürger, die dem EP vertrauen?</h2>

  <div class="content"></div>
  <button class="show">Ergebnis anzeigen</button>
  <button class="reset"><i class="icon-ccw"></i></button>

  <p class="answer"><strong>Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum.</p>
</section>
```

In der JSON-Datei muss dazu ein neues Objekt, in diesem Fall mit der `"id": "trust"`, hinzugefügt werden:

```json
{
  "id": "trust",
  "type": "guess",
  "config": {
    "unit": "%"
  },
  "values": [
    { "key":  50 }
  ]
}
```

Es gilt zu beachten, dass jeder Fragetyp leicht andere Konfigurationsoptionen hat und bestimmte Werteangaben erwartet. Daher empfiehlt es sich die neue Datenobjekte aus der Vorlage `src/data/data.template.json` zu kopieren.

Zur Zeit gibt es vier verschiedene Fragetypen:
- `draw`: Liniendiagramm weiterzeichnen, um die Entwicklung eines bestimmten Indikators zu schätzen
- `sort`: Einträge auf- oder absteigend nach einem bestimmten Indikator sortieren
- `quiz`: eine Auswahl an Fragen, von denen eine richtig ist
- `guess`: einen Wert schätzen
