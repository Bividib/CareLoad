# CareLoad final rehearsal log

| Run | Mode | Duration | Completed | Recovery tested | Defects |
|---|---|---:|---|---|---|
| 1 | Fixture |  |  |  |  |
| 2 | Fixture |  |  |  |  |
| 3 | Fixture |  |  |  |  |

## Exact rehearsal steps

1. At `/demo`, seed `INITIAL_PLAN_READY`, then open Today.
2. Complete the typed Daily Signal with the fictional statement from the final
   runbook.
3. Answer the two displayed questions, review, confirm, and send.
4. Show the waiting state; navigate away, return, and refresh.
5. Show the conspicuously labelled simulated response.
6. Trigger the synthetic cardiology update.
7. Show the calculated +28 actions and retained unresolved conflict.
8. Preview the proposed plan and confirm the active plan is unchanged.
9. Accept the proposal and show updated Today.
10. In at least one run, refresh while the response is pending, process due
    response jobs, and recover from checkpoint `SIMULATION_READY`.

Automated Playwright runs do not fill this table. The presenter must record
three observed manual runs.
