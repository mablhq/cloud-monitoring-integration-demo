// Imports the Google Cloud client library
const monitoring = require("@google-cloud/monitoring");

// Creates a client
const client = new monitoring.MetricServiceClient();

const projectId = process.env["GCLOUD_PROJECT"] || process.env["GCP_PROJECT"];

type Plan = {
  id: string;
  name: string;
};

type JourneyExecution = {
  status: string;
};

exports.handlePlanWebhook = (req: any, res: any) => {
  const body = req.body;
  Promise.resolve(
    processResultsAndWriteMetric(body.plan, body.journey_executions)
  )
    .then(() => res.status(200).end())
    .catch(err => {
      console.error("ERROR:", err);
      res.status(500).end();
    });
};

function processResultsAndWriteMetric(
  plan: Plan,
  journeyExecutions: Array<JourneyExecution>
) {
  const testsFailing = journeyExecutions.filter(execution => {
    return execution.status === "failed";
  });

  const dataPoint = {
    interval: {
      endTime: {
        seconds: Date.now() / 1000
      }
    },
    value: {
      doubleValue: testsFailing.length
    }
  };

  const timeSeriesData = {
    metric: {
      type: `custom.googleapis.com/mabl/failingTests/${plan.id}`,
      labels: {
        plan_name: `${plan.name}`
      }
    },
    resource: {
      type: "global",
      labels: {
        project_id: projectId
      }
    },
    points: [dataPoint]
  };

  const request = {
    name: client.projectPath(projectId),
    timeSeries: [timeSeriesData]
  };

  // Writes time series data
  return client.createTimeSeries(request);
}
