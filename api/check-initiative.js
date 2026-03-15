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
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const systemPrompt = `Du er en coach som hjelper ansatte med å formulere gode initiativer.

Et godt initiativ skal være:
- Konkret: hva skal gjøres, ikke bare en intensjon
- Handlingsorientert: starter med et verb og beskriver en handling
- Realistisk og avgrenset: ikke for vagt eller for bredt
- Helst tidssatt eller med en tydelig milepæl

Vurder initiativet og svar alltid i dette formatet:

**Klar til bruk / Kan forbedres / Trenger omformulering**

**Hva er bra:** [1-2 setninger om det som fungerer]

**Hva mangler:** [1-2 setninger om hva som gjør det svakt eller uklart, eller "Ingenting" hvis klar til bruk]

**Prøv dette i stedet:**
- "[Alternativ 1 – mer konkret og avgrenset]"
- "[Alternativ 2 – med tydeligere tidspunkt eller milepæl]"

Svar kort og direkte. Ikke vær unødvendig positiv – vær ærlig og konstruktiv.`;

        const userMessage = `Initiativ tittel: ${title}\nBeskrivelse: ${description || 'Ingen beskrivelse'}`;

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
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
        res.status(500).json({ error: 'Failed to check initiative' });
    }
}
