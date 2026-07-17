# CareLoad manual microphone test

Use only the fictional Eleanor statement in a current Chromium browser on the
event laptop. Start the fixture path from checkpoint `DAILY_SIGNAL_READY`.

1. Open `/patient/daily-signal`, choose Speak, grant permission, and record:
   “My stomach has felt uncomfortable for a few days and I am more tired than
   usual, but I am still eating and drinking.”
2. Stop recording, edit the transcript, and continue through analysis.
3. Repeat after denying microphone permission and confirm typing is offered.
4. If live transcription is being demonstrated, turn off both the environment
   fallback and persisted fixture toggle first. Do not use real patient data.

- [ ] Permission prompt appears
- [ ] Recording starts
- [ ] Timer updates
- [ ] Recording stops
- [ ] Audio uploads
- [ ] Transcript appears
- [ ] Transcript can be edited
- [ ] Daily Signal analysis continues
- [ ] Permission denial falls back to typing

No physical microphone verification was performed during automated release
closure. Browser recordings are held in memory, posted as multipart data, and
are not written to disk by CareLoad.
