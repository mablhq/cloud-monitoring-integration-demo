// Imports the Google Cloud client library
import * as protos from '@google-cloud/monitoring/build/protos/protos';

const monitoring = require("@google-cloud/monitoring");

// Creates a client
const client = new monitoring.MetricServiceClient();

const projectId = process.env["GCLOUD_PROJECT"] ?? process.env["GCP_PROJECT"];

import express = require("express");

type Plan = {
  id: string;
  name: string;
};

type JourneyExecution = {
  status: string;
};

type CreateMetricRequest = {
  plan: Plan;
  journey_executions: JourneyExecution[];
}

exports.handlePlanWebhook = async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const body = req.body as CreateMetricRequest;
    await processResultsAndWriteMetric(body.plan, body.journey_executions);

    console.log(`Successfully wrote metric`);
    res.status(200).end();
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).end();
  }
};

function processResultsAndWriteMetric(
  plan: Plan,
  journeyExecutions: Array<JourneyExecution>
): Promise<[protos.google.protobuf.IEmpty, protos.google.monitoring.v3.ICreateTimeSeriesRequest | undefined, {} | undefined]> {
  const timeSeriesData = buildTimeSeriesData(plan, journeyExecutions);

  const request = {
    name: client.projectPath(projectId),
    timeSeries: [timeSeriesData]
  };

  // Writes time series data
  return client.createTimeSeries(request);
}

export function buildTimeSeriesData(plan: Plan, journeyExecutions: Array<JourneyExecution>) {
  const testsFailing = journeyExecutions.filter(execution => execution.status === "failed");

  return {
    metric: {
      type: `custom.googleapis.com/mabl/failingTests/${plan.id}`
    },
    resource: {
      type: "global",
      labels: {
        project_id: projectId
      }
    },
    points: [{
      interval: {
        endTime: {
          seconds: Date.now() / 1000
        }
      },
      value: {
        doubleValue: testsFailing.length
      }
    }]
  };
}
