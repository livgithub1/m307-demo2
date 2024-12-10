import { createApp } from "./config.js";

/*connection to database*/
const app = createApp({
  user: "lunliv",
  host: "bbz.cloud",
  database: "lunliv",
  password: "YtCeLv3TSEcXdq5R69nM",
  port: 30211,
});
//
/* Startseite Hallooo */
app.get("/", async function (req, res) {
  res.render("start", {});
});

app.get("/impressum", async function (req, res) {
  res.render("impressum", {});
});

/* Wichtig! Diese Zeilen müssen immer am Schluss der Website stehen! */
app.listen(3010, () => {
  console.log(`Example app listening at http://localhost:3010`);
});

/*dynamische Route*/
