import type { ArtifactSpec } from "@/lib/schemas/bokchoys";

export function renderArtifactToHtml(artifact: ArtifactSpec) {
  return `
    <section data-artifact-kind="${artifact.kind}">
      <h1>${artifact.title}</h1>
      <pre>${JSON.stringify(artifact, null, 2)}</pre>
    </section>
  `.trim();
}

