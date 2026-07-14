import { NextResponse } from "next/server";

function emptyExtraction() {
  return {
    source: "",
    client: "",
    projectName: "",
    projectLocation: "",
    market: "",
    bidType: "",
    dueDate: "",
    estimatedValue: "",
    relationshipOwner: "",
    relationshipContext: "",
    bdTouchpoint: "",
    notes: "",
  };
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Upload an ITB, email, meeting note, or screenshot." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      fields: emptyExtraction(),
      message: "Upload received. Add OPENAI_API_KEY to extract pursuit fields automatically.",
    });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type || "application/octet-stream"};base64,${buffer.toString("base64")}`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_EXTRACTION_MODEL ?? "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Extract preconstruction pursuit fields from this BuildingConnected invitation, estimating email, meeting note, survey, lunch note, dinner note, charity event note, existing bid follow-up, or screenshot. Return only compact JSON with keys: source, client, projectName, projectLocation, market, bidType, dueDate, estimatedValue, relationshipOwner, relationshipContext, bdTouchpoint, notes. Use empty strings when unknown.",
            },
            { type: "input_image", image_url: dataUrl, detail: "high" },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Extraction failed. Enter the fields manually." },
      { status: 502 },
    );
  }

  const result = (await response.json()) as { output_text?: string };
  let fields = emptyExtraction();

  try {
    fields = { ...fields, ...JSON.parse(result.output_text ?? "{}") };
  } catch {
    fields.notes = result.output_text ?? "";
  }

  return NextResponse.json({
    configured: true,
    fields,
    message: "Fields extracted. Review before submitting to preconstruction.",
  });
}
