import { getSampleDatasetDefinition, SAMPLE_DATASETS } from "@/lib/data/sample-datasets";
import type { ArtifactSpec, Dataset } from "@/lib/schemas/bokchoys";

const artifactStore = new Map<string, ArtifactSpec>();
const datasetStore = new Map<string, Dataset>();

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function saveArtifacts(artifacts: ArtifactSpec[]) {
  artifacts.forEach((artifact) => {
    artifactStore.set(artifact.id, artifact);
  });
}

export function getArtifactById(id: string) {
  return artifactStore.get(id);
}

export function saveDataset(input: Omit<Dataset, "id">) {
  const dataset = {
    ...input,
    id: createId("dataset"),
  };

  datasetStore.set(dataset.id, dataset);

  return {
    id: dataset.id,
    name: dataset.name,
    rowCount: dataset.rows.length,
    columns: dataset.columns,
  };
}

export function getDatasetById(id?: string) {
  if (!id) {
    return undefined;
  }

  return datasetStore.get(id);
}

export function loadSampleDataset(key: string) {
  const definition = getSampleDatasetDefinition(key);

  if (!definition) {
    throw new Error(`Unknown sample dataset: ${key}`);
  }

  const existing = [...datasetStore.values()].find(
    (dataset) => dataset.source === "sample" && dataset.name === definition.name,
  );

  if (existing) {
    return {
      id: existing.id,
      name: existing.name,
      rowCount: existing.rows.length,
      columns: existing.columns,
    };
  }

  return saveDataset({
    name: definition.name,
    source: "sample",
    columns: definition.columns,
    rows: definition.rows,
  });
}

export function listSampleDatasets() {
  return SAMPLE_DATASETS.map((dataset) => ({
    key: dataset.key,
    name: dataset.name,
    description: dataset.description,
    rowCount: dataset.rows.length,
    columns: dataset.columns,
  }));
}

export function ensureAllSampleDatasetsLoaded(): Dataset[] {
  for (const definition of SAMPLE_DATASETS) {
    const existing = [...datasetStore.values()].find(
      (d) => d.source === "sample" && d.name === definition.name,
    );
    if (!existing) {
      const dataset: Dataset = {
        id: createId("dataset"),
        name: definition.name,
        source: "sample",
        columns: definition.columns,
        rows: definition.rows,
      };
      datasetStore.set(dataset.id, dataset);
    }
  }
  return [...datasetStore.values()];
}

export function getAllDatasets(): Dataset[] {
  return [...datasetStore.values()];
}

export function getOrCreateDefaultSampleDataset() {
  const definition = SAMPLE_DATASETS[0];
  const existing = [...datasetStore.values()].find(
    (dataset) => dataset.source === "sample" && dataset.name === definition.name,
  );

  if (existing) {
    return existing;
  }

  const dataset: Dataset = {
    id: createId("dataset"),
    name: definition.name,
    source: "sample",
    columns: definition.columns,
    rows: definition.rows,
  };

  datasetStore.set(dataset.id, dataset);
  return dataset;
}
