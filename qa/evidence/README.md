# QA evidence

Small, durable evidence that must be reviewed in Git belongs here, under a
folder named after the test id:

```
qa/evidence/MANUAL-FIREFOX-GLASS/contact-375-dark.png
```

Large generated runs belong in `test-results/` (gitignored). Manual results may
reference either root, but only `qa/evidence/` survives a clean checkout, so copy
the specific screenshots needed for long-term acceptance here.

Do not store credentials, personal data, database dumps or unrelated private
files.
