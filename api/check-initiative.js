import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check for API key at runtime to prevent Vercel 500 boot errors if missing
    if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(500).json({ error: 'Systemfeil: ANTHROPIC_API_KEY mangler i Vercel sine Environment Variables.' });
    }

    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });

    try {
        const { title, description, objectiveTitle, keyResultTitle } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const contextString = objectiveTitle && keyResultTitle
            ? `Kontekst for initiativet (som det *må* støtte opp under):\n- Overordnet Mål (Objective): ${objectiveTitle}\n- Nøkkelresultat (Key Result): ${keyResultTitle}\n\n`
            : '';

        const systemPrompt = `Du er en coach som hjelper ansatte med å formulere gode initiativer for sine OKR-er.

${contextString}Et godt initiativ skal være:
- Konkret: hva skal gjøres, ikke bare en intensjon
- Handlingsorientert: starter med et verb og beskriver en handling
- Realistisk og avgrenset: ikke for vagt eller for bredt
- Svært relevant for Nøkkelresultatet (Key Result) det tilhører

Det er ikke ett krav at det er tidsavgrenset fordi vi har satt en felles frist på 15.
Vurder initiativet og svar alltid i dette formatet:

**Klar til bruk / Kan forbedres / Trenger omformulering**

**Hva er bra:** [1-2 setninger om det som fungerer]

**Hva mangler:** [1-2 setninger om hva som gjør det svakt, uklart, eller lite relevant for Nøkkelresultatet. Skriv "Ingenting" hvis klar til bruk]

**Prøv dette i stedet:**
- "[Alternativ 1 – mer konkret og avgrenset, og relevant for ${keyResultTitle || 'Nøkkelresultatet'} og ${objectiveTitle || 'Objective'}]"
- "[Alternativ 2 – mer konkret og avgrenset, og relevant for ${keyResultTitle || 'Nøkkelresultatet'} og ${objectiveTitle || 'Objective'}]"

Svar kort og direkte. Ikke vær unødvendig positiv – vær ærlig og konstruktiv.`;

        const userMessage = `Initiativ tittel: ${title}\nBeskrivelse: ${description || 'Ingen beskrivelse'}`;

        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
                { role: 'user', content: userMessage }
            ],
        });

        const feedback = response.content[0].text;

        res.status(200).json({ feedback });
    } catch (error) {
        console.error('Error calling Anthropic API:', error);
        // Safely extract the error message to send back
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: `Failed to check initiative: ${errorMessage}` });
    }
}
