import { NextResponse } from 'next/server';
import type { OperationType } from '@/types';

const SYSTEM_PROMPT = `Tu es un expert comptable et analyste financier. Tu vas analyser un relevé bancaire, un export CSV ou du texte brut de transactions et extraire les opérations financières.

RÈGLES STRICTES :
- Ignore les lignes de solde initial, solde final, et totaux récapitulatifs
- Ignore les en-têtes de colonnes et titres
- Interprète correctement débit/crédit : débit = décaissement, crédit = encaissement
- Les montants négatifs = décaissement, positifs = encaissement
- Normalise les dates au format YYYY-MM-DD
- Si la date est absente, utilise null
- Propose des catégories simples et pertinentes pour operationTypeSuggestion
- Réponds UNIQUEMENT en JSON valide, sans texte, sans markdown, sans balises

FORMAT DE RÉPONSE JSON ATTENDU :
{
  "operations": [
    {
      "label": "Description de l'opération",
      "amount": 100.00,
      "kind": "encaissement",
      "operationTypeSuggestion": "Catégorie suggérée",
      "date": "2024-01-15",
      "notes": "Informations complémentaires optionnelles"
    }
  ],
  "summary": {
    "totalEncaissement": 0.00,
    "totalDecaissement": 0.00,
    "count": 0
  }
}

CATÉGORIES SUGGÉRÉES (utilise ces exemples ou adapte) :
- Encaissement client
- Commission banque
- Abonnement
- Salaire
- Loyer
- Facture fournisseur
- Frais divers
- Remboursement
- Virement
- Prélèvement automatique`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { inputType, content, operationTypes } = body as {
      inputType: 'text' | 'file';
      content: string;
      operationTypes: OperationType[];
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY non configurée. Ajoutez-la dans .env.local' },
        { status: 500 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le contenu envoyé est vide.' },
        { status: 400 }
      );
    }

    // Build context with existing operation types for better suggestions
    const existingTypes = operationTypes.map((ot) => ot.label).join(', ');
    const typeContext = existingTypes
      ? `\nTypes d'opérations existants dans l'application : ${existingTypes}\nPréfère utiliser ces types si pertinent.`
      : '';

    const userMessage = `Voici un ${inputType === 'file' ? 'fichier de relevé bancaire' : 'relevé bancaire en texte brut'} à analyser :

${typeContext}

---
${content}
---

Extrait toutes les opérations financières et réponds uniquement en JSON valide.`;

    // Call Gemini API directly via fetch
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userMessage }],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topP: 0.95,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        {
          error: `Erreur API Gemini: ${geminiResponse.status} ${geminiResponse.statusText}`,
          details: errorData,
        },
        { status: 502 }
      );
    }

    const geminiData = await geminiResponse.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!rawText) {
      return NextResponse.json(
        { error: "L'agent AI n'a retourné aucun résultat." },
        { status: 500 }
      );
    }

    // Parse JSON response (strip markdown fences if present)
    let parsed;
    try {
      const clean = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsed = JSON.parse(clean);
    } catch {
      console.error('Failed to parse Gemini response:', rawText);
      return NextResponse.json(
        {
          error: "Impossible de parser la réponse de l'agent AI.",
          raw: rawText.slice(0, 500),
        },
        { status: 500 }
      );
    }

    // Validate and normalize
    const operations = (parsed.operations ?? []).map(
      (op: {
        label?: string;
        amount?: number | string;
        kind?: string;
        operationTypeSuggestion?: string;
        date?: string;
        notes?: string;
      }) => ({
        label: String(op.label ?? 'Opération'),
        amount: Math.abs(parseFloat(String(op.amount ?? 0))),
        kind:
          op.kind === 'encaissement' || op.kind === 'decaissement'
            ? op.kind
            : parseFloat(String(op.amount ?? 0)) >= 0
            ? 'encaissement'
            : 'decaissement',
        operationTypeSuggestion: String(op.operationTypeSuggestion ?? 'Frais divers'),
        date: op.date ?? null,
        notes: op.notes ?? null,
        selected: true,
      })
    );

    const totalEncaissement = operations
      .filter((op: { kind: string }) => op.kind === 'encaissement')
      .reduce((sum: number, op: { amount: number }) => sum + op.amount, 0);
    const totalDecaissement = operations
      .filter((op: { kind: string }) => op.kind === 'decaissement')
      .reduce((sum: number, op: { amount: number }) => sum + op.amount, 0);

    return NextResponse.json({
      operations,
      summary: {
        totalEncaissement,
        totalDecaissement,
        count: operations.length,
      },
    });
  } catch (error) {
    console.error('Finance agent error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
