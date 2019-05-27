# EU nach Zahlen
Populismus, Wirtschaftskraft, Demografie: Europa verändert sich. Was hat sich getan? Zeichnen Sie die Diagramme und schätzen Sie die Werte.

- Artikel: https://web.br.de/interaktiv/eu-nach-zahlen/
- Redirect: http://br.de/eu-nach-zahlen/

## Verwendung
1. Repository klonen `git clone https://...`
2. Erforderliche Module installieren `npm install`
3. Entwicklungsserver starten `npm start`
4. Projekt bauen mit `npm run build`

Um die Module installieren und die Entwicklerwerkzeuge nutzen zu können, muss vorher die JavaScript-Runtime [Node.js](https://nodejs.org/en/download/) installiert werden. Informationen für Entwickler finden sich weiter unten.

## Daten
- EU-Kommission (2018): [Vertrauen ins EU-Parlament](http://ec.europa.eu/commfrontoffice/publicopinion/index.cfm/Chart/getChart/themeKy/9/groupKy/23)
- Bertelsmann Stiftung (2019): [Fokus der EU](https://www.bertelsmann-stiftung.de/fileadmin/files/BSt/Publikationen/GrauePublikationen/eupinions_EP_Wahlen.pdf)
- EU-Parlament (2019): [Frauenanteil im EU-Parlament](http://www.europarl.europa.eu/news/de/headlines/society/20190226STO28804/frauen-im-europaischen-parlament-infografik)
- Eurostat (2017): [Durchschnittsalter (Median)](https://ec.europa.eu/eurostat/statistics-explained/index.php/Population_structure_and_ageing#Median_age_is_highest_in_Germany_and_Italy)
- Eurostat (2018): [Jugendarbeitslosigkeit](https://ec.europa.eu/eurostat/statistics-explained/index.php?[title=Unemployment_statistics#Youth_unemployment)
- PopuList (2019): [Populistische Parteien](https://popu-list.org/)
- Eurostat (2018): [Anteil ausländischer Bevölkerung](https://ec.europa.eu/eurostat/de/web/products-eurostat-news/-/DDN-20190315-1)
- Eurostat (2019): [Asylbewerberzahlen](http://appsso.eurostat.ec.europa.eu/nui/show.do?dataset=migr_asyappctza&lang=de)
- Eurostat (2019): [Exportanteile](https://ec.europa.eu/eurostat/statistics-explained/images/8/8a/Extra_EU-28_trade_in_goods%2C_2018.png)
- Dalia Research (2017): [Vegetarier und Veganer](https://daliaresearch.com/blog-vegan-vegetarian-halal/?utm_source=Dalia+Newsletter&utm_campaign=e435f9fff8-)

## Anpassen
Neue Fragen können in `scr/index.html` hinzugefügt werden. Die Daten und Einstellungen zur Frage müssen in der Datei `src/data/data.json` ergänzt werden. Die Frage wird mit den Daten über das Attribut `id` verknüpft.

Ein Beispiel für eine neue Schätzfrage. Im HTML wird eine neue `section` mit der `id="trust"` und der Klasse `class="guessable"` hinzugefügt.

```html
<div class="block guessable" data-id="trust">
  <h2>Schätzen Sie den Wert? Wie hoch ist der Anteil der EU-Bürger, die dem EP vertrauen?</h2>

  <div class="content"></div>
  <button class="show">Ergebnis anzeigen</button>
  <button class="reset"><i class="icon-ccw"></i></button>

  <p class="answer"><strong>Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum.</p>
</div>
```

In der JSON-Datei muss dazu ein neues Objekt, in diesem Fall mit der `"id": "trust"`, hinzugefügt werden:

```json
{
  "id": "trust",
  "type": "guess",
  "config": {
    "unit": "%",
    "range": [0, 100],
    "initial": 20
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

## Verbesserungsvorschläge
- Sort: Animation verbessern
- Draw: Labels immer im Vordergrund zeichnen
- Draw: Kein Labels anzeigen, wenn userState == previousState 
- Quiz: Hover-State deaktivieren, wenn Quiz ausgewertet wurde
- `$config` und `$data.data.config` mergen
- Funktion `pretty()` modularisieren
