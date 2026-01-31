/**
 * Wist-je-dat feiten per datum (MM-DD). Mix van internationale dagen en leuke feiten.
 */
const FACTS: Record<string, string> = {
  "02-01": "Wist je dat het vandaag de Dag van de Vrijheid is?",
  "02-02": "Wist je dat het vandaag Groundhog Day is in de VS – het beestje voorspelt de lente.",
  "02-03": "Wist je dat het vandaag de Dag van de Strijdkrachten is in Thailand?",
  "02-04": "Wist je dat het vandaag Wereldkankerdag is – een dag van bewustwording.",
  "02-05": "Wist je dat het vandaag in Mexico de Dag van de Grondwet is?",
  "02-06": "Wist je dat het vandaag Wereld Zero Tolerance voor Vrouwelijke Genitale Verminking is?",
  "02-07": "Wist je dat het vandaag de Dag van de Bouwvakker is in Rusland?",
  "01-31": "Wist je dat het vandaag Internationale Dag van de Pinguïn is?",
};

export function getFactForDate(dateStr: string): string {
  const mmdd = dateStr.slice(5, 10);
  return FACTS[mmdd] ?? "Elke dag is een feest – vandaag ook.";
}
